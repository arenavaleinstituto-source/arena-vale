import { describe, expect, it } from 'vitest';
import { decidirRota, destinoPorCargo, cargoDoBanco } from './rotas';

describe('decidirRota', () => {
  it.each([
    // [rota, cargo, ehDono, esperado]
    ['/proprietario', 'visitante', false, 'nao-encontrado'],
    ['/proprietario', 'coordenador', false, 'nao-encontrado'],
    ['/proprietario/x', 'moderador', false, 'nao-encontrado'],
    ['/proprietario', 'coordenador', true, 'livre'],
    ['/coordenador', 'visitante', false, 'login'],
    ['/coordenador', 'autenticado', false, 'negado'],
    ['/coordenador', 'moderador', false, 'negado'],
    ['/coordenador/atletasdestaques', 'coordenador', false, 'livre'],
    ['/painel/noticias', 'coordenador', false, 'livre'],
    ['/painel', 'capitao', false, 'negado'],
    ['/moderador', 'moderador', false, 'livre'],
    ['/moderador', 'coordenador', false, 'livre'],
    ['/moderador', 'capitao', false, 'negado'],
    ['/moderador', 'visitante', false, 'login'],
    ['/capitao', 'capitao', false, 'livre'],
    ['/capitao', 'coordenador', false, 'livre'],
    ['/capitao', 'moderador', false, 'negado'],
    ['/noticias', 'visitante', false, 'livre'],
    ['/', 'autenticado', false, 'livre'],
    ['/coordenadores-do-vale', 'visitante', false, 'livre'],
  ] as const)('%s com %s (dono=%s) → %s', (rota, cargo, dono, esperado) => {
    expect(decidirRota(rota, cargo, dono)).toBe(esperado);
  });
});

describe('destinoPorCargo', () => {
  it('cada cargo vai para o seu painel', () => {
    expect(destinoPorCargo('coordenador')).toBe('/coordenador');
    expect(destinoPorCargo('moderador')).toBe('/moderador');
    expect(destinoPorCargo('capitao')).toBe('/capitao');
  });

  it('sem cargo não tem destino', () => {
    expect(destinoPorCargo('autenticado')).toBeNull();
    expect(destinoPorCargo('autenticado', '/noticias')).toBeNull();
  });

  it('respeita next permitido para o cargo', () => {
    expect(destinoPorCargo('coordenador', '/painel/noticias')).toBe('/painel/noticias');
    expect(destinoPorCargo('coordenador', '/proprietario', true)).toBe('/proprietario');
  });

  it('next=//site.com é ignorado', () => {
    expect(destinoPorCargo('coordenador', '//site.com')).toBe('/coordenador');
    expect(destinoPorCargo('coordenador', 'https://site.com')).toBe('/coordenador');
  });

  it('next=/moderador para capitão é ignorado', () => {
    expect(destinoPorCargo('capitao', '/moderador')).toBe('/capitao');
  });

  it('next=/proprietario para coordenador comum é ignorado', () => {
    expect(destinoPorCargo('coordenador', '/proprietario', false)).toBe('/coordenador');
  });
});

describe('cargoDoBanco', () => {
  it('converte o role do banco', () => {
    expect(cargoDoBanco(null)).toBe('visitante');
    expect(cargoDoBanco('anonimo')).toBe('autenticado');
    expect(cargoDoBanco('autenticado')).toBe('autenticado');
    expect(cargoDoBanco('coordenador')).toBe('coordenador');
    expect(cargoDoBanco('proprietario')).toBe('coordenador');
    expect(cargoDoBanco('moderador')).toBe('moderador');
    expect(cargoDoBanco('capitao')).toBe('capitao');
  });
});
