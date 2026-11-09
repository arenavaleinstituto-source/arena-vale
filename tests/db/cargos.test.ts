import { beforeEach, describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, limparCoordenadores } from './fixtures';

async function cargoDe(id: string) {
  const { data } = await admin().from('profiles').select('role').eq('id', id).single();
  return data?.role;
}

describe('cargos (0009)', () => {
  beforeEach(async () => { await limparCoordenadores(); });

  it('usuário comum não muda o próprio role', async () => {
    const u = await criarUsuario('autenticado');
    const c = await clienteComo(u);
    await c.from('profiles').update({ role: 'coordenador' }).eq('id', u.id);
    expect(await cargoDe(u.id)).toBe('autenticado');
  });

  it('coordenador não promove ninguém a coordenador', async () => {
    const coord = await criarUsuario('coordenador');
    const alvo = await criarUsuario('autenticado');
    const { error } = await (await clienteComo(coord)).rpc('definir_cargo', { perfil: alvo.id, cargo: 'coordenador' });
    expect(error?.message).toMatch(/proprietário/i);
    expect(await cargoDe(alvo.id)).toBe('autenticado');
  });

  it('coordenador define moderador e capitão', async () => {
    const coord = await criarUsuario('coordenador');
    const a = await criarUsuario('autenticado');
    const b = await criarUsuario('autenticado');
    const c = await clienteComo(coord);
    expect((await c.rpc('definir_cargo', { perfil: a.id, cargo: 'moderador' })).error).toBeNull();
    expect((await c.rpc('definir_cargo', { perfil: b.id, cargo: 'capitao' })).error).toBeNull();
    expect(await cargoDe(a.id)).toBe('moderador');
    expect(await cargoDe(b.id)).toBe('capitao');
  });

  it('coordenador não rebaixa outro coordenador nem o dono', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const coord = await criarUsuario('coordenador');
    const outro = await criarUsuario('coordenador');
    const c = await clienteComo(coord);
    expect((await c.rpc('definir_cargo', { perfil: outro.id, cargo: 'autenticado' })).error).not.toBeNull();
    expect((await c.rpc('definir_cargo', { perfil: dono.id, cargo: 'autenticado' })).error).not.toBeNull();
    expect(await cargoDe(outro.id)).toBe('coordenador');
    expect(await cargoDe(dono.id)).toBe('coordenador');
  });

  it('coordenador não remove o próprio cargo', async () => {
    const coord = await criarUsuario('coordenador');
    const { error } = await (await clienteComo(coord)).rpc('definir_cargo', { perfil: coord.id, cargo: 'autenticado' });
    expect(error).not.toBeNull();
    expect(await cargoDe(coord.id)).toBe('coordenador');
  });

  it('dono promove até o limite (3) e o 4º é recusado', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const c = await clienteComo(dono);
    const [a, b, d] = await Promise.all([criarUsuario('autenticado'), criarUsuario('autenticado'), criarUsuario('autenticado')]);
    expect((await c.rpc('definir_cargo', { perfil: a.id, cargo: 'coordenador' })).error).toBeNull();
    expect((await c.rpc('definir_cargo', { perfil: b.id, cargo: 'coordenador' })).error).toBeNull();
    const quarto = await c.rpc('definir_cargo', { perfil: d.id, cargo: 'coordenador' });
    expect(quarto.error?.message).toMatch(/Limite de 3 coordenadores/);
  });

  it('dono sobe o limite para 4 e o 4º é aceito', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const c = await clienteComo(dono);
    await criarUsuario('coordenador');
    await criarUsuario('coordenador');
    const quarto = await criarUsuario('autenticado');
    expect((await c.rpc('definir_limite_coordenadores', { n: 4 })).error).toBeNull();
    expect((await c.rpc('definir_cargo', { perfil: quarto.id, cargo: 'coordenador' })).error).toBeNull();
  });

  it('coordenador comum não muda o limite', async () => {
    await criarUsuario('coordenador', { dono: true });
    const coord = await criarUsuario('coordenador');
    const { error } = await (await clienteComo(coord)).rpc('definir_limite_coordenadores', { n: 5 });
    expect(error).not.toBeNull();
  });

  it('baixar o limite sem escolher quem sai falha', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    await criarUsuario('coordenador');
    await criarUsuario('coordenador');
    const { error } = await (await clienteComo(dono)).rpc('definir_limite_coordenadores', { n: 2 });
    expect(error).not.toBeNull();
  });

  it('baixar de 3 para 2 removendo 1 funciona e a pessoa vira autenticado', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const sai = await criarUsuario('coordenador');
    await criarUsuario('coordenador');
    const { error } = await (await clienteComo(dono)).rpc('definir_limite_coordenadores', { n: 2, remover: [sai.id] });
    expect(error).toBeNull();
    expect(await cargoDe(sai.id)).toBe('autenticado');
  });

  it('dono aparece com role coordenador para quem pode ler perfis (a coordenação)', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const leitor = await clienteComo(await criarUsuario('coordenador'));
    const { data } = await leitor.from('profiles').select('role').eq('id', dono.id).single();
    expect(data?.role).toBe('coordenador');
  });

  it('coordenador comum lê a tabela proprietario vazia', async () => {
    await criarUsuario('coordenador', { dono: true });
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const { data } = await coord.from('proprietario').select('*');
    expect(data ?? []).toEqual([]);
  });

  it('is_proprietario é true só para o dono', async () => {
    const dono = await clienteComo(await criarUsuario('coordenador', { dono: true }));
    const coord = await clienteComo(await criarUsuario('coordenador'));
    expect((await dono.rpc('is_proprietario')).data).toBe(true);
    expect((await coord.rpc('is_proprietario')).data).toBe(false);
  });
});
