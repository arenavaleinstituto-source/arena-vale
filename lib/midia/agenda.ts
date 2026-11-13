import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import { diaBrasilia } from './jogo-rotulo';

export { rotuloJogo } from './jogo-rotulo';

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
  /** "Casa 3 x 1 Fora", só de jogo finalizado. */
  placar?: string | null;
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
  status?: string | null;
  placar_casa?: number | null;
  placar_visitante?: number | null;
};

export type LinhaAgendaJogos = {
  id: string;
  modalidade?: string | null;
  fase?: string | null;
  equipe_casa: string;
  equipe_fora: string;
  data_hora: string;
  local?: string | null;
  status?: string | null;
};

/** Transmissões marcadas como canceladas saem da agenda. */
export function agendaAtiva<T extends { status?: string | null }>(linhas: T[]): T[] {
  return linhas.filter((l) => !/^cancelad/i.test((l.status ?? '').trim()));
}

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
    placar:
      row.status === 'finalizado' && row.placar_casa != null && row.placar_visitante != null
        ? `${row.casa?.nome ?? 'A definir'} ${row.placar_casa} x ${row.placar_visitante} ${row.fora?.nome ?? 'A definir'}`
        : null,
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

const TRES_HORAS_MS = 3 * UMA_HORA_MS;


/**
 * Hoje na Arena: `hoje` são os jogos do dia de Brasília que começaram há no
 * máximo 3 h ou ainda vão começar; `proximos` são os dos dias seguintes.
 */
export function separarHoje(
  itens: ItemAgenda[],
  agora: Date,
  maxProximos = 6,
): { hoje: ItemAgenda[]; proximos: ItemAgenda[] } {
  const t0 = agora.getTime();
  const diaHoje = diaBrasilia(t0);
  const ordenados = itens
    .filter((i) => Date.parse(i.dataHora) >= t0 - TRES_HORAS_MS)
    .sort((x, y) => Date.parse(x.dataHora) - Date.parse(y.dataHora));
  const hoje: ItemAgenda[] = [];
  const proximos: ItemAgenda[] = [];
  for (const i of ordenados) {
    const dia = diaBrasilia(Date.parse(i.dataHora));
    if (dia === diaHoje) hoje.push(i);
    else if (dia > diaHoje) proximos.push(i);
  }
  return { hoje, proximos: proximos.slice(0, maxProximos) };
}

/** Jogos dos campeonatos e transmissões a partir de `desde` (e até `ate`, se houver), já juntos. */
async function buscarItens(
  desde: Date,
  limite: number,
  o: { ate?: Date; sb?: SupabaseClient; status?: string[] } = {},
): Promise<ItemAgenda[]> {
  const sb = o.sb ?? createPublicClient();
  let qJogos = sb
    .from('jogos')
    .select('id,data,fase,local,status,placar_casa,placar_visitante,casa:time_casa_id(nome),fora:time_visitante_id(nome),campeonato:campeonato_id(modalidade),transmissoes(id)')
    .gte('data', agoraBrasiliaSemFuso(desde));
  qJogos = o.status ? qJogos.in('status', o.status) : qJogos.eq('status', 'agendado');
  if (o.ate) qJogos = qJogos.lte('data', agoraBrasiliaSemFuso(o.ate));
  let qAgenda = sb
    .from('agenda_jogos')
    .select('id,modalidade,fase,equipe_casa,equipe_fora,data_hora,local,status')
    .gte('data_hora', desde.toISOString());
  if (o.ate) qAgenda = qAgenda.lte('data_hora', o.ate.toISOString());
  const [rJogos, rAgenda] = await Promise.all([
    qJogos.order('data').limit(50).then((r) => r, () => ({ data: null, error: true })),
    qAgenda.order('data_hora').limit(50).then((r) => r, () => ({ data: null, error: true })),
  ]);
  const jogos = rJogos.error || !rJogos.data ? [] : (rJogos.data as unknown as LinhaJogo[]).map(deJogos);
  const agenda = rAgenda.error || !rAgenda.data ? [] : agendaAtiva(rAgenda.data as unknown as LinhaAgendaJogos[]).map(deAgendaJogos);
  return juntarAgenda(jogos, agenda, desde, limite);
}

export async function buscarAgenda(limite = 6): Promise<ItemAgenda[]> {
  return buscarItens(new Date(), limite);
}

/** Jogos que acontecem ou aconteceram (o jogo "ao vivo" continua aparecendo). */
const STATUS_DO_DIA = ['agendado', 'ao_vivo', 'finalizado'];

export async function buscarHojeNaArena(sb?: SupabaseClient): Promise<{ hoje: ItemAgenda[]; proximos: ItemAgenda[] }> {
  const agora = new Date();
  const itens = await buscarItens(new Date(agora.getTime() - TRES_HORAS_MS), 50, { sb, status: STATUS_DO_DIA });
  return separarHoje(itens, agora);
}

/** Um jogo da agenda pelo id, na tabela da origem. */
export async function buscarItemAgenda(origem: 'jogos' | 'agenda', id: string): Promise<ItemAgenda | null> {
  const sb = createPublicClient();
  if (origem === 'jogos') {
    const { data, error } = await sb
      .from('jogos')
      .select('id,data,fase,local,status,placar_casa,placar_visitante,casa:time_casa_id(nome),fora:time_visitante_id(nome),campeonato:campeonato_id(modalidade),transmissoes(id)')
      .eq('id', id)
      .maybeSingle();
    return error || !data ? null : deJogos(data as unknown as LinhaJogo);
  }
  const { data, error } = await sb
    .from('agenda_jogos')
    .select('id,modalidade,fase,equipe_casa,equipe_fora,data_hora,local,status')
    .eq('id', id)
    .maybeSingle();
  return error || !data ? null : deAgendaJogos(data as unknown as LinhaAgendaJogos);
}

/** Fim do dia de hoje (23h59m59s de Brasília). */
function fimDoDiaBrasilia(agora: Date): Date {
  return new Date(Date.parse(`${diaBrasilia(agora.getTime())}T23:59:59.999-03:00`));
}

/** Jogos de `dias` atrás até o fim de hoje, das duas fontes, do mais recente ao mais antigo (até 8). */
export async function jogosRecentes(dias: number, agora: Date = new Date(), sb?: SupabaseClient): Promise<ItemAgenda[]> {
  try {
    const desde = new Date(Date.parse(`${diaBrasilia(agora.getTime() - dias * 24 * UMA_HORA_MS)}T00:00:00-03:00`));
    const itens = await buscarItens(desde, 50, { ate: fimDoDiaBrasilia(agora), sb, status: STATUS_DO_DIA });
    return itens.sort((a, b) => Date.parse(b.dataHora) - Date.parse(a.dataHora)).slice(0, 8);
  } catch {
    return [];
  }
}
