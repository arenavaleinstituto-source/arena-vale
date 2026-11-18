import { describe, expect, it } from 'vitest';
import { classificar, pontosDoJogo, type LinhaTabela } from './classificacao';
import { regulamentoPadrao } from './regulamento';
import type { Criterio, JogoCalc, Regulamento, TipoPlacar } from './tipos';

let seq = 0;
function jogo(
  casa: string | null, visitante: string | null, pc: number | null, pv: number | null,
  extra: Partial<JogoCalc> = {},
): JogoCalc {
  seq += 1;
  return {
    id: `j${seq}`, ordem: null, fase: null, grupo: null, rodada: null,
    casa, visitante, status: 'finalizado', placar_casa: pc, placar_visitante: pv,
    penaltis_casa: null, penaltis_visitante: null, wo: null, parciais: null,
    vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null,
    ...extra,
  };
}

function reg(t: TipoPlacar, criterios?: Criterio[]): Regulamento {
  const r = regulamentoPadrao(t);
  return criterios ? { ...r, criterios } : r;
}

const ordem = (l: LinhaTabela[]) => l.map((x) => x.time_id);
const linha = (l: LinhaTabela[], id: string) => {
  const x = l.find((y) => y.time_id === id);
  if (!x) throw new Error(`sem linha para ${id}`);
  return x;
};

describe('pontosDoJogo', () => {
  it('gols: vitória 3, empate 1, derrota 0', () => {
    const r = reg('gols');
    expect(pontosDoJogo(jogo('a', 'b', 2, 1), r)).toEqual({ casa: 3, visitante: 0 });
    expect(pontosDoJogo(jogo('a', 'b', 1, 1), r)).toEqual({ casa: 1, visitante: 1 });
    expect(pontosDoJogo(jogo('a', 'b', 0, 4), r)).toEqual({ casa: 0, visitante: 3 });
  });

  it('sets: 2x1 dá 2 e 1 ponto; 2x0 dá 3 e 0', () => {
    const r = reg('sets');
    expect(pontosDoJogo(jogo('a', 'b', 2, 1), r)).toEqual({ casa: 2, visitante: 1 });
    expect(pontosDoJogo(jogo('a', 'b', 2, 0), r)).toEqual({ casa: 3, visitante: 0 });
    expect(pontosDoJogo(jogo('a', 'b', 1, 2), r)).toEqual({ casa: 1, visitante: 2 });
  });

  it('sets na melhor de 5: 3x0 e 3x1 são vitória direta, 3x2 é no decisivo', () => {
    const r = reg('sets');
    expect(pontosDoJogo(jogo('a', 'b', 3, 0), r)).toEqual({ casa: 3, visitante: 0 });
    expect(pontosDoJogo(jogo('a', 'b', 3, 1), r)).toEqual({ casa: 3, visitante: 0 });
    expect(pontosDoJogo(jogo('a', 'b', 2, 3), r)).toEqual({ casa: 1, visitante: 2 });
  });

  it('cestas: vitória 2, derrota 1; W.O. dá 0 a quem faltou', () => {
    const r = reg('cestas');
    expect(pontosDoJogo(jogo('a', 'b', 80, 70), r)).toEqual({ casa: 2, visitante: 1 });
    expect(pontosDoJogo(jogo('a', 'b', null, null, { wo: 'casa' }), r)).toEqual({ casa: 0, visitante: 2 });
  });

  it('empate em sets ou cestas (não deveria acontecer) vale 0 para cada um', () => {
    expect(pontosDoJogo(jogo('a', 'b', 1, 1), reg('sets'))).toEqual({ casa: 0, visitante: 0 });
    expect(pontosDoJogo(jogo('a', 'b', 50, 50), reg('cestas'))).toEqual({ casa: 0, visitante: 0 });
  });

  it('retorna null para jogo não finalizado ou sem os dois times', () => {
    const r = reg('gols');
    expect(pontosDoJogo(jogo('a', 'b', 1, 0, { status: 'agendado' }), r)).toBeNull();
    expect(pontosDoJogo(jogo('a', 'b', 1, 0, { status: 'em_andamento' }), r)).toBeNull();
    expect(pontosDoJogo(jogo('a', null, 1, 0), r)).toBeNull();
    expect(pontosDoJogo(jogo(null, 'b', 1, 0), r)).toBeNull();
  });
});

