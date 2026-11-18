import type { SupabaseClient } from '@supabase/supabase-js';
import { lerRegulamento } from './regulamento';
import type { JogoCalc, JogoGerado, Regulamento, Sorteios, Vaga } from './tipos';
import type { ResultadoVagas } from './vagas';

export type DadosCampeonato = {
  id: string;
  modalidade: string | null;
  formato: string | null;
  regulamento: Regulamento;
  times: string[]; // inscrições aprovadas
  grupos: Record<string, string[]>; // de jogos com grupo; vazio antes de gerar
  jogos: JogoCalc[];
  sorteios: Sorteios;
  destravadas: string[];
};

export type PortasCampeonato = {
  carregar(id: string): Promise<DadosCampeonato | null>;
  aplicarVagas(atualizar: ResultadoVagas['atualizar']): Promise<void>;
  /** Apaga, insere e liga `jogo_volta_de` pela ordem do jogo de ida. */
  substituirJogos(campeonatoId: string, apagar: string[], inserir: JogoGerado[]): Promise<void>;
  gravarRegulamento(id: string, r: Regulamento): Promise<void>;
};

const COLUNAS_JOGO =
  'id,ordem,fase,grupo,rodada,time_casa_id,time_visitante_id,status,placar_casa,placar_visitante,penaltis_casa,penaltis_visitante,wo,parciais,vaga_casa,vaga_visitante,vaga_manual,jogo_volta_de';

type LinhaJogo = {
  id: string; ordem: number | null; fase: string | null; grupo: string | null; rodada: number | null;
  time_casa_id: string | null; time_visitante_id: string | null; status: string;
  placar_casa: number | null; placar_visitante: number | null; penaltis_casa: number | null; penaltis_visitante: number | null;
  wo: 'casa' | 'visitante' | null; parciais: { casa: number; visitante: number }[] | null;
  vaga_casa: Vaga | null; vaga_visitante: Vaga | null; vaga_manual: boolean | null; jogo_volta_de: string | null;
};

export function paraJogoCalc(l: LinhaJogo): JogoCalc {
  return {
    id: l.id, ordem: l.ordem, fase: l.fase, grupo: l.grupo, rodada: l.rodada,
    casa: l.time_casa_id, visitante: l.time_visitante_id, status: l.status,
    placar_casa: l.placar_casa, placar_visitante: l.placar_visitante,
    penaltis_casa: l.penaltis_casa, penaltis_visitante: l.penaltis_visitante,
    wo: l.wo, parciais: l.parciais, vaga_casa: l.vaga_casa, vaga_visitante: l.vaga_visitante,
    vaga_manual: Boolean(l.vaga_manual), jogo_volta_de: l.jogo_volta_de,
  };
}

/** Times de cada grupo, tirados dos jogos da fase de grupos (os times dos grupos são fixos). */
export function gruposDosJogos(jogos: JogoCalc[]): Record<string, string[]> {
  const grupos: Record<string, string[]> = {};
  for (const j of jogos) {
    if (j.fase !== 'Fase de grupos' || !j.grupo) continue;
    const lista = (grupos[j.grupo] ??= []);
    for (const t of [j.casa, j.visitante]) if (t && !lista.includes(t)) lista.push(t);
  }
  return grupos;
}

/** Liga o serviço dos campeonatos ao Supabase (service role, só no servidor). */
export function portasCampeonato(admin: SupabaseClient): PortasCampeonato {
  return {
    async carregar(id) {
      const { data: c } = await admin
        .from('campeonatos')
        .select('id,modalidade,formato,regulamento,ordem_sorteio,fases_destravadas')
        .eq('id', id)
        .maybeSingle();
      if (!c) return null;
      const camp = c as { id: string; modalidade: string | null; formato: string | null; regulamento: unknown; ordem_sorteio: Sorteios | null; fases_destravadas: string[] | null };
      const [{ data: insc }, { data: linhas }] = await Promise.all([
        admin.from('inscricoes').select('time_id').eq('campeonato_id', id).eq('status', 'aprovada').order('submitted_at').order('time_id'),
        admin.from('jogos').select(COLUNAS_JOGO).eq('campeonato_id', id).order('ordem', { ascending: true, nullsFirst: false }),
      ]);
      const jogos = ((linhas ?? []) as LinhaJogo[]).map(paraJogoCalc);
      return {
        id: camp.id,
        modalidade: camp.modalidade,
        formato: camp.formato,
        regulamento: lerRegulamento(camp.regulamento, { formatoAntigo: camp.formato, modalidade: camp.modalidade }),
        times: ((insc ?? []) as { time_id: string }[]).map((i) => i.time_id),
        grupos: gruposDosJogos(jogos),
        jogos,
        sorteios: camp.ordem_sorteio ?? {},
        destravadas: camp.fases_destravadas ?? [],
      };
    },

    async aplicarVagas(atualizar) {
      for (const a of atualizar) {
        const { error } = await admin.from('jogos').update({ time_casa_id: a.casa, time_visitante_id: a.visitante }).eq('id', a.id);
        if (error) throw new Error(error.message);
      }
    },

    async substituirJogos(campeonatoId, apagar, inserir) {
      if (apagar.length) {
        const { error } = await admin.from('jogos').delete().in('id', apagar);
        if (error) throw new Error(error.message);
      }
      if (!inserir.length) return;
      const linhas = inserir.map((j) => ({
        campeonato_id: campeonatoId, ordem: j.ordem, fase: j.fase, rodada: j.rodada, grupo: j.grupo,
        time_casa_id: j.casa, time_visitante_id: j.visitante, vaga_casa: j.vaga_casa, vaga_visitante: j.vaga_visitante,
        data: null, status: 'agendado',
      }));
      const { error } = await admin.from('jogos').insert(linhas);
      if (error) throw new Error(error.message);

      const voltas = inserir.filter((j) => j.volta_de != null);
      if (!voltas.length) return;
      const { data: todos } = await admin.from('jogos').select('id,ordem').eq('campeonato_id', campeonatoId).not('ordem', 'is', null);
      const idPorOrdem = new Map(((todos ?? []) as { id: string; ordem: number }[]).map((t) => [t.ordem, t.id]));
      for (const v of voltas) {
        const id = idPorOrdem.get(v.ordem);
        const ida = idPorOrdem.get(v.volta_de as number);
        if (!id || !ida) continue;
        const { error: e2 } = await admin.from('jogos').update({ jogo_volta_de: ida }).eq('id', id);
        if (e2) throw new Error(e2.message);
      }
    },

    async gravarRegulamento(id, r) {
      const { error } = await admin.from('campeonatos').update({ regulamento: r }).eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
