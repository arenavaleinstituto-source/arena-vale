import { describe, expect, it } from 'vitest';
import { fraseDaModalidade, MODALIDADES_SITE, slugDoNome } from './modalidades';
import { slugDaModalidade } from './campeonatos';

describe('modalidades', () => {
  it('cria o identificador a partir do nome', () => {
    expect(slugDoNome('Beach Tennis')).toBe('beach-tennis');
    expect(slugDoNome('  Vôlei de Praia ')).toBe('volei-de-praia');
    expect(slugDoNome('Futebol 7')).toBe('futebol-7');
    expect(slugDoNome('Handebol!!')).toBe('handebol');
  });

  it('frase padrão: "O palco do <modalidade> é aqui."', () => {
    expect(fraseDaModalidade('Handebol')).toBe('O palco do handebol é aqui.');
  });

  it('as 4 de sempre continuam como reserva', () => {
    expect(MODALIDADES_SITE.map((m) => m.slug)).toEqual(['futsal', 'futebol7', 'basquete', 'volei']);
  });

  it('a agenda reconhece modalidades novas pelo nome', () => {
    expect(slugDaModalidade('Beach Tennis')).toBe('beach-tennis');
    expect(slugDaModalidade('Futebol de 7')).toBe('futebol7');
    expect(slugDaModalidade('Basquetebol')).toBe('basquete');
    expect(slugDaModalidade('Vôlei de Praia')).toBe('volei-de-praia');
    expect(slugDaModalidade('Vôlei Feminino')).toBe('volei');
    expect(slugDaModalidade('Futsal Adulto')).toBe('futsal');
  });
});
