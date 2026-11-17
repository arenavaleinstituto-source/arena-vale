import { describe, expect, it } from 'vitest';
import { cruzamentoOlimpico, gerarChave, nomeDaFase, type Entrada } from './chave';
import type { JogoGerado, OpcoesMataMata, Vaga } from './tipos';

const opcoes = (o: Partial<OpcoesMataMata> = {}): OpcoesMataMata => ({
  ida_volta: false,
  final_ida_volta: false,
  terceiro_lugar: false,
  chave: 'sorteio',
  desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' },
  sets_melhor_de: 3,
  ...o,
});

const times = (n: number): Entrada[] => Array.from({ length: n }, (_, i) => ({ time: `T${i + 1}` }));
const g = (grupo: string, posicao: number): Vaga => ({ tipo: 'grupo', grupo, posicao });
const vagas = (es: Entrada[]): Vaga[] => es.map((e) => ('vaga' in e ? e.vaga : (null as never)));
const lado = (j: JogoGerado, l: 'casa' | 'visitante') => j[l] ?? JSON.stringify(j[`vaga_${l}`]);

describe('nomeDaFase', () => {
  it('nomeia as fases pelo número de times', () => {
    expect(nomeDaFase(2)).toBe('Final');
    expect(nomeDaFase(4)).toBe('Semifinal');
    expect(nomeDaFase(8)).toBe('Quartas de final');
    expect(nomeDaFase(16)).toBe('Oitavas de final');
    expect(nomeDaFase(32)).toBe('16 avos de final');
    expect(nomeDaFase(64)).toBe('32 avos de final');
    expect(nomeDaFase(128)).toBe('Fase de 128');
  });
});

describe('cruzamentoOlimpico', () => {
  it('2 grupos, 2 por grupo: 1ºA, 2ºB, 1ºB, 2ºA', () => {
    expect(vagas(cruzamentoOlimpico(['A', 'B'], 2, null))).toEqual([g('A', 1), g('B', 2), g('B', 1), g('A', 2)]);
  });

  it('4 grupos, 2 por grupo: 1ºA,2ºB, 1ºC,2ºD, 1ºB,2ºA, 1ºD,2ºC', () => {
    expect(vagas(cruzamentoOlimpico(['A', 'B', 'C', 'D'], 2, null))).toEqual([
      g('A', 1), g('B', 2), g('C', 1), g('D', 2), g('B', 1), g('A', 2), g('D', 1), g('C', 2),
    ]);
  });

  it('1 por grupo: 1ºA, 1ºB, ... em ordem', () => {
    expect(vagas(cruzamentoOlimpico(['A', 'B', 'C', 'D'], 1, null))).toEqual([g('A', 1), g('B', 1), g('C', 1), g('D', 1)]);
  });

  for (const nGrupos of [2, 4, 8]) {
    it(`${nGrupos} grupos: 1º e 2º do mesmo grupo não se cruzam na 1ª fase e ficam em metades opostas`, () => {
      const grupos = Array.from({ length: nGrupos }, (_, i) => String.fromCharCode(65 + i));
      const lista = vagas(cruzamentoOlimpico(grupos, 2, null)) as Extract<Vaga, { tipo: 'grupo' }>[];
      expect(lista).toHaveLength(nGrupos * 2);
      expect(new Set(lista.map((v) => `${v.grupo}${v.posicao}`)).size).toBe(nGrupos * 2);
      for (let i = 0; i < lista.length; i += 2) expect(lista[i].grupo).not.toBe(lista[i + 1].grupo);
      const metade = lista.length / 2;
      for (const grupo of grupos) {
        const i1 = lista.findIndex((v) => v.grupo === grupo && v.posicao === 1);
        const i2 = lista.findIndex((v) => v.grupo === grupo && v.posicao === 2);
        expect(i1 < metade).not.toBe(i2 < metade);
      }
    });
  }

  it('3 grupos: parceiro cíclico (A→B, B→C, C→A)', () => {
    const lista = vagas(cruzamentoOlimpico(['A', 'B', 'C'], 2, null));
    expect(lista).toHaveLength(6);
    const pares = [];
    for (let i = 0; i < lista.length; i += 2) pares.push([lista[i], lista[i + 1]]);
    expect(pares).toEqual(expect.arrayContaining([
      [g('A', 1), g('B', 2)],
      [g('B', 1), g('C', 2)],
      [g('C', 1), g('A', 2)],
    ]));
  });

  it('4 por grupo: posição p enfrenta a posição (passam+1−p) do grupo parceiro', () => {
    const lista = vagas(cruzamentoOlimpico(['A', 'B'], 4, null)) as Extract<Vaga, { tipo: 'grupo' }>[];
    expect(lista).toHaveLength(8);
    for (let i = 0; i < lista.length; i += 2) {
      expect(lista[i].grupo).not.toBe(lista[i + 1].grupo);
      expect(lista[i].posicao + lista[i + 1].posicao).toBe(5);
    }
  });

  it('extras: o i-ésimo melhor extra enfrenta o 1º do i-ésimo grupo, e esses confrontos vêm primeiro', () => {
    const lista = vagas(cruzamentoOlimpico(['A', 'B', 'C'], 2, { posicao: 3, quantos: 2 }));
    expect(lista).toHaveLength(8);
    expect(lista.slice(0, 4)).toEqual([
      g('A', 1), { tipo: 'extra', posicao: 3, indice: 1 },
      g('B', 1), { tipo: 'extra', posicao: 3, indice: 2 },
    ]);
    const chaves = lista.map((v) => JSON.stringify(v));
    expect(new Set(chaves).size).toBe(8);
    for (const grupo of ['A', 'B', 'C']) {
      expect(chaves).toContain(JSON.stringify(g(grupo, 1)));
      expect(chaves).toContain(JSON.stringify(g(grupo, 2)));
    }
  });
});

