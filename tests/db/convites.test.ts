import { beforeEach, describe, expect, it } from 'vitest';
import { convidar, portasSupabase } from '../../lib/auth/convites';
import { admin, criarUsuario, limparCoordenadores, visitante } from './fixtures';
import { montarCenario, type Cenario } from './cenario';

let c: Cenario;
const coord = { cargo: 'coordenador' as const, ehDono: false };

describe('convites com o banco (portasSupabase)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
  });

  it('conta existente vira moderador do campeonato B sem novo convite', async () => {
    const u = await criarUsuario('autenticado');
    const r = await convidar({ email: u.email, cargo: 'moderador', campeonatoId: c.campB }, { quemChama: coord, origem: 'http://x', ...portasSupabase(admin()) });
    expect(r).toEqual({ ok: true, jaTinhaConta: true });
    const { data: perfil } = await admin().from('profiles').select('role').eq('id', u.id).single();
    expect(perfil?.role).toBe('moderador');
    const { data: vinculo } = await admin().from('campeonato_moderadores').select('*').eq('profile_id', u.id).eq('campeonato_id', c.campB);
    expect(vinculo).toHaveLength(1);
  });

  it('capitão cadastrado com senha entra com e-mail e senha e já é capitão do campeonato', async () => {
    const email = `teste+capsenha-${Date.now()}@arenavale.test`;
    const r = await convidar({ email, cargo: 'capitao', campeonatoId: c.campA, senha: 'Senha-forte-123', nome: 'Carlos Capitão' }, { quemChama: coord, origem: 'http://x', ...portasSupabase(admin()) });
    expect(r).toEqual({ ok: true, jaTinhaConta: false });
    const cli = visitante();
    const { data, error } = await cli.auth.signInWithPassword({ email, password: 'Senha-forte-123' });
    expect(error).toBeNull();
    const { data: perfil } = await admin().from('profiles').select('role, full_name').eq('id', data.user!.id).single();
    expect(perfil).toEqual({ role: 'capitao', full_name: 'Carlos Capitão' });
    const { data: vinculo } = await admin().from('time_capitaes').select('id').eq('profile_id', data.user!.id).eq('campeonato_id', c.campA);
    expect(vinculo).toHaveLength(1);
  });

  it('convidar o mesmo capitão duas vezes não duplica o convite', async () => {
    const u = await criarUsuario('autenticado');
    const deps = { quemChama: coord, origem: 'http://x', ...portasSupabase(admin()) };
    await convidar({ email: u.email, cargo: 'capitao', campeonatoId: c.campA }, deps);
    const r = await convidar({ email: u.email, cargo: 'capitao', campeonatoId: c.campA }, deps);
    expect(r.ok).toBe(true);
    const { data } = await admin().from('time_capitaes').select('id').eq('profile_id', u.id).eq('campeonato_id', c.campA);
    expect(data).toHaveLength(1);
  });

  it('limite de coordenadores do banco volta como erro 400', async () => {
    await criarUsuario('coordenador', { dono: true });
    await criarUsuario('coordenador');
    await criarUsuario('coordenador');
    const u = await criarUsuario('autenticado');
    const r = await convidar({ email: u.email, cargo: 'coordenador' }, { quemChama: { cargo: 'coordenador', ehDono: true }, origem: 'http://x', ...portasSupabase(admin()) });
    expect(r).toEqual({ ok: false, status: 400, erro: 'Limite de 3 coordenadores atingido.' });
  });
});
