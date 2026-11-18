import { describe, expect, it } from 'vitest';
import { paraJogoCalc } from './portas';
import { classificar } from './classificacao';
import { regulamentoPadrao } from './regulamento';

const linha = (o: Record<string, unknown>) =>
  ({
    id: 'j', ordem: null, fase: 'fase_grupos', grupo: null, rodada: null, time_casa_id: 'a', time_visitante_id: 'b', status: 'finalizado',
    placar_casa: 2, placar_visitante: 0, penaltis_casa: null, penaltis_visitante: null, wo: null, parciais: null,
    vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null, ...o,
  }) as never;

describe('paraJogoCalc', () => {
  it('jogo antigo (sem ordem, fase padrão "fase_grupos" ou vazia) conta como pontos corridos', () => {
    expect(paraJogoCalc(linha({})).fase).toBe('Pontos corridos');
    expect(paraJogoCalc(linha({ fase: null })).fase).toBe('Pontos corridos');
  });

  it('jogo gerado pelo site (com ordem) mantém a fase', () => {
    expect(paraJogoCalc(linha({ ordem: 3, fase: 'Fase de grupos', grupo: 'A' })).fase).toBe('Fase de grupos');
    expect(paraJogoCalc(linha({ ordem: 9, fase: 'Final' })).fase).toBe('Final');
  });

  it('campeonato antigo de pontos corridos tem a classificação com os jogos antigos', () => {
    const jogos = [paraJogoCalc(linha({ id: 'j1' })), paraJogoCalc(linha({ id: 'j2', time_casa_id: 'b', time_visitante_id: 'a', placar_casa: 1, placar_visitante: 1 }))];
    const t = classificar(['a', 'b'], jogos.filter((j) => j.fase === 'Pontos corridos'), regulamentoPadrao('gols'), undefined);
    expect(t.map((l) => [l.time_id, l.pontos, l.jogos])).toEqual([['a', 4, 2], ['b', 1, 2]]);
  });
});
