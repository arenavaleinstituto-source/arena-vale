import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const removidos = vi.fn().mockResolvedValue(2);
vi.mock('@/lib/telegram/limpeza', () => ({ apagarVideosVencidos: () => removidos() }));
vi.mock('@/lib/supabase/server', () => ({ createAdminClient: () => ({}) }));
vi.mock('@/lib/instagram/portas', () => ({ renovarChaveInstagram: async () => 'em_dia' }));

import { GET } from './route';

const pedido = (auth?: string) => new Request('https://site.test/api/cron/videos', { headers: auth ? { authorization: auth } : {} }) as never;

describe('GET /api/cron/videos', () => {
  beforeEach(() => vi.stubEnv('CRON_SECRET', 'cron-certo'));
  afterEach(() => vi.unstubAllEnvs());

  it('sem o Bearer certo: 401', async () => {
    expect((await GET(pedido())).status).toBe(401);
    expect((await GET(pedido('Bearer errado'))).status).toBe(401);
    expect(removidos).not.toHaveBeenCalled();
  });

  it('sem CRON_SECRET configurado: 401', async () => {
    vi.stubEnv('CRON_SECRET', '');
    expect((await GET(pedido('Bearer '))).status).toBe(401);
  });

  it('com o Bearer certo: apaga, conta e confere a chave do Instagram', async () => {
    const r = await GET(pedido('Bearer cron-certo'));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ removidos: 2, instagram: 'em_dia' });
  });
});
