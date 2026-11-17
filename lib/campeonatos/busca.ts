import { createPublicClient } from '@/lib/supabase/server';

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
  if (proximo.fase === 'Pontos corridos' || !proximo.fase) return proximo.rodada ? `Rodada ${proximo.rodada}` : proximo.fase;
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
