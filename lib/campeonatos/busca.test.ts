import { describe, expect, it } from 'vitest';
import { faseAtual } from './busca';

describe('faseAtual', () => {
  it('é a fase do primeiro jogo não encerrado, pela ordem', () => {
    expect(faseAtual([
      { fase: 'Semifinal', ordem: 2, status: 'agendado', rodada: null },
      { fase: 'Quartas de final', ordem: 1, status: 'finalizado', rodada: null },
      { fase: 'Final', ordem: 3, status: 'agendado', rodada: null },
    ])).toBe('Semifinal');
  });
  it('nos pontos corridos mostra a rodada', () => {
    expect(faseAtual([{ fase: 'Pontos corridos', ordem: 1, status: 'agendado', rodada: 4 }])).toBe('Rodada 4');
  });
  it('tudo encerrado → sem fase atual', () => {
    expect(faseAtual([{ fase: 'Final', ordem: 1, status: 'finalizado', rodada: null }])).toBeNull();
  });
});
