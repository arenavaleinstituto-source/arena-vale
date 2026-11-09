import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buscarVideosYT, detectarAoVivo, embedAoVivo, estaAoVivo, parsearFeed } from './youtube';

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
