import { beforeEach, describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';

const id = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`.slice(0, 11);

describe('cortes_posicao (0024)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
  });

  it('a coordenação marca o corte como deitado e o visitante lê', async () => {
    const v = id();
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const r = await coord.from('cortes_posicao').upsert({ video_id: v, giro: -90 });
    expect(r.error).toBeNull();
    const { data } = await visitante().from('cortes_posicao').select('video_id, giro').eq('video_id', v);
    expect(data).toEqual([{ video_id: v, giro: -90 }]);
    expect((await coord.from('cortes_posicao').delete().eq('video_id', v)).error).toBeNull();
  });

  it('moderador, capitão e visitante não marcam', async () => {
    for (const quem of [await clienteComo(await criarUsuario('moderador')), await clienteComo(await criarUsuario('capitao')), visitante()]) {
      const r = await quem.from('cortes_posicao').insert({ video_id: id(), giro: -90 });
      expect(r.error).not.toBeNull();
    }
  });

  it('giro só aceita -90 ou 90', async () => {
    const r = await admin().from('cortes_posicao').insert({ video_id: id(), giro: 45 });
    expect(r.error).not.toBeNull();
  });
});