describe('gerarChave — invariantes em jogo único', () => {
  for (let n = 2; n <= 32; n++) {
    for (const terceiro of [false, true]) {
      it(`n=${n} terceiro_lugar=${terceiro}`, () => {
        const jogos = gerarChave(times(n), opcoes({ terceiro_lugar: terceiro }), 1);
        const extra = terceiro && n >= 4 ? 1 : 0;
        expect(jogos).toHaveLength(n - 1 + extra);
        expect(jogos.map((j) => j.ordem)).toEqual(jogos.map((_, i) => i + 1));
        const ordens = new Set(jogos.map((j) => j.ordem));
        const citadas: string[] = [];
        const timesVistos: string[] = [];
        for (const j of jogos) {
          expect(j.rodada).toBeNull();
          expect(j.grupo).toBeNull();
          expect(j.volta_de).toBeNull();
          for (const l of ['casa', 'visitante'] as const) {
            const v = j[`vaga_${l}`];
            if (j[l] !== null) {
              expect(v).toBeNull();
              timesVistos.push(j[l] as string);
            } else {
              expect(v).not.toBeNull();
              if (v && (v.tipo === 'vencedor' || v.tipo === 'perdedor')) {
                expect(ordens.has(v.jogo)).toBe(true);
                expect(v.jogo).toBeLessThan(j.ordem);
                citadas.push(`${v.tipo}:${v.jogo}`);
              }
            }
          }
        }
        expect(new Set(timesVistos).size).toBe(timesVistos.length);
        expect(timesVistos.length).toBe(n);
        expect(new Set(citadas).size).toBe(citadas.length);
        expect(jogos[jogos.length - 1].fase).toBe('Final');
        if (extra) expect(jogos[jogos.length - 2].fase).toBe('Disputa de 3º lugar');
      });
    }
  }

  it('menos de 2 entradas: nenhum jogo', () => {
    expect(gerarChave([], opcoes(), 1)).toEqual([]);
    expect(gerarChave(times(1), opcoes(), 1)).toEqual([]);
  });

  it('ordem começa em ordemInicial', () => {
    const jogos = gerarChave(times(4), opcoes(), 10);
    expect(jogos.map((j) => j.ordem)).toEqual([10, 11, 12]);
    expect(jogos[2].vaga_casa).toEqual({ tipo: 'vencedor', jogo: 10 });
    expect(jogos[2].vaga_visitante).toEqual({ tipo: 'vencedor', jogo: 11 });
  });

  it('2 entradas com terceiro_lugar: só a final', () => {
    const jogos = gerarChave(times(2), opcoes({ terceiro_lugar: true }), 1);
    expect(jogos).toHaveLength(1);
    expect(jogos[0]).toMatchObject({ fase: 'Final', casa: 'T1', visitante: 'T2' });
  });

  it('entradas com vaga: time null e vaga preenchida', () => {
    const jogos = gerarChave([{ vaga: g('A', 1) }, { vaga: g('B', 2) }], opcoes(), 1);
    expect(jogos[0]).toMatchObject({ casa: null, visitante: null, vaga_casa: g('A', 1), vaga_visitante: g('B', 2) });
  });
});

