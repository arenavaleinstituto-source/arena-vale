import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { carregarEnvTeste } from '../../scripts/db/teste-env';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';

const env = carregarEnvTeste();

/** Executa, por pg, a mesma linha de correção de dado que está na 0011. */
async function corrigirLocalAgenda(): Promise<void> {
  const sql = readFileSync('supabase/migrations/0011_midia_esportiva.sql', 'utf8');
  const linha = sql.split('\n').find((l) => l.startsWith('update public.agenda_jogos set local'));
  if (!linha) throw new Error('linha de correção da agenda não encontrada na 0011');
  const cli = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
  await cli.connect();
  try {
    await cli.query(linha);
  } finally {
    await cli.end();
  }
}

function videoExterno(ativo: boolean) {
  return {
    plataforma: 'instagram',
    link: 'https://www.instagram.com/reel/abc/',
    titulo: ativo ? 'Ativo' : 'Inativo',
    capa_url: 'https://exemplo.test/capa.jpg',
    ativo,
  };
}

describe('mídia esportiva (0011)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    await admin().from('videos_externos').delete().not('id', 'is', null);
  });

  it('visitante lê só videos_externos ativos', async () => {
    const { error } = await admin().from('videos_externos').insert([videoExterno(true), videoExterno(false)]);
    expect(error).toBeNull();
    const { data } = await visitante().from('videos_externos').select('titulo');
    expect(data?.map((v) => v.titulo)).toEqual(['Ativo']);
  });

  it('só a coordenação escreve em videos_externos', async () => {
    const mod = await clienteComo(await criarUsuario('moderador'));
    const r1 = await mod.from('videos_externos').insert(videoExterno(true));
    expect(r1.error).not.toBeNull();
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const r2 = await coord.from('videos_externos').insert(videoExterno(true));
    expect(r2.error).toBeNull();
  });

  it('campeonatos.modalidade aceita só os 4 valores', async () => {
    const ok = await admin().from('campeonatos').insert({ nome: 'Copa Futsal', ano: 2026, modalidade: 'futsal' });
    expect(ok.error).toBeNull();
    const ruim = await admin().from('campeonatos').insert({ nome: 'Copa Handebol', ano: 2026, modalidade: 'handebol' });
    expect(ruim.error?.code).toBe('23514');
  });

  it('notícia publicada fica ativa e ganha publicado_em', async () => {
    const { data: n, error } = await admin()
      .from('noticias')
      .insert({ titulo: 'Rascunho de teste' })
      .select('id, ativo, status, publicado_em')
      .single();
    expect(error).toBeNull();
    expect(n).toMatchObject({ ativo: false, status: 'rascunho', publicado_em: null });
    const { data: p } = await admin()
      .from('noticias')
      .update({ status: 'publicado' })
      .eq('id', n!.id)
      .select('ativo, publicado_em')
      .single();
    expect(p?.ativo).toBe(true);
    expect(p?.publicado_em).not.toBeNull();
  });

  it('visitante não lê rascunho', async () => {
    const { data: n } = await admin().from('noticias').insert({ titulo: 'Rascunho secreto' }).select('id').single();
    const { data } = await visitante().from('noticias').select('id').eq('id', n!.id);
    expect(data).toEqual([]);
  });

  it('notícia nasce na aba arena, categoria geral, origem manual', async () => {
    const { data } = await admin()
      .from('noticias')
      .insert({ titulo: 'Padrões' })
      .select('aba, categoria, origem, tipo_midia, destaque')
      .single();
    expect(data).toEqual({ aba: 'arena', categoria: 'geral', origem: 'manual', tipo_midia: 'foto', destaque: false });
  });

  it('rascunho vindo do Telegram nasce na aba mundo', async () => {
    const { data } = await admin()
      .from('noticias')
      .insert({ titulo: 'Do Telegram', origem: 'telegram', aba: 'mundo', telegram_message_ref: `t-${Date.now()}` })
      .select('aba, status')
      .single();
    expect(data).toEqual({ aba: 'mundo', status: 'rascunho' });
  });

  it('telegram_message_ref é único', async () => {
    const ref = `dup-${Date.now()}`;
    await admin().from('noticias').insert({ titulo: 'A', telegram_message_ref: ref });
    const { error } = await admin().from('noticias').insert({ titulo: 'B', telegram_message_ref: ref });
    expect(error?.code).toBe('23505');
  });

  it('gerar_codigo_telegram: coordenador recebe 8 letras/números, capitão não', async () => {
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const { data: codigo, error } = await coord.rpc('gerar_codigo_telegram');
    expect(error).toBeNull();
    expect(codigo).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    const cap = await clienteComo(await criarUsuario('capitao'));
    const r = await cap.rpc('gerar_codigo_telegram');
    expect(r.error?.message).toContain('Sem permissão.');
    const { data: lidos } = await visitante().from('telegram_codigos_vinculo').select('codigo');
    expect(lidos ?? []).toEqual([]);
  });

  it('modo_video_atual: coordenador lê o modo, capitão não', async () => {
    await criarUsuario('coordenador', { dono: true });
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const { data, error } = await coord.rpc('modo_video_atual');
    expect(error).toBeNull();
    expect(data).toEqual([{ modo: 'guardar_arquivo', dias: 30 }]);
    const cap = await clienteComo(await criarUsuario('capitao'));
    expect((await cap.rpc('modo_video_atual')).error).not.toBeNull();
  });

  it('site_config tem os padrões do YouTube', async () => {
    const { data } = await visitante().from('site_config').select('youtube_channel_id, youtube_handle').eq('id', 'main').single();
    expect(data).toEqual({ youtube_channel_id: 'UCBTQ97bWA6VqK2a6qv80dIg', youtube_handle: '@TVArenaVale' });
  });

  it('agenda: "Arena Vale Sports" vira "Arena Vale" sem apagar o resto do local', async () => {
    const { data: itens } = await admin()
      .from('agenda_jogos')
      .insert([
        { modalidade: 'Futsal', equipe_casa: 'A', equipe_fora: 'B', data_hora: '2026-12-01T19:00:00-03:00', local: 'Arena Vale Sports' },
        { modalidade: 'Futsal', equipe_casa: 'C', equipe_fora: 'D', data_hora: '2026-12-01T19:00:00-03:00', local: 'Ginásio ARENA VALE SPORT – Quadra 2' },
      ])
      .select('id, equipe_casa');
    await corrigirLocalAgenda();
    const { data } = await visitante().from('agenda_jogos').select('equipe_casa, local').in('id', itens!.map((i) => i.id)).order('equipe_casa');
    expect(data).toEqual([
      { equipe_casa: 'A', local: 'Arena Vale' },
      { equipe_casa: 'C', local: 'Ginásio Arena Vale – Quadra 2' },
    ]);
  });

  it('categorias antigas viram as novas sem perder Campeonatos e Projeto Social (qualquer caixa)', async () => {
    const sql = readFileSync('supabase/migrations/0011_midia_esportiva.sql', 'utf8');
    const ini = sql.indexOf('-- dados existentes: categorias antigas');
    const fim = sql.indexOf("alter table public.noticias alter column categoria set default 'geral';");
    const trecho = sql.slice(ini, fim);
    const cli = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
    await cli.connect();
    try {
      await cli.query('begin');
      await cli.query('alter table public.noticias drop constraint noticias_categoria_check');
      const { rows } = await cli.query(
        "insert into public.noticias (titulo, categoria) values ('a','Campeonatos'),('b','CAMPEONATOS'),('c','Projeto Social'),('d','Bastidores'),('e','Comunicado Oficial'),('f','TV Arena Vale') returning id",
      );
      await cli.query(trecho);
      const r = await cli.query('select titulo, categoria from public.noticias where id = any($1) order by titulo', [rows.map((x) => x.id)]);
      expect(r.rows.map((x) => x.categoria)).toEqual(['campeonatos', 'campeonatos', 'projeto_social', 'bastidores', 'geral', 'geral']);
    } finally {
      await cli.query('rollback');
      await cli.end();
    }
  });
});