describe('classificar: contagem', () => {
  it('jogo agendado não conta', () => {
    const t = classificar(['a', 'b'], [jogo('a', 'b', 3, 0, { status: 'agendado' })], reg('gols'), undefined);
    expect(linha(t, 'a')).toMatchObject({ pontos: 0, jogos: 0, vitorias: 0, pro: 0, contra: 0 });
    expect(linha(t, 'b')).toMatchObject({ pontos: 0, jogos: 0, derrotas: 0, pro: 0, contra: 0 });
  });

  it('time sem jogos aparece zerado', () => {
    const t = classificar(['c', 'a', 'b'], [jogo('a', 'b', 1, 1)], reg('gols'), undefined);
    expect(t).toHaveLength(3);
    expect(linha(t, 'c')).toEqual({
      time_id: 'c', posicao: 3, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
      pro: 0, contra: 0, saldo: 0, sets_pro: 0, sets_contra: 0, pontos_sets_pro: 0, pontos_sets_contra: 0,
      aproveitamento: 0, aguardando_sorteio: false,
    });
  });

  it('soma as estatísticas de gols e calcula o aproveitamento', () => {
    const t = classificar(
      ['a', 'b', 'c'],
      [jogo('a', 'b', 2, 0), jogo('a', 'c', 1, 1), jogo('b', 'c', 3, 1)],
      reg('gols'), undefined,
    );
    expect(ordem(t)).toEqual(['a', 'b', 'c']);
    expect(linha(t, 'a')).toMatchObject({
      posicao: 1, pontos: 4, jogos: 2, vitorias: 1, empates: 1, derrotas: 0, pro: 3, contra: 1, saldo: 2,
      sets_pro: 0, sets_contra: 0,
    });
    expect(linha(t, 'a').aproveitamento).toBeCloseTo(4 / 6);
    expect(linha(t, 'c')).toMatchObject({ posicao: 3, pontos: 1, vitorias: 0, empates: 1, derrotas: 1, pro: 2, contra: 4, saldo: -2 });
  });

  it('sets: soma sets e pontos dos sets (parciais nulas somam 0)', () => {
    const t = classificar(
      ['a', 'b'],
      [
        jogo('a', 'b', 2, 1, { parciais: [{ casa: 25, visitante: 20 }, { casa: 18, visitante: 25 }, { casa: 15, visitante: 10 }] }),
        jogo('b', 'a', 2, 0),
      ],
      reg('sets'), undefined,
    );
    expect(linha(t, 'a')).toMatchObject({
      pontos: 2, vitorias: 1, derrotas: 1, pro: 2, contra: 3, saldo: -1,
      sets_pro: 2, sets_contra: 3, pontos_sets_pro: 58, pontos_sets_contra: 55,
    });
    expect(linha(t, 'b')).toMatchObject({ pontos: 4, sets_pro: 3, sets_contra: 2, pontos_sets_pro: 55, pontos_sets_contra: 58 });
    expect(linha(t, 'b').aproveitamento).toBeCloseTo(4 / 6);
    expect(ordem(t)).toEqual(['b', 'a']);
  });

  it('cestas: a derrota vale 1, mas a derrota por W.O. vale 0 e o placar contado é 20x0', () => {
    const t = classificar(
      ['a', 'b', 'c'],
      [jogo('a', 'b', 70, 60), jogo('c', 'b', 55, 99, { wo: 'casa' })],
      reg('cestas'), undefined,
    );
    expect(linha(t, 'a')).toMatchObject({ pontos: 2, vitorias: 1, pro: 70, contra: 60 });
    expect(linha(t, 'b')).toMatchObject({
      pontos: 3, jogos: 2, vitorias: 1, derrotas: 1, pro: 80, contra: 70,
    });
    expect(linha(t, 'c')).toMatchObject({ pontos: 0, jogos: 1, vitorias: 0, derrotas: 1, pro: 0, contra: 20 });
  });

  it('gols: W.O. dá 0 a quem faltou e conta 3x0, ignorando o placar guardado', () => {
    const t = classificar(['a', 'b'], [jogo('a', 'b', 5, 5, { wo: 'visitante' })], reg('gols'), undefined);
    expect(linha(t, 'a')).toMatchObject({ pontos: 3, vitorias: 1, empates: 0, derrotas: 0, pro: 3, contra: 0, saldo: 3 });
    expect(linha(t, 'b')).toMatchObject({ pontos: 0, vitorias: 0, empates: 0, derrotas: 1, pro: 0, contra: 3, saldo: -3 });
  });

  it('sets: W.O. dá vitória direta e conta os sets do wo_placar', () => {
    const t = classificar(['a', 'b'], [jogo('a', 'b', null, null, { wo: 'casa' })], reg('sets'), undefined);
    expect(linha(t, 'b')).toMatchObject({ pontos: 3, vitorias: 1, sets_pro: 2, sets_contra: 0, pro: 2, contra: 0 });
    expect(linha(t, 'a')).toMatchObject({ pontos: 0, derrotas: 1, sets_pro: 0, sets_contra: 2 });
  });
});

