import { describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, visitante } from './fixtures';

describe('cabeçalho dos vídeos (0017)', () => {
  it('notícia guarda os times do jogo (até 60 letras)', async () => {
    const { data } = await admin().from('noticias').insert({ titulo: 'Gol', confronto: 'FLAMENGO x PALMEIRAS' }).select('confronto').single();
    expect(data?.confronto).toBe('FLAMENGO x PALMEIRAS');
    const ruim = await admin().from('noticias').insert({ titulo: 'Gol', confronto: 'X'.repeat(61) });
    expect(ruim.error?.code).toBe('23514');
  });
});

describe('Story no Instagram (0016)', () => {
  it('a chave do Instagram só é lida pelo servidor (nem coordenador, nem visitante)', async () => {
    await admin().from('instagram_conta').upsert({ id: 'main', ig_user_id: '178', token: 'segredo' });
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const r1 = await coord.from('instagram_conta').select('token');
    expect(r1.data ?? []).toEqual([]);
    const r2 = await visitante().from('instagram_conta').select('token');
    expect(r2.data ?? []).toEqual([]);
    const w = await coord.from('instagram_conta').upsert({ id: 'main', ig_user_id: '1', token: 'troca' });
    expect(w.error).not.toBeNull();
    await admin().from('instagram_conta').delete().eq('id', 'main');
  });

  it('notícia guarda a situação do Story', async () => {
    const { data, error } = await admin()
      .from('noticias')
      .insert({ titulo: 'Story', story_status: 'processando', story_container_id: 'c-1' })
      .select('story_status, story_container_id, story_erro, story_em')
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({ story_status: 'processando', story_container_id: 'c-1', story_erro: null, story_em: null });
    const ruim = await admin().from('noticias').insert({ titulo: 'X', story_status: 'qualquer' });
    expect(ruim.error?.code).toBe('23514');
  });
});
