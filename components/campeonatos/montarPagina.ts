/**
 * Monta, a partir dos dados do campeonato, o que cada aba da página mostra.
 * Funções puras (sem JSX), usadas pela página do servidor.
 */
import { classificar, type LinhaTabela } from '@/lib/campeonatos/classificacao';
import type { JogoDaPagina, PaginaCampeonato } from '@/lib/campeonatos/busca';
import { resolverVagas, rotuloDaVaga } from '@/lib/campeonatos/vagas';
import type { Vaga } from '@/lib/campeonatos/tipos';
import type { FaseChave, LadoChave } from './Chave';
import type { BlocoDeJogos, JogoDaLista } from './ListaJogos';
import { dataDoJogo, placarDoJogo } from './formatar';

export type Aba = 'classificacao' | 'chave' | 'jogos' | 'regulamento';
export const ROTULO_ABA: Record<Aba, string> = { classificacao: 'Classificação', chave: 'Chave', jogos: 'Jogos', regulamento: 'Regulamento' };

const DE_TABELA = new Set(['Pontos corridos', 'Fase de grupos']);

export function abasDoCampeonato(p: PaginaCampeonato): Aba[] {
  const r = p.campeonato.regulamento;
  if (r.formato_antigo) return ['jogos', 'regulamento'];
  const f = r.forma;
  const abas: Aba[] = [];
  if (f.tipo !== 'mata_mata') abas.push('classificacao');
  if (f.tipo !== 'pontos_corridos' || f.final_entre) abas.push('chave');
  abas.push('jogos', 'regulamento');
  return abas;
}

export type TabelaDaPagina = { titulo?: string; linhas: LinhaTabela[]; classificam: number };

export function tabelasDoCampeonato(p: PaginaCampeonato): TabelaDaPagina[] {
  const r = p.campeonato.regulamento;
  const f = r.forma;
  if (f.tipo === 'pontos_corridos') {
    const jogos = p.jogos.filter((j) => j.fase === 'Pontos corridos');
    return [{ linhas: classificar(Object.keys(p.times), jogos, r, p.sorteios.geral), classificam: f.final_entre ?? 1 }];
  }
  if (f.tipo === 'grupos_mata_mata') {
    return Object.keys(p.grupos)
      .sort()
      .map((g) => ({
        titulo: `Grupo ${g}`,
        linhas: classificar(p.grupos[g], p.jogos.filter((j) => j.fase === 'Fase de grupos' && j.grupo === g), r, p.sorteios[`grupo:${g}`]),
        classificam: f.passam_por_grupo,
      }));
  }
  return [];
}

function mapaDeOrdens(jogos: JogoDaPagina[]) {
  return new Map(jogos.filter((j) => j.ordem != null).map((j) => [j.ordem as number, { fase: j.fase ?? '', volta: j.jogo_volta_de != null }]));
}

function lado(p: PaginaCampeonato, time: string | null, vaga: Vaga | null, provavel: string | undefined, ordens: ReturnType<typeof mapaDeOrdens>): LadoChave {
  if (time && p.times[time]) return { time: p.times[time] };
  return { rotulo: vaga ? rotuloDaVaga(vaga, ordens) : 'A definir', provavel: provavel ? p.times[provavel]?.nome : undefined };
}

export function chaveDoCampeonato(p: PaginaCampeonato): FaseChave[] {
  const ordens = mapaDeOrdens(p.jogos);
  const { provaveis } = resolverVagas(p.jogos, p.campeonato.regulamento, { ...p.grupos, geral: Object.keys(p.times) }, p.sorteios);
  const fases: FaseChave[] = [];
  for (const j of p.jogos) {
    if (!j.fase || DE_TABELA.has(j.fase) || j.jogo_volta_de) continue;
    const volta = p.jogos.find((v) => v.jogo_volta_de === j.id);
    const placares = [placarDoJogo(j), volta ? placarDoJogo(volta) : null].filter(Boolean);
    let f = fases.find((x) => x.fase === j.fase);
    if (!f) fases.push((f = { fase: j.fase, confrontos: [] }));
    f.confrontos.push({
      id: j.id,
      casa: lado(p, j.casa, j.vaga_casa, provaveis[j.id]?.casa, ordens),
      visitante: lado(p, j.visitante, j.vaga_visitante, provaveis[j.id]?.visitante, ordens),
      placar: placares.length ? placares.join(' · ') : null,
      quando: dataDoJogo(j.data),
    });
  }
  return fases;
}

function itemDaLista(p: PaginaCampeonato, j: JogoDaPagina, detalhe: string | null, ordens: ReturnType<typeof mapaDeOrdens>): JogoDaLista {
  const nome = (t: string | null, v: Vaga | null) => (t && p.times[t] ? p.times[t].nome : v ? rotuloDaVaga(v, ordens) : 'A definir');
  return {
    id: j.id,
    casa: j.casa ? (p.times[j.casa] ?? null) : null,
    visitante: j.visitante ? (p.times[j.visitante] ?? null) : null,
    rotuloCasa: nome(j.casa, j.vaga_casa),
    rotuloVisitante: nome(j.visitante, j.vaga_visitante),
    quando: dataDoJogo(j.data),
    local: j.local,
    placar: placarDoJogo(j),
    detalhe: [detalhe, j.wo ? 'W.O.' : null].filter(Boolean).join(' · ') || null,
    status: j.status,
  };
}

export function jogosDoCampeonato(p: PaginaCampeonato): BlocoDeJogos[] {
  const ordens = mapaDeOrdens(p.jogos);
  if (p.campeonato.regulamento.formato_antigo) {
    const porData = [...p.jogos].sort((a, b) => String(a.data ?? '9999').localeCompare(String(b.data ?? '9999')));
    return porData.length ? [{ titulo: 'Jogos', jogos: porData.map((j) => itemDaLista(p, j, j.fase, ordens)) }] : [];
  }
  const blocos: BlocoDeJogos[] = [];
  for (const j of p.jogos) {
    const titulo = j.fase && DE_TABELA.has(j.fase) ? `Rodada ${j.rodada ?? '—'}` : (j.fase ?? 'Jogos');
    let b = blocos.find((x) => x.titulo === titulo);
    if (!b) blocos.push((b = { titulo, jogos: [] }));
    b.jogos.push(itemDaLista(p, j, j.grupo ? `Grupo ${j.grupo}` : null, ordens));
  }
  return blocos;
}
