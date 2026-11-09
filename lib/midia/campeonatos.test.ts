import { describe, expect, it } from 'vitest';
import { filtrarPorModalidade, slugDaModalidade } from './campeonatos';
import type { ItemAgenda } from './agenda';
import nextConfig from '../../next.config.mjs';

const item = (modalidade: string | null): ItemAgenda => ({
  id: Math.random().toString(36),
  origem: 'agenda',
  modalidade,
  fase: null,
  casa: 'A',
  fora: 'B',
  dataHora: '2099-01-01T00:00:00.000Z',
  local: null,
  transmissao: true,
});

describe('modalidades', () => {
  it('reconhece as formas escritas de cada modalidade', () => {
    expect(['Futsal', 'FUTSAL', 'futsal adulto'].map(slugDaModalidade)).toEqual(['futsal', 'futsal', 'futsal']);
    expect(['Futebol 7', 'futebol7', 'Futebol de 7', 'FUTEBOL 7 SOCIETY'].map(slugDaModalidade)).toEqual(['futebol7', 'futebol7', 'futebol7', 'futebol7']);
    expect(['Basquete', 'Basquetebol'].map(slugDaModalidade)).toEqual(['basquete', 'basquete']);
    expect(['Vôlei', 'Voleibol', 'volei'].map(slugDaModalidade)).toEqual(['volei', 'volei', 'volei']);
    expect(slugDaModalidade('Handebol')).toBeNull();
    expect(slugDaModalidade(null)).toBeNull();
  });

  it('filtra a agenda pela modalidade', () => {
    const itens = [item('Futsal'), item('FUTSAL'), item('Futebol 7'), item(null)];
    expect(filtrarPorModalidade(itens, 'futsal')).toHaveLength(2);
    expect(filtrarPorModalidade(itens, 'futebol7')).toHaveLength(1);
  });
});

describe('rotas antigas', () => {
  it('/tv, /campeonatos e /atletas redirecionam (308)', async () => {
    const r = await nextConfig.redirects!();
    expect(r).toEqual(
      expect.arrayContaining([
        { source: '/tv', destination: '/ao-vivo', permanent: true },
        { source: '/campeonatos', destination: '/modalidades', permanent: true },
        { source: '/atletas', destination: '/atletasdestaques', permanent: true },
      ]),
    );
  });
});
