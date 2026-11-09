import { describe, expect, it } from 'vitest';
import { ABAS_COORD, abaValida } from './abas';

describe('abas do painel da coordenação', () => {
  it('13 abas, nesta ordem', () => {
    expect(ABAS_COORD.map((a) => a.id)).toEqual([
      'visao',
      'aovivo',
      'noticias',
      'videos',
      'jogos',
      'campeonatos',
      'inscricoes',
      'sumulas',
      'moderadores',
      'capitaes',
      'patrocinadores',
      'destaques',
      'config',
    ]);
    expect(ABAS_COORD.map((a) => a.rotulo)).toEqual([
      'Visão geral',
      'Ao Vivo',
      'Notícias',
      'Vídeos',
      'Agenda e jogos',
      'Campeonatos',
      'Inscrições',
      'Súmulas',
      'Moderadores',
      'Capitães',
      'Patrocinadores',
      'Atletas destaque',
      'Configurações',
    ]);
  });

  it('aba desconhecida ou vazia vira Visão geral', () => {
    expect(abaValida('xyz')).toBe('visao');
    expect(abaValida(null)).toBe('visao');
    expect(abaValida('noticias')).toBe('noticias');
  });
});
