/**
 * YouTube do canal TV Arena Vale (spec Fase 3, seção 6).
 * Sem chave de API: lê o feed RSS público e a página /live do canal.
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

export async function buscarVideosYT(channelId: string, f: typeof fetch = fetch): Promise<VideoYT[]> {
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
