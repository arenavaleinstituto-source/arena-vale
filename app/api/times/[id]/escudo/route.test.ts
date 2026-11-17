// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const TIME = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
let usuario: { id: string } | null = { id: 'u1' };
let podeTrocar = true;
const uploads: string[] = [];
const updates: Record<string, unknown>[] = [];
const prepararEscudo = vi.fn(async () => new Uint8Array([9, 9]));

function consulta() {
  const q: Record<string, unknown> = {};
  q.update = (v: Record<string, unknown>) => {
    updates.push(v);
    return q;
  };
  q.eq = () => Promise.resolve({ error: null });
  return q;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    rpc: async () => ({ data: podeTrocar, error: null }),
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
vi.mock('@/lib/imagem/escudo', () => ({ prepararEscudo: (...a: unknown[]) => prepararEscudo(...(a as [])) }));

import { POST } from './route';

function pedido(o: { tamanho?: number; tipo?: string; cor?: string; semArquivo?: boolean } = {}) {
  const fd = new FormData();
  if (!o.semArquivo) fd.set('arquivo', new Blob([new Uint8Array(o.tamanho ?? 10)], { type: o.tipo ?? 'image/png' }), 'escudo.png');
  if (o.cor) fd.set('cor', o.cor);
  return POST(new Request(`http://x/api/times/${TIME}/escudo`, { method: 'POST', body: fd }), { params: Promise.resolve({ id: TIME }) });
}

describe('POST /api/times/[id]/escudo', () => {
  beforeEach(() => {
    usuario = { id: 'u1' };
    podeTrocar = true;
    uploads.length = 0;
    updates.length = 0;
    prepararEscudo.mockClear();
  });

  it('sem login → 401', async () => {
    usuario = null;
    expect((await pedido()).status).toBe(401);
  });

  it('quem não é capitão do time → 403', async () => {
    podeTrocar = false;
    const r = await pedido();
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ ok: false, erro: 'Só o capitão do time troca o escudo.' });
    expect(uploads).toEqual([]);
  });

  it('imagem acima de 5 MB → 400', async () => {
    const r = await pedido({ tamanho: 6 * 1024 * 1024 });
    expect(r.status).toBe(400);
    expect((await r.json()).erro).toBe('A imagem passa de 5 MB.');
  });

  it('arquivo que não é imagem → 400', async () => {
    const r = await pedido({ tipo: 'application/pdf' });
    expect((await r.json()).erro).toBe('O arquivo precisa ser uma imagem.');
  });

  it('caso válido: trata a imagem, grava e devolve a URL com a cor', async () => {
    const r = await pedido({ cor: '#AA0011' });
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(prepararEscudo).toHaveBeenCalled();
    expect(uploads[0]).toMatch(new RegExp(`^times/${TIME}-\\d+\\.png$`));
    expect(corpo).toEqual({ ok: true, url: `https://cdn.test/${uploads[0]}` });
    expect(updates[0]).toEqual({ escudo_url: corpo.url, escudo_cor: '#aa0011' });
  });

  it('cor em formato errado é ignorada', async () => {
    await pedido({ cor: 'vermelho' });
    expect(updates[0]).toEqual({ escudo_url: expect.any(String) });
  });
});
