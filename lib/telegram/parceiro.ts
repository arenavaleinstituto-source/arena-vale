/**
 * Modo parceiro (spec Fase 4A, seção 5): "parceiro @perfil" na legenda indica uma
 * publicação de outra pessoa, repostada COM autorização e COM o crédito dela.
 * A marca do autor nunca é removida; o robô só acrescenta a nossa logo e a faixa de crédito.
 */

/** Perfil do Instagram: letras, números, ponto e sublinhado, até 30. */
const RE_PARCEIRO = /(^|[ \t]+)parceiro[ \t]+@([A-Za-z0-9._]{1,30})(?=\s|$)/im;

export function extrairParceiro(texto: string): { perfil: string; texto: string } | null {
  const m = texto.match(RE_PARCEIRO);
  if (!m || m.index === undefined) return null;
  const sem = texto.slice(0, m.index) + texto.slice(m.index + m[0].length);
  const limpo = sem
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .filter((l, i, todas) => l.trim() !== '' || (i > 0 && i < todas.length - 1))
    .join('\n')
    .trim();
  return { perfil: m[2], texto: limpo };
}
