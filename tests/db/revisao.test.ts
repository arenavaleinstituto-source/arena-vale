import { beforeEach, describe, expect, it } from 'vitest';
import { convidar, portasSupabase } from '../../lib/auth/convites';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';
import { jogo, montarCenario, type Cenario } from './cenario';

let c: Cenario;

describe('correções da revisão final (Fase 2)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
  });

  // Crítico 1 — sequestro de convite
  it('usuário não troca o próprio profiles.email', async () => {
    const u = await criarUsuario('autenticado');
    const cli = await clienteComo(u);
    await cli.from('profiles').update({ email: 'alvo@exemplo.com' }).eq('id', u.id);
    const { data } = await admin().from('profiles').select('email').eq('id', u.id).single();
    expect(data?.email).toBe(u.email);
  });

  it('convite procura a conta pelo e-mail exato do Auth (sem curingas)', async () => {
    const certo = await criarUsuario('autenticado');
    const parecido = certo.email.replace('teste+', 'teste_');
    const r = await convidar({ email: parecido, cargo: 'capitao', campeonatoId: c.campA }, {
      quemChama: { cargo: 'coordenador', ehDono: false },
      origem: 'http://x',
      ...portasSupabase(admin()),
      convidarPorEmail: async () => { throw new Error('convite novo (esperado: não achou conta existente)'); },
    }).catch((e) => ({ erro: (e as Error).message }));
    expect(r).toEqual({ erro: 'convite novo (esperado: não achou conta existente)' });
    const { data } = await admin().from('profiles').select('role').eq('id', certo.id).single();
    expect(data?.role).toBe('autenticado');
  });

  // Importante 4 — vínculo sem cargo não dá acesso; cargo novo apaga vínculos
  it('vínculo de moderador sem o cargo moderador não lança placar', async () => {
    const u = await criarUsuario('autenticado');
    await admin().from('campeonato_moderadores').insert({ profile_id: u.id, campeonato_id: c.campA });
    await (await clienteComo(u)).from('jogos').update({ placar_casa: 4 }).eq('id', c.jogoA);
    expect((await jogo(c.jogoA)).placar_casa).toBe(0);
  });

  it('rebaixar o moderador apaga os vínculos dele', async () => {
    const coord = await criarUsuario('coordenador');
    await (await clienteComo(coord)).rpc('definir_cargo', { perfil: c.moderador.id, cargo: 'autenticado' });
    const { data } = await admin().from('campeonato_moderadores').select('*').eq('profile_id', c.moderador.id);
    expect(data).toEqual([]);
  });

  it('moderador só lê solicitações de inscrição do seu campeonato', async () => {
    const base = { equipe_nome: 'X', responsavel_nome: 'R', responsavel_cpf: '1', responsavel_email: 'r@e.com', responsavel_telefone: '1', categoria: 'Adulto', autorizacao_responsavel: true };
    await admin().from('solicitacoes_inscricao').insert([{ ...base, campeonato_id: c.campA }, { ...base, campeonato_id: c.campB }]);
    const { data } = await (await clienteComo(c.moderador)).from('solicitacoes_inscricao').select('campeonato_id');
    expect((data ?? []).map((d) => d.campeonato_id)).toEqual([c.campA]);
  });

  // Importante 5 — coordenador não descobre quem é o dono
  it('a mensagem de erro é a mesma para o dono e para outro coordenador', async () => {
    const dono = await criarUsuario('coordenador', { dono: true });
    const outro = await criarUsuario('coordenador');
    const eu = await clienteComo(await criarUsuario('coordenador'));
    const a = await eu.rpc('definir_cargo', { perfil: dono.id, cargo: 'moderador' });
    const b = await eu.rpc('definir_cargo', { perfil: outro.id, cargo: 'moderador' });
    expect(a.error?.message).toBeTruthy();
    expect(a.error?.message).toBe(b.error?.message);
  });

  // Importante 6 — dados pessoais
  it('visitante não lê perfis (e-mail, CPF, telefone)', async () => {
    await criarUsuario('autenticado');
    const { data } = await visitante().from('profiles').select('email, cpf, phone');
    expect(data ?? []).toEqual([]);
  });

  it('usuário comum lê só o próprio perfil', async () => {
    const u = await criarUsuario('autenticado');
    await criarUsuario('autenticado');
    const { data } = await (await clienteComo(u)).from('profiles').select('id');
    expect((data ?? []).map((d) => d.id)).toEqual([u.id]);
  });

  it('coordenador não edita o perfil de outro coordenador', async () => {
    const alvo = await criarUsuario('coordenador');
    const eu = await clienteComo(await criarUsuario('coordenador'));
    await eu.from('profiles').update({ full_name: 'Alterado' }).eq('id', alvo.id);
    const { data } = await admin().from('profiles').select('full_name').eq('id', alvo.id).single();
    expect(data?.full_name).not.toBe('Alterado');
  });

  // Importante 7 — inscrições e classificação
  it('visitante não insere inscrição', async () => {
    const { error } = await visitante().from('inscricoes').insert({ campeonato_id: c.campB, time_id: c.casa, status: 'aprovada' });
    expect(error).not.toBeNull();
  });

  it('equipe com inscrição pendente não aparece na classificação', async () => {
    const cap = await clienteComo(c.capitao);
    const { data: timeId } = await cap.rpc('criar_minha_equipe', { campeonato: c.campA, nome: 'Pendentes', sigla: 'PEN' });
    const { data } = await admin().from('v_classificacao').select('time_id').eq('campeonato_id', c.campA);
    expect((data ?? []).map((d) => d.time_id)).not.toContain(timeId);
  });
});
