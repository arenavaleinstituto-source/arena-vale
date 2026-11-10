import { createPublicClient } from '@/lib/supabase/server';
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

export type CampeonatoComTabela = { id: string; nome: string; ano: number; categoria: string | null; classificacao: LinhaClassificacao[] };

/** Campeonatos da modalidade, cada um com a classificação calculada (v_classificacao). */
export async function buscarCampeonatosDaModalidade(slug: string): Promise<CampeonatoComTabela[]> {
  try {
    const sb = createPublicClient();
    const { data: camps, error } = await sb.from('campeonatos').select('id,nome,ano,categoria').eq('modalidade', slug).order('ano', { ascending: false });
    if (error || !camps?.length) return [];
    const { data: linhas } = await sb
      .from('v_classificacao')
      .select('campeonato_id,time_id,time_nome,time_sigla,jogos,vitorias,empates,derrotas,gols_pro,gols_contra,saldo,pontos')
      .in(
        'campeonato_id',
        camps.map((c) => c.id),
      );
    const porCamp = new Map<string, LinhaClassificacao[]>();
    for (const l of (linhas ?? []) as (LinhaClassificacao & { campeonato_id: string })[]) {
      const lista = porCamp.get(l.campeonato_id) ?? [];
      lista.push(l);
      porCamp.set(l.campeonato_id, lista);
    }
    return camps.map((c) => ({
      ...(c as { id: string; nome: string; ano: number; categoria: string | null }),
      classificacao: (porCamp.get(c.id) ?? []).sort((a, b) => b.pontos - a.pontos || b.saldo - a.saldo || b.gols_pro - a.gols_pro),
    }));
  } catch {
    return [];
  }
}
