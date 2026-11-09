/** Links de vídeo (spec 2026-11-08, seção 4.5). Funções puras: servem ao site, ao painel e ao bot. */

export type ServicoVideo = 'youtube' | 'instagram' | 'x' | 'tiktok' | 'facebook' | 'telegram' | 'outro';

const HOSTS: [RegExp, ServicoVideo][] = [
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$/, 'x'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.watch$/, 'facebook'],
  [/(^|\.)t\.me$/, 'telegram'],
];

export const NOME_SERVICO: Record<ServicoVideo, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  telegram: 'Telegram',
  outro: 'site original',
};

function url(texto: string): URL | null {
  try {
    const u = new URL(texto);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u : null;
  } catch {
    return null;
  }
}

export function servicoDoLink(link: string): ServicoVideo {
  const u = url(link);
  if (!u) return 'outro';
  const host = u.hostname.toLowerCase();
  return HOSTS.find(([r]) => r.test(host))?.[1] ?? 'outro';
}

export function idYoutube(link: string): string | null {
  const u = url(link);
  if (!u || servicoDoLink(link) !== 'youtube') return null;
  const valido = (id: string | null | undefined) => (id && /^[\w-]{11}$/.test(id) ? id : null);
  if (u.hostname.endsWith('youtu.be')) return valido(u.pathname.split('/')[1]);
  const v = u.searchParams.get('v');
  if (v) return valido(v);
  const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
  return valido(m?.[1]);
}

export function primeiroLinkDeVideo(texto: string): string | null {
  for (const m of texto.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
    if (servicoDoLink(m[0]) !== 'outro') return m[0];
  }
  return null;
}

/** Link de post, reel ou tv do Instagram, sempre https. */
export function validarLinkInstagram(link: string): boolean {
  const u = url(link);
  if (!u || u.protocol !== 'https:') return false;
  if (!['instagram.com', 'www.instagram.com'].includes(u.hostname.toLowerCase())) return false;
  return /^\/(p|reel|tv)\/[\w-]+/.test(u.pathname);
}
