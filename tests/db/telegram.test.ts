import { beforeEach, describe, expect, it } from 'vitest';
import { portasBot } from '../../lib/telegram/portas';
import { apagarVideosVencidos } from '../../lib/telegram/limpeza';
import { admin, clienteComo, criarUsuario, limparCoordenadores } from './fixtures';

describe('bot do Telegram com o banco (portasBot)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
  });

  it('/vincular: código gerado no painel liga o Telegram ao perfil, uma vez só', async () => {
    const u = await criarUsuario('coordenador');
    const { data: codigo } = await (await clienteComo(u)).rpc('gerar_codigo_telegram');
    const p = portasBot(admin());
    const tg = 900000 + Math.floor(Math.random() * 99999);
    expect(await p.vincularCodigo(codigo as string, tg)).toBe('ok');
    expect(await p.perfilPorTelegram(tg)).toEqual({ id: u.id, role: 'coordenador' });
    expect(await p.vincularCodigo(codigo as string, tg)).toBe('invalido');
  });

  it('código vencido não vincula', async () => {
    const u = await criarUsuario('coordenador');
    await admin().from('telegram_codigos_vinculo').insert({ codigo: 'VENCIDO7', profile_id: u.id, expira_em: new Date(Date.now() - 60000).toISOString() });
    expect(await portasBot(admin()).vincularCodigo('VENCIDO7', 123)).toBe('invalido');
  });

  it('5 tentativas erradas bloqueiam por 1 hora, mesmo com o código certo depois', async () => {
    const u = await criarUsuario('coordenador');
    const { data: codigo } = await (await clienteComo(u)).rpc('gerar_codigo_telegram');
    const p = portasBot(admin());
    const tg = 800000 + Math.floor(Math.random() * 99999);
    for (let i = 0; i < 5; i += 1) expect(await p.vincularCodigo('ERRADO99', tg)).toBe('invalido');
    expect(await p.vincularCodigo(codigo as string, tg)).toBe('bloqueado');
    expect(await p.perfilPorTelegram(tg)).toBeNull();
  });

  it('rascunho: nasce na aba mundo; repetido devolve "duplicado"', async () => {
    const u = await criarUsuario('coordenador');
    const p = portasBot(admin());
    const dados = {
      titulo: 'Do bot',
      descricao: '',
      status: 'rascunho' as const,
      origem: 'telegram' as const,
      aba: 'mundo' as const,
      tipo_midia: 'foto' as const,
      imagem_url: null,
      video_url: null,
      video_expira_em: null,
      video_link: null,
      video_servico: null,
      fonte: 'Canal',
      telegram_message_ref: `db-${Date.now()}`,
      created_by: u.id,
    };
    const r = await p.inserirRascunho(dados);
    expect(r).toEqual({ id: expect.any(String) });
    expect(await p.inserirRascunho(dados)).toBe('duplicado');
    const { data } = await admin().from('noticias').select('aba, status, ativo').eq('id', (r as { id: string }).id).single();
    expect(data).toEqual({ aba: 'mundo', status: 'rascunho', ativo: false });
  });

  it('álbum: completa o título do rascunho padrão, mas não mexe em rascunho já editado', async () => {
    const ref = `grupo:5:${Date.now()}`;
    const ref2 = `${ref}-editado`;
    await admin().from('noticias').insert([
      { titulo: 'Notícia do Telegram', origem: 'telegram', aba: 'mundo', telegram_message_ref: ref },
      { titulo: 'Já editado pela coordenação', origem: 'telegram', aba: 'mundo', telegram_message_ref: ref2 },
    ]);
    const p = portasBot(admin());
    await p.completarAlbum(ref, 'STJD pune Maripán', 'Um jogo de suspensão.');
    await p.completarAlbum(ref2, 'Não deve trocar', '');
    const { data } = await admin().from('noticias').select('telegram_message_ref, titulo, descricao').in('telegram_message_ref', [ref, ref2]);
    expect(data?.find((n) => n.telegram_message_ref === ref)).toMatchObject({ titulo: 'STJD pune Maripán', descricao: 'Um jogo de suspensão.' });
    expect(data?.find((n) => n.telegram_message_ref === ref2)?.titulo).toBe('Já editado pela coordenação');
  });

  it('modo de vídeo padrão sem dono cadastrado', async () => {
    expect(await portasBot(admin()).modoVideo()).toEqual({ modo: 'guardar_arquivo', dias: 30 });
  });

  it('rotina: vídeo vencido perde o arquivo e continua no catálogo', async () => {
    const { data: n } = await admin()
      .from('noticias')
      .insert({
        titulo: 'Vencido',
        status: 'publicado',
        tipo_midia: 'video',
        video_url: 'https://x.supabase.co/storage/v1/object/public/noticias/telegram/1-1.mp4',
        video_expira_em: new Date(Date.now() - 1000).toISOString(),
        video_link: 'https://youtu.be/dQw4w9WgXcQ',
      })
      .select('id')
      .single();
    expect(await apagarVideosVencidos(admin())).toBeGreaterThanOrEqual(1);
    const { data } = await admin().from('noticias').select('video_url, video_link, status').eq('id', n!.id).single();
    expect(data).toEqual({ video_url: null, video_link: 'https://youtu.be/dQw4w9WgXcQ', status: 'publicado' });
  });
});