describe('gerarChave — fase preliminar', () => {
  it('6 entradas: preliminar com as 4 últimas, as 2 primeiras direto na semifinal', () => {
    const jogos = gerarChave(times(6), opcoes(), 1);
    const pre = jogos.filter((j) => j.fase === 'Fase preliminar');
    expect(pre.map((j) => [j.casa, j.visitante])).toEqual([['T3', 'T4'], ['T5', 'T6']]);
    const semi = jogos.filter((j) => j.fase === 'Semifinal');
    expect(semi.map((j) => [lado(j, 'casa'), lado(j, 'visitante')])).toEqual([
      ['T1', JSON.stringify({ tipo: 'vencedor', jogo: pre[0].ordem })],
      ['T2', JSON.stringify({ tipo: 'vencedor', jogo: pre[1].ordem })],
    ]);
    expect(jogos.map((j) => j.fase)).toEqual(['Fase preliminar', 'Fase preliminar', 'Semifinal', 'Semifinal', 'Final']);
  });

  it('7 entradas: preliminar com as 6 últimas, a 1ª enfrenta o vencedor do 1º jogo preliminar', () => {
    const jogos = gerarChave(times(7), opcoes(), 1);
    const pre = jogos.filter((j) => j.fase === 'Fase preliminar');
    expect(pre.map((j) => [j.casa, j.visitante])).toEqual([['T2', 'T3'], ['T4', 'T5'], ['T6', 'T7']]);
    const semi = jogos.filter((j) => j.fase === 'Semifinal');
    expect(semi.map((j) => [lado(j, 'casa'), lado(j, 'visitante')])).toEqual([
      ['T1', JSON.stringify({ tipo: 'vencedor', jogo: pre[0].ordem })],
      [JSON.stringify({ tipo: 'vencedor', jogo: pre[1].ordem }), JSON.stringify({ tipo: 'vencedor', jogo: pre[2].ordem })],
    ]);
  });
});

describe('gerarChave — ida e volta', () => {
  it('ida_volta com 4 entradas e final em jogo único: semifinal com 4 jogos, final com 1', () => {
    const jogos = gerarChave(times(4), opcoes({ ida_volta: true }), 1);
    const semi = jogos.filter((j) => j.fase === 'Semifinal');
    expect(semi).toHaveLength(4);
    expect(semi.filter((j) => j.volta_de !== null)).toHaveLength(2);
    const final = jogos.filter((j) => j.fase === 'Final');
    expect(final).toHaveLength(1);
    expect(final[0].volta_de).toBeNull();
    expect(final[0].vaga_casa).toEqual({ tipo: 'vencedor', jogo: 1 });
    expect(final[0].vaga_visitante).toEqual({ tipo: 'vencedor', jogo: 3 });
  });

  it('jogo de volta vem logo após a ida, com volta_de e mando invertido (times e vagas)', () => {
    const jogos = gerarChave(times(4), opcoes({ ida_volta: true, final_ida_volta: true, terceiro_lugar: true }), 1);
    expect(jogos.map((j) => j.fase)).toEqual([
      'Semifinal', 'Semifinal', 'Semifinal', 'Semifinal',
      'Disputa de 3º lugar', 'Disputa de 3º lugar', 'Final', 'Final',
    ]);
    const [ida, volta] = jogos;
    expect(ida).toMatchObject({ ordem: 1, casa: 'T1', visitante: 'T2', volta_de: null });
    expect(volta).toMatchObject({ ordem: 2, casa: 'T2', visitante: 'T1', volta_de: 1 });
    const [t3ida, t3volta, fIda, fVolta] = jogos.slice(4);
    expect(t3ida).toMatchObject({ vaga_casa: { tipo: 'perdedor', jogo: 1 }, vaga_visitante: { tipo: 'perdedor', jogo: 3 }, volta_de: null });
    expect(t3volta).toMatchObject({ vaga_casa: { tipo: 'perdedor', jogo: 3 }, vaga_visitante: { tipo: 'perdedor', jogo: 1 }, volta_de: t3ida.ordem });
    expect(fIda).toMatchObject({ vaga_casa: { tipo: 'vencedor', jogo: 1 }, vaga_visitante: { tipo: 'vencedor', jogo: 3 } });
    expect(fVolta).toMatchObject({ casa: null, visitante: null, vaga_casa: { tipo: 'vencedor', jogo: 3 }, vaga_visitante: { tipo: 'vencedor', jogo: 1 }, volta_de: fIda.ordem });
  });

  it('ida_volta vale para a fase preliminar', () => {
    const jogos = gerarChave(times(3), opcoes({ ida_volta: true }), 1);
    expect(jogos.map((j) => [j.fase, j.casa, j.visitante, j.volta_de])).toEqual([
      ['Fase preliminar', 'T2', 'T3', null],
      ['Fase preliminar', 'T3', 'T2', 1],
      ['Final', 'T1', null, null],
    ]);
    expect(jogos[2].vaga_visitante).toEqual({ tipo: 'vencedor', jogo: 1 });
  });
});
