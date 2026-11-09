import { createPublicClient } from '@/lib/supabase/server';

/**
 * Agenda única (spec Fase 3, seção 7): junta a agenda de transmissões
 * (`agenda_jogos`) com os jogos futuros dos campeonatos (`jogos`).
 */
export type ItemAgenda = {
  id: string;
  origem: 'jogos' | 'agenda';
  modalidade: string | null;
  fase: string | null;
  casa: string;
  fora: string;
  /** ISO 8601 com fuso. */
  dataHora: string;
  local: string | null;
  transmissao: boolean;
};

type Nome = { nome?: string | null } | null | undefined;

export type LinhaJogo = {
  id: string;
  data: string;
  fase: string | null;
  local: string | null;
  casa: Nome;
  fora: Nome;
  campeonato: { modalidade?: string | null } | null | undefined;
  transmissoes: unknown[] | null | undefined;
};

export type LinhaAgendaJogos = {
  id: string;
  modalidade?: string | null;
  fase?: string | null;
  equipe_casa: string;
  equipe_fora: string;
  data_hora: string;
  local?: string | null;
};

const UMA_HORA_MS = 3600 * 1000;

/** A marca é só ARENA VALE: corrige o local antigo. */
function corrigirLocal(local: string | null | undefined): string | null {
  if (!local) return null;
  return /arena vale sports?/i.test(local) ? local.replace(/arena vale sports?/i, 'Arena Vale') : local;
}

/** `jogos.data` é timestamp sem fuso: lido como horário de Brasília. */
function comFusoBrasilia(data: string): string {
  const temFuso = /([zZ]|[+-]\d{2}:?\d{2})$/.test(data);
  return new Date(temFuso ? data : `${data}-03:00`).toISOString();
}

export function deJogos(row: LinhaJogo): ItemAgenda {
  return {
    id: row.id,
    origem: 'jogos',
    modalidade: row.campeonato?.modalidade ?? null,
    fase: row.fase ?? null,
    casa: row.casa?.nome ?? 'A definir',
    fora: row.fora?.nome ?? 'A definir',
    dataHora: comFusoBrasilia(row.data),
    local: corrigirLocal(row.local),
    transmissao: (row.transmissoes?.length ?? 0) > 0,
  };
}

export function deAgendaJogos(row: LinhaAgendaJogos): ItemAgenda {
  return {
    id: row.id,
    origem: 'agenda',
    modalidade: row.modalidade ?? null,
    fase: row.fase ?? null,
    casa: row.equipe_casa,
    fora: row.equipe_fora,
    dataHora: new Date(row.data_hora).toISOString(),
    local: corrigirLocal(row.local),
    transmissao: true,
  };
}

function normalizar(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function mesmoJogo(a: ItemAgenda, b: ItemAgenda): boolean {
  const ta = [normalizar(a.casa), normalizar(a.fora)].sort().join('|');
  const tb = [normalizar(b.casa), normalizar(b.fora)].sort().join('|');
  return ta === tb && Math.abs(Date.parse(a.dataHora) - Date.parse(b.dataHora)) <= UMA_HORA_MS;
}

export function juntarAgenda(jogos: ItemAgenda[], agenda: ItemAgenda[], agora: Date, limite = 6): ItemAgenda[] {
  const t0 = agora.getTime();
  const futurosJogos = jogos.filter((j) => Date.parse(j.dataHora) >= t0).map((j) => ({ ...j }));
  const restantes: ItemAgenda[] = [];
  for (const a of agenda) {
    if (Date.parse(a.dataHora) < t0) continue;
    const par = futurosJogos.find((j) => mesmoJogo(j, a));
    if (par) par.transmissao = true;
    else restantes.push(a);
  }
  return [...futurosJogos, ...restantes]
    .sort((x, y) => Date.parse(x.dataHora) - Date.parse(y.dataHora))
    .slice(0, limite);
}

export function proximaTransmissao(itens: ItemAgenda[]): ItemAgenda | null {
  return itens.find((i) => i.transmissao) ?? null;
}

/** Página inicial: lista curta, mas a próxima transmissão procurada em toda a agenda buscada. */
export function resumoAgenda(itens: ItemAgenda[], tamanho = 6): { lista: ItemAgenda[]; proxima: ItemAgenda | null } {
  return { lista: itens.slice(0, tamanho), proxima: proximaTransmissao(itens) };
}

/** "agora" no formato de `jogos.data` (sem fuso, horário de Brasília). */
function agoraBrasiliaSemFuso(agora: Date): string {
  return new Date(agora.getTime() - 3 * UMA_HORA_MS).toISOString().slice(0, 19);
}

export async function buscarAgenda(limite = 6): Promise<ItemAgenda[]> {
  const agora = new Date();
  const sb = createPublicClient();
  const [rJogos, rAgenda] = await Promise.all([
    sb
      .from('jogos')
      .select('id,data,fase,local,casa:time_casa_id(nome),fora:time_visitante_id(nome),campeonato:campeonato_id(modalidade),transmissoes(id)')
      .eq('status', 'agendado')
      .gte('data', agoraBrasiliaSemFuso(agora))
      .order('data')
      .limit(50)
      .then((r) => r, () => ({ data: null, error: true })),
    sb
      .from('agenda_jogos')
      .select('id,modalidade,fase,equipe_casa,equipe_fora,data_hora,local')
      .gte('data_hora', agora.toISOString())
      .order('data_hora')
      .limit(50)
      .then((r) => r, () => ({ data: null, error: true })),
  ]);
  const jogos = rJogos.error || !rJogos.data ? [] : (rJogos.data as unknown as LinhaJogo[]).map(deJogos);
  const agenda = rAgenda.error || !rAgenda.data ? [] : (rAgenda.data as unknown as LinhaAgendaJogos[]).map(deAgendaJogos);
  return juntarAgenda(jogos, agenda, agora, limite);
}
