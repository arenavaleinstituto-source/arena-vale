import { describe, expect, it } from 'vitest';
import { montagemParaGerar } from './MontagemManual';
import type { FormaDisputa } from '@/lib/campeonatos/tipos';

const MATA = { ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio' as const, desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' as const }, sets_melhor_de: 3 as const };
const MANUAL: FormaDisputa = { tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 2, melhores_extras: 0, montagem: 'manual', ida_volta_grupos: false, mata: MATA };
const TIMES = [{ id: 'a', nome: 'A' }, { id: 'b', nome: 'B' }] as never;

describe('montagemParaGerar', () => {
  it('grupos manuais ainda não montados nesta tela: não manda grupos (o servidor usa os já gravados)', () => {
    expect(montagemParaGerar(MANUAL, TIMES, {}, [])).toEqual({});
  });
  it('grupos manuais montados: manda os grupos', () => {
    expect(montagemParaGerar(MANUAL, TIMES, { A: ['a'], B: ['b'] }, [])).toEqual({ grupos: { A: ['a'], B: ['b'] } });
  });
});
