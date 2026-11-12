import { describe, expect, it } from 'vitest';
import { extrairParceiro } from './parceiro';

describe('extrairParceiro', () => {
  it('acha o perfil e tira a marcação do texto', () => {
    expect(extrairParceiro('Recorde! parceiro @egidiobeckhausersc\ntexto')).toEqual({
      perfil: 'egidiobeckhausersc',
      texto: 'Recorde!\ntexto',
    });
  });

  it('aceita "Parceiro" com maiúscula e em linha própria', () => {
    expect(extrairParceiro('Recorde\nParceiro @egidio')).toEqual({ perfil: 'egidio', texto: 'Recorde' });
  });

  it('perfil com ponto e sublinhado', () => {
    expect(extrairParceiro('parceiro @foto.esporte_sc')?.perfil).toBe('foto.esporte_sc');
  });

  it('sem perfil, perfil longo demais ou sem marcação: null', () => {
    expect(extrairParceiro('parceiro @')).toBeNull();
    expect(extrairParceiro(`parceiro @${'a'.repeat(31)}`)).toBeNull();
    expect(extrairParceiro('Golaço no fim do jogo')).toBeNull();
  });
});
