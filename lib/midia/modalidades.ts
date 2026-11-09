/** As 4 modalidades do site (spec Fase 3, seção 8). */
export type SlugModalidade = 'futsal' | 'futebol7' | 'basquete' | 'volei';

export const MODALIDADES_SITE: { slug: SlugModalidade; nome: string; frase: string }[] = [
  { slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.' },
  { slug: 'futebol7', nome: 'Futebol 7', frase: 'O palco do futebol 7 é aqui.' },
  { slug: 'basquete', nome: 'Basquete', frase: 'O palco do basquete é aqui.' },
  { slug: 'volei', nome: 'Vôlei', frase: 'O palco do vôlei é aqui.' },
];

export function modalidadePorSlug(slug: string) {
  return MODALIDADES_SITE.find((m) => m.slug === slug) ?? null;
}
