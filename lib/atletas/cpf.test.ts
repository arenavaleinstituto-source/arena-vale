import { describe, expect, it } from 'vitest';
import { cpfValido, formatarCpf, mascararCpf, soDigitos } from './cpf';

describe('CPF', () => {
  it('confere os dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224725')).toBe(true);
    expect(cpfValido('529.982.247-24')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('123')).toBe(false);
  });

  it('formata enquanto digita e guarda só os números', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
    expect(formatarCpf('5299')).toBe('529.9');
    expect(soDigitos('529.982.247-25')).toBe('52998224725');
  });

  it('mostra mascarado na lista', () => {
    expect(mascararCpf('52998224725')).toBe('529...');
    expect(mascararCpf(null)).toBe('—');
  });
});
