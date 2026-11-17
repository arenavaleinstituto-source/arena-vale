import { buscarCampeonatosPublicos, type ResumoCampeonato } from '@/lib/campeonatos/busca';
import type { ItemAgenda } from './agenda';
import { slugDoNome, type SlugModalidade } from './modalidades';

/** Converte a modalidade escrita de qualquer jeito ("Futebol de 7", "Basquetebol"...) no slug do site. */
export function slugDaModalidade(texto: string | null | undefined): SlugModalidade | null {
  if (!texto) return null;
  const t = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  // As 4 de sempre, com as variações de categoria ("Futsal Adulto", "Vôlei Feminino"...).
  // "Vôlei de Praia" NÃO é Vôlei: vira a própria modalidade ("volei-de-praia").
  const categoria = '( (adulto|adulta|feminino|masculino|misto|sub[- ]?\\d+|livre|veteranos?))*$';
  if (new RegExp(`^futsal${categoria}`).test(t)) return 'futsal';
  if (new RegExp(`^futebol( de)? ?7( society)?${categoria}`).test(t)) return 'futebol7';
  if (new RegExp(`^basquete(bol)?${categoria}`).test(t)) return 'basquete';
  if (new RegExp(`^volei(bol)?${categoria}`).test(t)) return 'volei';
  return slugDoNome(texto) || null;
}

export function filtrarPorModalidade(itens: ItemAgenda[], slug: string): ItemAgenda[] {
  return itens.filter((i) => slugDaModalidade(i.modalidade) === slug);
}

export type LinhaClassificacao = {
  time_id: string;
  time_nome: string;
  time_sigla: string | null;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo: number;
  pontos: number;
};

/** Campeonatos liberados da modalidade, para os cartões da página da modalidade. */
export async function buscarCampeonatosDaModalidade(slug: string): Promise<ResumoCampeonato[]> {
  const todos = await buscarCampeonatosPublicos();
  return todos.filter((c) => c.modalidade === slug);
}