describe('classificar: cada critério decide sozinho um empate de 2 times', () => {
  it('vitorias', () => {
    // t1: 1 vitória (3 pts). t2: 3 empates (3 pts).
    const jogos = [jogo('t1', 'x', 1, 0), jogo('t2', 'x', 0, 0), jogo('t2', 'y', 0, 0), jogo('t2', 'z', 0, 0)];
    const t = classificar(['t2', 't1'], jogos, reg('gols', ['vitorias']), undefined);
    expect(ordem(t)).toEqual(['t1', 't2']);
    expect(t.map((l) => l.posicao)).toEqual([1, 2]);
  });

  it('saldo', () => {
    const jogos = [jogo('t1', 'x', 3, 0), jogo('t2', 'x', 1, 0)];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('gols', ['saldo']), undefined))).toEqual(['t1', 't2']);
  });

  it('pro', () => {
    const jogos = [jogo('t1', 'x', 3, 2), jogo('t2', 'x', 1, 0)];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('gols', ['pro']), undefined))).toEqual(['t1', 't2']);
  });

  it('contra', () => {
    const jogos = [jogo('t1', 'x', 1, 0), jogo('t2', 'x', 3, 2)];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('gols', ['contra']), undefined))).toEqual(['t1', 't2']);
  });

  it('confronto_direto', () => {
    const jogos = [jogo('t2', 't1', 0, 1), jogo('t2', 'x', 1, 0)];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('gols', ['confronto_direto']), undefined))).toEqual(['t1', 't2']);
  });

  it('media_sets', () => {
    // t1: 2x0 (3) e 1x2 (1) = 4 pts, sets 3/2. t2: 2x1 (2) e 2x1 (2) = 4 pts, sets 4/2.
    const jogos = [jogo('t1', 'x', 2, 0), jogo('t1', 'y', 1, 2), jogo('t2', 'x', 2, 1), jogo('t2', 'y', 2, 1)];
    expect(ordem(classificar(['t1', 't2'], jogos, reg('sets', ['media_sets']), undefined))).toEqual(['t2', 't1']);
  });

  it('media_sets: sem sets contra conta como infinito', () => {
    // t1: 2x0 = 3 pts, sets 2/0. t2: 2x1 (2) e 1x2 (1) = 3 pts, sets 3/3.
    const jogos = [jogo('t1', 'x', 2, 0), jogo('t2', 'x', 2, 1), jogo('t2', 'y', 1, 2)];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('sets', ['media_sets']), undefined))).toEqual(['t1', 't2']);
  });

  it('media_pontos_sets', () => {
    const jogos = [
      jogo('t1', 'x', 2, 0, { parciais: [{ casa: 25, visitante: 10 }, { casa: 25, visitante: 10 }] }),
      jogo('t2', 'x', 2, 0, { parciais: [{ casa: 25, visitante: 23 }, { casa: 25, visitante: 23 }] }),
    ];
    expect(ordem(classificar(['t2', 't1'], jogos, reg('sets', ['media_pontos_sets']), undefined))).toEqual(['t1', 't2']);
  });

  it('sorteio', () => {
    const jogos = [jogo('t1', 'x', 1, 0), jogo('t2', 'x', 1, 0)];
    const t = classificar(['t1', 't2'], jogos, reg('gols', ['sorteio']), ['t2', 't1']);
    expect(ordem(t)).toEqual(['t2', 't1']);
    expect(t.map((l) => [l.posicao, l.aguardando_sorteio])).toEqual([[1, false], [2, false]]);
  });
});

