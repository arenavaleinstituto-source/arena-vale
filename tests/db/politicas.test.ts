import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { carregarEnvTeste } from '../../scripts/db/teste-env';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';
import { jogo, montarCenario, type Cenario } from './cenario';

let c: Cenario;

describe('políticas por cargo (0010)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
  });

  it('moderador lança placar no jogo do seu campeonato', async () => {
    const m = await clienteComo(c.moderador);
    const { error } = await m.from('jogos').update({ placar_casa: 2, placar_visitante: 1, status: 'finalizado' }).eq('id', c.jogoA);
    expect(error).toBeNull();
    expect((await jogo(c.jogoA)).placar_casa).toBe(2);
  });

  it('moderador não lança placar em outro campeonato', async () => {
    const m = await clienteComo(c.moderador);
    await m.from('jogos').update({ placar_casa: 9 }).eq('id', c.jogoB);
    expect((await jogo(c.jogoB)).placar_casa).toBe(0);
  });

  it('moderador muda placar + data na mesma requisição → nada é gravado', async () => {
    const antes = await jogo(c.jogoA);
    const m = await clienteComo(c.moderador);
    const { error } = await m.from('jogos').update({ placar_casa: 5, data: '2030-01-01T10:00:00Z' }).eq('id', c.jogoA);
    expect(error?.message).toMatch(/Moderador só lança resultados/);
    const depois = await jogo(c.jogoA);
    expect(depois.placar_casa).toBe(0);
    expect(depois.data).toBe(antes.data);
  });

  it('moderador lança evento (gol) e cria súmula do seu campeonato', async () => {
    const m = await clienteComo(c.moderador);
    const ev = await m.from('eventos_jogo').insert({ jogo_id: c.jogoA, tipo: 'gol', minuto: 12, time_id: c.casa });
    expect(ev.error).toBeNull();
    const s = await m.from('sumulas').insert({ jogo_id: c.jogoA, hash_conteudo: 'abc', criada_por: c.moderador.id });
    expect(s.error).toBeNull();
    const fora = await m.from('eventos_jogo').insert({ jogo_id: c.jogoB, tipo: 'gol', minuto: 3, time_id: c.casa });
    expect(fora.error).not.toBeNull();
  });

  it('capitão convidado cria a equipe e cadastra jogadores', async () => {
    const cap = await clienteComo(c.capitao);
    const { data: timeId, error } = await cap.rpc('criar_minha_equipe', { campeonato: c.campA, nome: 'Leões', sigla: 'LEO' });
    expect(error).toBeNull();
    const j = await cap.from('jogadores').insert({ nome: 'Fulano', time_id: timeId });
    expect(j.error).toBeNull();
  });

  it('capitão não cria 2ª equipe no mesmo campeonato', async () => {
    const cap = await clienteComo(c.capitao);
    await cap.rpc('criar_minha_equipe', { campeonato: c.campA, nome: 'Leões', sigla: 'LEO' });
    const { error } = await cap.rpc('criar_minha_equipe', { campeonato: c.campA, nome: 'Tigres', sigla: 'TIG' });
    expect(error?.message).toBe('Você já cadastrou sua equipe neste campeonato.');
  });

  it('capitão sem convite não cria equipe', async () => {
    const cap = await clienteComo(c.capitao);
    const { error } = await cap.rpc('criar_minha_equipe', { campeonato: c.campB, nome: 'Leões', sigla: 'LEO' });
    expect(error?.message).toBe('Você não foi convidado como capitão neste campeonato.');
  });

  it('capitão não edita jogador de outro time', async () => {
    const { data: outro } = await admin().from('jogadores').insert({ nome: 'Alheio', time_id: c.fora }).select().single();
    const cap = await clienteComo(c.capitao);
    await cap.rpc('criar_minha_equipe', { campeonato: c.campA, nome: 'Leões', sigla: 'LEO' });
    await cap.from('jogadores').update({ nome: 'Hackeado' }).eq('id', outro!.id);
    const { data } = await admin().from('jogadores').select('nome').eq('id', outro!.id).single();
    expect(data?.nome).toBe('Alheio');
  });

  it('capitão não altera jogo nem evento', async () => {
    const cap = await clienteComo(c.capitao);
    await cap.from('jogos').update({ placar_casa: 7 }).eq('id', c.jogoA);
    expect((await jogo(c.jogoA)).placar_casa).toBe(0);
    const ev = await cap.from('eventos_jogo').insert({ jogo_id: c.jogoA, tipo: 'gol', minuto: 1, time_id: c.casa });
    expect(ev.error).not.toBeNull();
  });

  it('visitante (anon) lê jogos e campeonatos mas não escreve', async () => {
    const v = visitante();
    expect((await v.from('jogos').select('id').eq('id', c.jogoA)).data?.length).toBe(1);
    expect((await v.from('campeonatos').select('id').eq('id', c.campA)).data?.length).toBe(1);
    const ins = await v.from('campeonatos').insert({ nome: 'Pirata', ano: 2026 });
    expect(ins.error).not.toBeNull();
  });

  it('usuário comum não lê financeiro', async () => {
    await admin().from('financeiro_movimentacoes').insert({ tipo: 'receita', categoria: 'x', descricao: 'y', valor: 10 });
    const u = await clienteComo(await criarUsuario('autenticado'));
    const { data } = await u.from('financeiro_movimentacoes').select('id');
    expect(data ?? []).toEqual([]);
  });

  it('política antiga apagada ao reaplicar a 0010', async () => {
    const env = carregarEnvTeste();
    const cli = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
    await cli.connect();
    try {
      await cli.query('create policy "teste_aberta" on public.financeiro_movimentacoes for select using (true);');
      await cli.query(readFileSync('supabase/migrations/0010_politicas_por_cargo.sql', 'utf8'));
      const { rows } = await cli.query("select 1 from pg_policies where schemaname='public' and policyname='teste_aberta'");
      expect(rows).toHaveLength(0);
      // A 0010 apaga TODAS as políticas: reaplica as migrações seguintes, como numa sequência real.
      const seguintes = readdirSync('supabase/migrations')
        .filter((f) => f.endsWith('.sql') && f > '0010_politicas_por_cargo.sql')
        .sort();
      for (const f of seguintes) await cli.query(readFileSync(`supabase/migrations/${f}`, 'utf8'));
    } finally {
      await cli.end();
    }
  });
});
