/** As 4 modalidades do site (spec Fase 3, seção 8). */
/** Identificador da modalidade (as 4 de sempre ou uma cadastrada pela coordenação). */
export type SlugModalidade = string;

export type Modalidade = { slug: string; nome: string; frase: string };

/** As 4 de sempre: usadas como reserva se o banco não responder. */
export const MODALIDADES_SITE: Modalidade[] = [
  { slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.' },
  { slug: 'futebol7', nome: 'Futebol 7', frase: 'O palco do futebol 7 é aqui.' },
  { slug: 'basquete', nome: 'Basquete', frase: 'O palco do basquete é aqui.' },
  { slug: 'volei', nome: 'Vôlei', frase: 'O palco do vôlei é aqui.' },
];

export function modalidadePorSlug(slug: string, lista: Modalidade[] = MODALIDADES_SITE): Modalidade | null {
  return lista.find((m) => m.slug === slug) ?? null;
}

/** "Beach Tennis" → "beach-tennis" (minúsculas, sem acento, hífen no lugar de espaço). */
export function slugDoNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function fraseDaModalidade(nome: string): string {
  return `O palco do ${nome.trim().toLowerCase()} é aqui.`;
}