describe('classificar: confronto direto', () => {
  it('entre 2 times, depois de vitórias, saldo e pró empatados', () => {
    // t1: venceu t2 2x1, perdeu de y 0x1. t2: perdeu de t1 1x2, venceu x 1x0.
    // Os dois: 3 pts, 1 vitória, 2 pró, 2 contra.
    const jogos = [jogo('t1', 't2', 2, 1), jogo('y', 't1', 1, 0), jogo('t2', 'x', 1, 0)];
    const t = classificar(['t2', 't1'], jogos, reg('gols'), undefined);
    expect(ordem(t)).toEqual(['t1', 't2']);
    expect(t.every((l) => !l.aguardando_sorteio)).toBe(true);
  });

  it('entre 3 times: a mini-tabela separa só o 1º, e os outros 2 se decidem pelo confronto entre eles', () => {
    // Entre t1, t2 e t3: t1 3x0 t2, t3 2x1 t1, t2 2x0 t3 -> 3 pts cada.
    // Mini-tabela pelo saldo: t1 +2, t2 -1, t3 -1. Entre t2 e t3, t2 venceu.
    // t4 vence os três; no saldo da campanha inteira t3 (-2) ficaria à frente de t2 (-6).
    const jogos = [
      jogo('t1', 't2', 3, 0), jogo('t3', 't1', 2, 1), jogo('t2', 't3', 2, 0),
      jogo('t4', 't1', 1, 0), jogo('t4', 't2', 5, 0), jogo('t4', 't3', 1, 0),
    ];
    const r = reg('gols', ['confronto_direto', 'saldo', 'sorteio']);
    const t = classificar(['t3', 't2', 't1', 't4'], jogos, r, undefined);
    expect(ordem(t)).toEqual(['t4', 't1', 't2', 't3']);
    expect(t.map((l) => l.posicao)).toEqual([1, 2, 3, 4]);
    expect(t.every((l) => !l.aguardando_sorteio)).toBe(true);
  });

  it('entre 3 times: se a mini-tabela não separa ninguém, passa ao critério seguinte', () => {
    // Ciclo 1x0 entre t1, t2 e t3: mini-tabela toda empatada (3 pts, 1 pró, 1 contra).
    // Pró na campanha inteira: t3 3, t2 2, t1 1.
    const jogos = [
      jogo('t1', 't2', 1, 0), jogo('t2', 't3', 1, 0), jogo('t3', 't1', 1, 0),
      jogo('t4', 't3', 3, 2), jogo('t4', 't2', 3, 1), jogo('t4', 't1', 3, 0),
    ];
    const r = reg('gols', ['confronto_direto', 'pro', 'sorteio']);
    const t = classificar(['t1', 't2', 't3', 't4'], jogos, r, undefined);
    expect(ordem(t)).toEqual(['t4', 't3', 't2', 't1']);
    expect(t.map((l) => l.posicao)).toEqual([1, 2, 3, 4]);
  });
});

describe('classificar: sorteio', () => {
  const jogos = [jogo('t1', 'x', 1, 0), jogo('t2', 'x', 1, 0)];

  it('pendente: os 2 empatados ficam aguardando, e com o sorteio registrado t2 fica à frente', () => {
    const pendente = classificar(['t1', 't2'], jogos, reg('gols'), undefined);
    expect(ordem(pendente)).toEqual(['t1', 't2']);
    expect(pendente.map((l) => [l.posicao, l.aguardando_sorteio])).toEqual([[1, true], [1, true]]);

    const sorteado = classificar(['t1', 't2'], jogos, reg('gols'), ['t2', 't1']);
    expect(ordem(sorteado)).toEqual(['t2', 't1']);
    expect(sorteado.map((l) => [l.posicao, l.aguardando_sorteio])).toEqual([[1, false], [2, false]]);
  });

  it('sorteio que não traz todos os empatados continua pendente', () => {
    const t = classificar(['t1', 't2'], jogos, reg('gols'), ['t2', 'outro']);
    expect(t.map((l) => [l.time_id, l.posicao, l.aguardando_sorteio])).toEqual([['t1', 1, true], ['t2', 1, true]]);
  });

  it('posições com empate pendente no meio: 1, 2, 2, 4', () => {
    const js = [
      jogo('a', 'x', 5, 0), jogo('a', 'y', 5, 0),
      jogo('b', 'x', 1, 0), jogo('c', 'x', 1, 0),
    ];
    const t = classificar(['d', 'c', 'b', 'a'], js, reg('gols'), undefined);
    expect(t.map((l) => [l.time_id, l.posicao, l.aguardando_sorteio])).toEqual([
      ['a', 1, false], ['c', 2, true], ['b', 2, true], ['d', 4, false],
    ]);
  });

  it('tabela com jogo ainda por disputar não pede sorteio (antes do 1º jogo, todos empatados em 0)', () => {
    const antes = classificar(['t1', 't2', 't3'], [jogo('t1', 't2', null, null, { status: 'agendado' }), jogo('t2', 't3', null, null, { status: 'agendado' })], reg('gols'), undefined);
    expect(antes.map((l) => [l.time_id, l.posicao, l.aguardando_sorteio])).toEqual([['t1', 1, false], ['t2', 2, false], ['t3', 3, false]]);

    const meio = classificar(['t1', 't2'], [...jogos, jogo('t1', 't2', null, null, { status: 'ao_vivo' })], reg('gols'), undefined);
    expect(meio.every((l) => !l.aguardando_sorteio)).toBe(true);
  });

  it('critérios esgotados sem sorteio na lista: mantém a ordem de entrada, posições distintas', () => {
    const t = classificar(['t2', 't1'], jogos, reg('gols', ['vitorias', 'saldo']), undefined);
    expect(t.map((l) => [l.time_id, l.posicao, l.aguardando_sorteio])).toEqual([['t2', 1, false], ['t1', 2, false]]);
  });
});
