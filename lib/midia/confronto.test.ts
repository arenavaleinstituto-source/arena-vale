import { describe, expect, it } from 'vitest';
import { extrairConfronto, limparConfronto } from './confronto';

describe('extrairConfronto', () => {
  it('acha "Time x Time" no texto, com ou sem placar', () => {
    expect(extrairConfronto('Flamengo x Palmeiras: veja os gols')).toBe('FLAMENGO x PALMEIRAS');
    expect(extrairConfronto('GOLS: Grêmio 2 x 1 Internacional')).toBe('GRÊMIO x INTERNACIONAL');
    expect(extrairConfronto('Real Madrid vs Barcelona hoje')).toBe('REAL MADRID x BARCELONA');
    expect(extrairConfronto('Água Verde X Vila Nova - final')).toBe('ÁGUA VERDE x VILA NOVA');
  });

  it('pega o time escrito depois de "do/de" e antes da pontuação', () => {
    expect(extrairConfronto('Golaço do Corinthians x São Paulo!')).toBe('CORINTHIANS x SÃO PAULO');
  });

  it('sem confronto no texto: null', () => {
    expect(extrairConfronto('GOL DO FLAMENGO! Pedro marca de cabeça')).toBeNull();
    expect(extrairConfronto('')).toBeNull();
  });
});

describe('limparConfronto', () => {
  it('padroniza o que o coordenador digita', () => {
    expect(limparConfronto('  flamengo  X   palmeiras ')).toBe('FLAMENGO x PALMEIRAS');
    expect(limparConfronto('')).toBeNull();
    expect(limparConfronto('Seleção Brasileira')).toBe('SELEÇÃO BRASILEIRA');
  });
});
