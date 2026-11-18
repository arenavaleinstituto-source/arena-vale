import { describe, expect, it, vi } from 'vitest';

let usuario: { id: string } | null = { id: 'u1' };
let staff = true;
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    rpc: async () => ({ data: staff, error: null }),
  }),
}));
vi.mock('@/lib/midia/config', () => ({ lerConfigSite: async () => ({ youtubeChannelId: 'UCx' }) }));
const buscarCortesYT = vi.fn(async () => [{ id: 'a', titulo: 'A' }]);
vi.mock('@/lib/midia/youtube', () => ({ buscarCortesYT: (...a: unknown[]) => buscarCortesYT(...(a as [])) }));

import { GET } from './route';

describe('GET /api/cortes', () => {
  it('coordenação recebe os cortes do canal (mais que os 12 da home)', async () => {
    usuario = { id: 'u1' };
    staff = true;
    const r = await GET();
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ cortes: [{ id: 'a', titulo: 'A' }] });
    expect(buscarCortesYT).toHaveBeenCalledWith('UCx', 30);
  });

  it('sem login: 401; sem ser da coordenação: 403', async () => {
    usuario = null;
    expect((await GET()).status).toBe(401);
    usuario = { id: 'u1' };
    staff = false;
    expect((await GET()).status).toBe(403);
  });
});
