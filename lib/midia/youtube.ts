/**
 * YouTube do canal TV Arena Vale (spec Fase 3, seção 6).
 * Com YOUTUBE_API_KEY: listas do canal pela API oficial; sem ela, o feed RSS.
 * O ao vivo é lido na página /live do canal.
 * Qualquer falha devolve "vazio" ou "fora do ar" — o site nunca quebra.
 */

export type VideoYT = { id: string; titulo: string; publicadoEm: string; capa: string; link: string };

const ENTIDADES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

function desfazerEntidades(t: string): string {
  return t
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&(amp|lt|gt|quot|#39|apos);/g, (m) => ENTIDADES[m] ?? m);
}

/** Títulos dos Shorts vêm cheios de hashtags: some com elas, mas nunca deixa o título vazio. */
function semHashtags(t: string): string {
  const limpo = t.replace(/(^|\s)#[^\s#]+/g, ' ').replace(/\s+/g, ' ').trim();
  return limpo || t;
}

function campo(bloco: string, tag: string): string | null {
  const m = bloco.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : null;
}

export function parsearFeed(xml: string): VideoYT[] {
  if (!xml) return [];
  const videos: VideoYT[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = campo(m[1], 'yt:videoId');
    const titulo = campo(m[1], 'title');
    const publicadoEm = campo(m[1], 'published');
    if (!id || !titulo || !publicadoEm) continue;
    videos.push({
      id,
      titulo: semHashtags(desfazerEntidades(titulo)),
      publicadoEm,
      capa: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      link: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return videos;
}

type FetchComCache = (url: string, init?: RequestInit & { next?: { revalidate?: number } }) => Promise<Response>;

/** Listas automáticas do canal: vídeos (UULF), lives (UULV) e Shorts (UUSH). */
export function playlistsDoCanal(channelId: string): { videos: string; lives: string; shorts: string } {
  const resto = channelId.replace(/^UC/, '');
  return { videos: `UULF${resto}`, lives: `UULV${resto}`, shorts: `UUSH${resto}` };
}

const ESCONDIDOS = new Set(['Private video', 'Deleted video']);

/** Resposta de playlistItems.list (YouTube Data API v3) → vídeos. */
export function parsearPlaylistItems(json: unknown): VideoYT[] {
  const itens = (json as { items?: unknown } | null)?.items;
  if (!Array.isArray(itens)) return [];
  const videos: VideoYT[] = [];
  for (const it of itens) {
    const s = (it as { snippet?: { title?: string; publishedAt?: string; resourceId?: { videoId?: string } } })?.snippet;
    const id = s?.resourceId?.videoId;
    const titulo = s?.title;
    if (!id || !titulo || !s?.publishedAt || ESCONDIDOS.has(titulo)) continue;
    videos.push({
      id,
      titulo: semHashtags(titulo),
      publicadoEm: s.publishedAt,
      capa: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      link: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return videos;
}

/** Uma lista do canal pela API oficial. Sem chave ou com erro: lista vazia. */
export async function buscarListaYT(playlistId: string, limite: number, f: typeof fetch = fetch): Promise<VideoYT[]> {
  const chave = process.env.YOUTUBE_API_KEY;
  if (!chave) return [];
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${limite}` +
      `&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(chave)}`;
    const r = await (f as FetchComCache)(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return [];
    return parsearPlaylistItems(await r.json());
  } catch {
    return [];
  }
}

/** Cortes (Shorts) do canal, mais novos primeiro. */
export async function buscarCortesYT(channelId: string, limite = 12, f: typeof fetch = fetch): Promise<VideoYT[]> {
  return buscarListaYT(playlistsDoCanal(channelId).shorts, limite, f);
}

/** Últimos vídeos: com chave, vídeos + lives pela API; sem chave, o RSS público. */
export async function buscarVideosYT(channelId: string, f: typeof fetch = fetch): Promise<VideoYT[]> {
  if (process.env.YOUTUBE_API_KEY) {
    const p = playlistsDoCanal(channelId);
    const [videos, lives] = await Promise.all([buscarListaYT(p.videos, 15, f), buscarListaYT(p.lives, 15, f)]);
    return [...videos, ...lives].sort((a, b) => Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm)).slice(0, 15);
  }
  return buscarVideosRss(channelId, f);
}

async function buscarVideosRss(channelId: string, f: typeof fetch): Promise<VideoYT[]> {
  try {
    const r = await (f as FetchComCache)(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return [];
    return parsearFeed(await r.text());
  } catch {
    return [];
  }
}

export function detectarAoVivo(html: string): boolean {
  return /"isLiveNow"\s*:\s*true/.test(html);
}

export async function estaAoVivo(channelId: string, f: typeof fetch = fetch): Promise<boolean> {
  try {
    const r = await (f as FetchComCache)(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/live`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return false;
    return detectarAoVivo(await r.text());
  } catch {
    return false;
  }
}

export function embedAoVivo(channelId: string): string {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId)}`;
}
