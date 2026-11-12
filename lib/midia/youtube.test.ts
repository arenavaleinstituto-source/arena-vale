import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buscarCortesYT, buscarListaYT, buscarVideosYT, detectarAoVivo, embedAoVivo, estaAoVivo, parsearFeed, parsearPlaylistItems, playlistsDoCanal } from './youtube';

const amostra = fs.readFileSync(path.join(import.meta.dirname, '__amostras__/feed-tvarenavale.xml'), 'utf8');
const CANAL = 'UCBTQ97bWA6VqK2a6qv80dIg';

function fetchQueFalha(): typeof fetch {
  return (() => Promise.reject(new Error('sem rede'))) as unknown as typeof fetch;
}
function fetchCom(status: number, corpo: string): typeof fetch {
  return (() => Promise.resolve(new Response(corpo, { status }))) as unknown as typeof fetch;
}

describe('feed do YouTube', () => {
  it('lê os vídeos da amostra real do canal', () => {
    const videos = parsearFeed(amostra);
    expect(videos.length).toBeGreaterThanOrEqual(1);
    expect(videos[0].id).toHaveLength(11);
    expect(videos[0].capa).toBe(`https://i.ytimg.com/vi/${videos[0].id}/hqdefault.jpg`);
    expect(videos[0].link).toBe(`https://www.youtube.com/watch?v=${videos[0].id}`);
    expect(videos[0].titulo.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(videos[0].publicadoEm))).toBe(false);
  });

  it('desfaz entidades HTML do título', () => {
    const xml = '<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Gol &amp; festa &quot;AV&quot;</title><published>2026-11-01T10:00:00+00:00</published></entry></feed>';
    expect(parsearFeed(xml)[0].titulo).toBe('Gol & festa "AV"');
  });

  it('tira as hashtags do título (mas não deixa o título vazio)', () => {
    const xml = (t: string) => `<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>${t}</title><published>2026-11-01T10:00:00+00:00</published></entry></feed>`;
    expect(parsearFeed(xml('Grande final #futebol #loucosporfutebol #esporte'))[0].titulo).toBe('Grande final');
    expect(parsearFeed(xml('#futebol #esporte'))[0].titulo).toBe('#futebol #esporte');
  });

  it('feed vazio ou inválido vira lista vazia', () => {
    expect(parsearFeed('')).toEqual([]);
    expect(parsearFeed('<html>nada')).toEqual([]);
  });

  it('rede fora do ar ou erro 500 viram lista vazia', async () => {
    expect(await buscarVideosYT(CANAL, fetchQueFalha())).toEqual([]);
    expect(await buscarVideosYT(CANAL, fetchCom(500, 'erro'))).toEqual([]);
  });

  it('busca com sucesso devolve os vídeos', async () => {
    expect((await buscarVideosYT(CANAL, fetchCom(200, amostra))).length).toBeGreaterThan(0);
  });
});

describe('ao vivo', () => {
  it('detecta isLiveNow', () => {
    expect(detectarAoVivo('xx "isLiveNow":true yy')).toBe(true);
    expect(detectarAoVivo('xx "isLiveNow":false yy')).toBe(false);
    expect(detectarAoVivo('')).toBe(false);
  });

  it('erro de rede conta como fora do ar', async () => {
    expect(await estaAoVivo(CANAL, fetchQueFalha())).toBe(false);
    expect(await estaAoVivo(CANAL, fetchCom(200, '"isLiveNow":true'))).toBe(true);
  });

  it('a checagem do ao vivo vale no máximo 60 s (com a página de 60 s, fica em ~2 min no total)', async () => {
    let init: { next?: { revalidate?: number } } | undefined;
    const f = ((_u: string, i: typeof init) => {
      init = i;
      return Promise.resolve(new Response(''));
    }) as unknown as typeof fetch;
    await estaAoVivo(CANAL, f);
    expect(init?.next?.revalidate).toBeLessThanOrEqual(60);
  });

  it('player do ao vivo sem cookies', () => {
    expect(embedAoVivo(CANAL)).toBe(`https://www.youtube-nocookie.com/embed/live_stream?channel=${CANAL}`);
  });
});

