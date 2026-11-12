// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ALBUM = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
let usuario: { id: string } | null = { id: 'u1' };
let cargo = 'coordenador';
let capaAtual: string | null = null;
const uploads: string[] = [];
const inserts: Record<string, unknown>[] = [];
const updates: Record<string, unknown>[] = [];

function consulta(tabela: string) {
  const q: Record<string, unknown> = {};
  let dados: unknown = null;
  for (const m of ['select', 'eq']) q[m] = () => q;
  q.single = () => {
    if (tabela === 'profiles') dados = { role: cargo };
    if (tabela === 'galeria_fotos') dados = { id: 'f1', album_id: ALBUM, url: 'U', miniatura_url: 'M', largura: 2000, altura: 1500 };
    return Promise.resolve({ data: dados, error: null });
  };
  q.maybeSingle = () => Promise.resolve({ data: tabela === 'galeria_albuns' ? { id: ALBUM, capa_url: capaAtual } : null, error: null });
  q.insert = (v: Record<string, unknown>) => {
    inserts.push(v);
    return q;
  };
  q.update = (v: Record<string, unknown>) => {
    updates.push(v);
    return q;
  };
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(ok);
  return q;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    from: consulta,
  }),
  createAdminClient: () => ({
    from: consulta,
    storage: {
      from: () => ({
        upload: async (caminho: string) => {
          uploads.push(caminho);
          return { error: null };
        },
        getPublicUrl: (caminho: string) => ({ data: { publicUrl: `https://cdn.test/${caminho}` } }),
      }),
    },
  }),
}));
vi.mock('@/lib/imagem/galeria', () => ({
  prepararFotoGaleria: async () => ({ grande: new Uint8Array([1]), miniatura: new Uint8Array([2]), largura: 2000, altura: 1500 }),
}));

import { POST } from './route';

function pedido(campos: { album?: string; arquivo?: boolean }) {
  const fd = new FormData();
  if (campos.album) fd.set('album_id', campos.album);
  if (campos.arquivo) fd.set('arquivo', new File([new Uint8Array([255, 216, 255])], 'f.jpg', { type: 'image/jpeg' }));
  return new Request('https://site.test/api/galeria/foto', { method: 'POST', body: fd }) as never;
}

describe('POST /api/galeria/foto', () => {
  beforeEach(() => {
    usuario = { id: 'u1' };
    cargo = 'coordenador';
    capaAtual = null;
    uploads.length = 0;
    inserts.length = 0;
    updates.length = 0;
  });

  it('sem login: 401', async () => {
    usuario = null;
    expect((await POST(pedido({ album: ALBUM, arquivo: true }))).status).toBe(401);
  });

  it('capitão: 403', async () => {
    cargo = 'capitao';
    expect((await POST(pedido({ album: ALBUM, arquivo: true }))).status).toBe(403);
  });

  it('sem arquivo: 400', async () => {
    expect((await POST(pedido({ album: ALBUM }))).status).toBe(400);
  });

  it('coordenador com JPEG: guarda os dois tamanhos, registra quem enviou e define a capa', async () => {
    const r = await POST(pedido({ album: ALBUM, arquivo: true }));
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo.ok).toBe(true);
    expect(corpo.foto).toMatchObject({ id: 'f1', albumId: ALBUM });
    expect(uploads).toHaveLength(2);
    expect(uploads[0]).toMatch(new RegExp(`^${ALBUM}/[0-9a-f-]{36}\\.jpg$`));
    expect(uploads[1]).toMatch(new RegExp(`^${ALBUM}/[0-9a-f-]{36}-m\\.jpg$`));
    expect(inserts[0]).toMatchObject({ album_id: ALBUM, enviado_por: 'u1', largura: 2000, altura: 1500 });
    expect(updates[0]).toEqual({ capa_url: `https://cdn.test/${uploads[0]}` });
  });

  it('álbum que já tem capa não muda a capa', async () => {
    capaAtual = 'https://cdn.test/antiga.jpg';
    expect((await POST(pedido({ album: ALBUM, arquivo: true }))).status).toBe(200);
    expect(updates).toHaveLength(0);
  });
});
