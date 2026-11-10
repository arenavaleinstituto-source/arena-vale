import { beforeEach, describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';

describe('modalidades editáveis (0015)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    await admin().from('modalidades').delete().not('slug', 'in', '(futsal,futebol7,basquete,volei)');
  });

  it('as 4 modalidades de sempre já vêm cadastradas, em ordem', async () => {
    const { data } = await visitante().from('modalidades').select('slug, nome').eq('ativo', true).order('ordem');
    expect(data?.slice(0, 4)).toEqual([
      { slug: 'futsal', nome: 'Futsal' },
      { slug: 'futebol7', nome: 'Futebol 7' },
      { slug: 'basquete', nome: 'Basquete' },
      { slug: 'volei', nome: 'Vôlei' },
    ]);
  });

  it('coordenação adiciona modalidade; moderador não', async () => {
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const ok = await coord.from('modalidades').insert({ slug: 'handebol', nome: 'Handebol', frase: 'O palco do handebol é aqui.', ordem: 5 });
    expect(ok.error).toBeNull();
    const mod = await clienteComo(await criarUsuario('moderador'));
    const ruim = await mod.from('modalidades').insert({ slug: 'xadrez', nome: 'Xadrez' });
    expect(ruim.error).not.toBeNull();
  });

  it('modalidade escondida (ativo = false) some para o visitante', async () => {
    await admin().from('modalidades').insert({ slug: 'peteca', nome: 'Peteca', ativo: false });
    const { data } = await visitante().from('modalidades').select('slug').eq('slug', 'peteca');
    expect(data).toEqual([]);
  });

  it('campeonato aceita modalidade nova cadastrada e recusa uma que não existe', async () => {
    await admin().from('modalidades').insert({ slug: 'handebol', nome: 'Handebol' });
    const ok = await admin().from('campeonatos').insert({ nome: 'Copa Handebol', ano: 2027, modalidade: 'handebol' });
    expect(ok.error).toBeNull();
    const ruim = await admin().from('campeonatos').insert({ nome: 'Copa Fantasma', ano: 2027, modalidade: 'nao-existe' });
    expect(ruim.error?.code).toBe('23503');
  });

  it('identificador só com letras minúsculas, números e hífen', async () => {
    const r = await admin().from('modalidades').insert({ slug: 'Beach Tennis', nome: 'Beach Tennis' });
    expect(r.error?.code).toBe('23514');
  });
});