function itemPl(id: string, titulo: string, publicadoEm: string) {
  return { snippet: { title: titulo, publishedAt: publicadoEm, resourceId: { videoId: id }, thumbnails: { high: { url: 'x' } } } };
}

describe('YouTube pela API oficial', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('playlists derivadas do canal', () => {
    expect(playlistsDoCanal(CANAL)).toEqual({
      videos: 'UULFBTQ97bWA6VqK2a6qv80dIg',
      lives: 'UULVBTQ97bWA6VqK2a6qv80dIg',
      shorts: 'UUSHBTQ97bWA6VqK2a6qv80dIg',
    });
  });

  it('parsearPlaylistItems descarta privados/apagados, tira hashtags e monta a capa', () => {
    const r = parsearPlaylistItems({
      items: [
        itemPl('abc', 'Golaço #futsal #arenavale', '2026-11-10T10:00:00Z'),
        itemPl('p1', 'Private video', '2026-11-10T10:00:00Z'),
        itemPl('d1', 'Deleted video', '2026-11-10T10:00:00Z'),
      ],
    });
    expect(r).toEqual([
      { id: 'abc', titulo: 'Golaço', publicadoEm: '2026-11-10T10:00:00Z', capa: 'https://i.ytimg.com/vi/abc/hqdefault.jpg', link: 'https://www.youtube.com/watch?v=abc' },
    ]);
    expect(parsearPlaylistItems(null)).toEqual([]);
    expect(parsearPlaylistItems({ items: 'x' })).toEqual([]);
  });

  it('buscarListaYT monta a URL com a chave', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'chave-teste');
    const urls: string[] = [];
    const f = ((u: string) => {
      urls.push(u);
      return Promise.resolve(new Response(JSON.stringify({ items: [itemPl('a1', 'Corte', '2026-11-10T10:00:00Z')] })));
    }) as unknown as typeof fetch;
    const r = await buscarListaYT('UUSHBTQ97bWA6VqK2a6qv80dIg', 12, f);
    expect(r).toHaveLength(1);
    expect(urls[0]).toContain('playlistItems?part=snippet&maxResults=12&playlistId=UUSHBTQ97bWA6VqK2a6qv80dIg&key=');
  });

  it('buscarListaYT sem chave não chama a rede', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', '');
    let chamou = false;
    const f = (() => {
      chamou = true;
      return Promise.resolve(new Response('{}'));
    }) as unknown as typeof fetch;
    expect(await buscarListaYT('UUSHx', 12, f)).toEqual([]);
    expect(chamou).toBe(false);
  });

  it('buscarListaYT com 403 devolve vazio', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'chave-teste');
    expect(await buscarListaYT('UUSHx', 12, fetchCom(403, '{"error":{}}'))).toEqual([]);
  });

  it('buscarVideosYT com chave junta vídeos e lives, mais novo primeiro, até 15', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'chave-teste');
    const f = ((u: string) => {
      const lives = u.includes('playlistId=UULV');
      const itens = Array.from({ length: 10 }, (_, i) =>
        itemPl(`${lives ? 'l' : 'v'}${i}`, `T${i}`, `2026-11-${String(lives ? 20 - i : 19 - i).padStart(2, '0')}T10:00:00Z`),
      );
      return Promise.resolve(new Response(JSON.stringify({ items: itens })));
    }) as unknown as typeof fetch;
    const r = await buscarVideosYT(CANAL, f);
    expect(r).toHaveLength(15);
    expect(r[0].id).toBe('l0');
    expect(r[1].id).toBe('v0');
    const datas = r.map((v) => Date.parse(v.publicadoEm));
    expect([...datas].sort((a, b) => b - a)).toEqual(datas);
  });

  it('buscarVideosYT sem chave continua usando o RSS', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', '');
    expect((await buscarVideosYT(CANAL, fetchCom(200, amostra))).length).toBeGreaterThan(0);
  });

  it('buscarCortesYT lê a lista de Shorts', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'chave-teste');
    const urls: string[] = [];
    const f = ((u: string) => {
      urls.push(u);
      return Promise.resolve(new Response(JSON.stringify({ items: [] })));
    }) as unknown as typeof fetch;
    await buscarCortesYT(CANAL, 12, f);
    expect(urls[0]).toContain('playlistId=UUSHBTQ97bWA6VqK2a6qv80dIg');
  });
});
