import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import { gruposDosJogos, paraJogoCalc } from './portas';
import { lerRegulamento } from './regulamento';
import type { JogoCalc, Regulamento, Sorteios } from './tipos';

export type ResumoCampeonato = {
  id: string;
  slug: string;
  nome: string;
  ano: number;
  categoria: string | null;
  modalidade: string | null;
  logo_url: string | null;
  status: string;
  fase_atual: string | null;
  encerrado: boolean;
};

type JogoResumo = { fase: string | null; ordem: number | null; status: string; rodada: number | null };

/** Fase do primeiro jogo ainda não encerrado, na ordem da tabela ("Rodada N" nos pontos corridos). */
export function faseAtual(jogos: JogoResumo[]): string | null {
  const proximo = [...jogos]
    .filter((j) => j.status !== 'finalizado' && j.status !== 'cancelado')
    .sort((a, b) => (a.ordem ?? Number.MAX_SAFE_INTEGER) - (b.ordem ?? Number.MAX_SAFE_INTEGER))[0];
  if (!proximo) return null;
  // Jogo antigo (sem ordem) com a fase padrão do banco é de pontos corridos.
  const tabela = proximo.fase === 'Pontos corridos' || !proximo.fase || (proximo.ordem == null && proximo.fase === 'fase_grupos');
  if (tabela) return proximo.rodada ? `Rodada ${proximo.rodada}` : null;
  return proximo.fase;
}

export function paraResumo(c: Record<string, unknown>): ResumoCampeonato {
  const status = String(c.status ?? 'em_andamento');
  return {
    id: String(c.id),
    slug: String(c.slug ?? c.id),
    nome: String(c.nome ?? ''),
    ano: Number(c.ano),
    categoria: (c.categoria as string | null) ?? null,
    modalidade: (c.modalidade as string | null) ?? null,
    logo_url: (c.logo_url as string | null) ?? null,
    status,
    fase_atual: faseAtual((c.jogos as JogoResumo[] | null) ?? []),
    encerrado: status === 'finalizado' || status === 'cancelado',
  };
}

const COLUNAS = 'id,slug,nome,ano,categoria,modalidade,logo_url,status,jogos(fase,ordem,status,rodada)';

/** Campeonatos liberados no site (o RLS esconde os que aguardam liberação). */
export async function buscarCampeonatosPublicos(): Promise<ResumoCampeonato[]> {
  try {
    const { data, error } = await createPublicClient().from('campeonatos').select(COLUNAS).order('ano', { ascending: false }).order('nome');
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(paraResumo);
  } catch {
    return [];
  }
}

export type TimeDaPagina = { nome: string; sigla: string | null; escudo_url: string | null; escudo_cor: string | null };
export type JogoDaPagina = JogoCalc & { data: string | null; local: string | null };
export type PaginaCampeonato = {
  campeonato: ResumoCampeonato & { regulamento: Regulamento; visivel: boolean };
  times: Record<string, TimeDaPagina>;
  jogos: JogoDaPagina[];
  grupos: Record<string, string[]>;
  sorteios: Sorteios;
};

const COLUNAS_PAGINA =
  'id,slug,nome,ano,categoria,modalidade,logo_url,status,formato,regulamento,visivel,ordem_sorteio,' +
  'inscricoes(status,time:times(id,nome,sigla,escudo_url,escudo_cor)),' +
  'jogos(id,ordem,fase,grupo,rodada,data,local,time_casa_id,time_visitante_id,status,placar_casa,placar_visitante,penaltis_casa,penaltis_visitante,wo,parciais,vaga_casa,vaga_visitante,vaga_manual,jogo_volta_de,' +
  'casa:times!jogos_time_casa_id_fkey(id,nome,sigla,escudo_url,escudo_cor),fora:times!jogos_time_visitante_id_fkey(id,nome,sigla,escudo_url,escudo_cor))';

type TimeLinha = TimeDaPagina & { id: string };

/** Tudo o que a página do campeonato mostra. Com o cliente público só acha os liberados; com o da sessão, também os da equipe. */
export async function buscarCampeonatoPorSlug(slug: string, sb?: SupabaseClient): Promise<PaginaCampeonato | null> {
  try {
    const { data, error } = await (sb ?? createPublicClient()).from('campeonatos').select(COLUNAS_PAGINA).eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    const c = data as unknown as Record<string, unknown>;
    const times: Record<string, TimeDaPagina> = {};
    const guardar = (t: TimeLinha | null | undefined) => {
      if (t?.id) times[t.id] = { nome: t.nome, sigla: t.sigla, escudo_url: t.escudo_url, escudo_cor: t.escudo_cor };
    };
    for (const i of (c.inscricoes as { status: string; time: TimeLinha | null }[] | null) ?? []) if (i.status === 'aprovada') guardar(i.time);
    const linhas = ((c.jogos as (Record<string, unknown> & { casa?: TimeLinha | null; fora?: TimeLinha | null })[] | null) ?? []);
    for (const l of linhas) {
      guardar(l.casa);
      guardar(l.fora);
    }
    const jogos: JogoDaPagina[] = linhas
      .map((l) => ({ ...paraJogoCalc(l as never), data: (l.data as string | null) ?? null, local: (l.local as string | null) ?? null }))
      .sort((a, b) => (a.ordem ?? Number.MAX_SAFE_INTEGER) - (b.ordem ?? Number.MAX_SAFE_INTEGER) || String(a.data ?? '').localeCompare(String(b.data ?? '')));
    return {
      campeonato: {
        ...paraResumo({ ...c, jogos }),
        regulamento: lerRegulamento(c.regulamento, { formatoAntigo: (c.formato as string | null) ?? null, modalidade: (c.modalidade as string | null) ?? null }),
        visivel: c.visivel === true,
      },
      times,
      jogos,
      grupos: gruposDosJogos(jogos),
      sorteios: (c.ordem_sorteio as Sorteios | null) ?? {},
    };
  } catch {
    return null;
  }
}
