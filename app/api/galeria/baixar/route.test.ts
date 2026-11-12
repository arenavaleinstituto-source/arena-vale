import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ID = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
let foto: { id: string; url: string } | null = null;

vi.mock('@/lib/supabase/server', () => ({
  createPublicClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {};
      for (const m of ['select', 'eq']) q[m] = () => q;
      q.maybeSingle = () => Promise.resolve({ data: foto, error: null });
      return q;
    },
  }),
}));

import { GET } from './route';

const pedido = (id: string) => new Request(`https://site.test/api/galeria/baixar?id=${id}`) as never;

describe('GET /api/galeria/baixar', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://banco.test');
    foto = null;
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('foto inexistente ou de álbum escondido: 404', async () => {
    expect((await GET(pedido(ID))).status).toBe(404);
  });

  it('id inválido: 404', async () => {
    expect((await GET(pedido('nao-e-uuid'))).status).toBe(404);
  });

  it('foto pública: baixa como anexo', async () => {
    foto = { id: ID, url: 'https://banco.test/storage/v1/object/public/galeria/a/b.jpg' };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/jpeg' } })));
    const r = await GET(pedido(ID));
    expect(r.status).toBe(200);
    expect(r.headers.get('content-disposition')).toBe(`attachment; filename="arena-vale-${ID}.jpg"`);
    expect(r.headers.get('content-type')).toBe('image/jpeg');
  });

  it('url fora do nosso armazenamento: 404 (não vira proxy)', async () => {
    foto = { id: ID, url: 'https://outro.site/x.jpg' };
    expect((await GET(pedido(ID))).status).toBe(404);
  });
});
