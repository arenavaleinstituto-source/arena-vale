/** Times de um jogo ("FLAMENGO x PALMEIRAS"), mostrados no cabeçalho dos vídeos. */

const PALAVRA = "[A-ZÀ-Ýa-zà-ÿ0-9'.-]+";
// Até 3 palavras de cada lado; o placar (2 x 1) é opcional.
const RE = new RegExp(`(${PALAVRA}(?: ${PALAVRA}){0,2}?) (?:\d+ )?(?:x|X|vs\.?|versus) (?:\d+ )?(${PALAVRA}(?: ${PALAVRA}){0,2})`, 'u');
const INICIO_SOLTO = /^(?:(?:gols?|golaço|veja|assista|lances?|melhores momentos|do|da|de|dos|das|no|na|o|a)\s+)+/i;
const LIGACAO = /\s+(?:hoje|ontem|agora|pelo|pela|no|na|em|de|do|da|veja|final)(?:\s.*)?$/i;

const maiuscula = (t: string) => t.toLocaleUpperCase('pt-BR');

export function limparConfronto(texto: string | null | undefined): string | null {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  const partes = t.split(/\s+(?:x|vs\.?|versus)\s+/i);
  return partes.map((p) => maiuscula(p.trim())).join(' x ').slice(0, 60);
}

export function extrairConfronto(texto: string | null | undefined): string | null {
  const linha = (texto ?? '').replace(/[!?:;,()"“”]/g, ' ').replace(/\s+-\s+.*$/, '').replace(/\s+/g, ' ').trim();
  const m = RE.exec(linha);
  if (!m) return null;
  const casa = m[1].replace(/\s+\d+$/, '').replace(INICIO_SOLTO, '').replace(/^.*\b(?:do|da|de|dos|das)\s+/i, '').trim();
  const fora = m[2].replace(/^\d+\s+/, '').replace(LIGACAO, '').trim();
  if (!casa || !fora) return null;
  return `${maiuscula(casa)} x ${maiuscula(fora)}`;
}
