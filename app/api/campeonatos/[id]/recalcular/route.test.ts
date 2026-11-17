// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ID = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
let usuario: { id: string } | null = { id: 'u1' };
const recalcular = vi.fn(async () => ({ avisos: ['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 7).'] }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: usuario } }) } }),
  createAdminClient: () => ({}),
}));
vi.mock('@/lib/campeonatos/servico', () => ({ recalcular: (...a: unknown[]) => recalcular(...(a as [])) }));
vi.mock('@/lib/campeonatos/portas', () => ({ portasCampeonato: () => ({}) }));

import { POST } from './route';

const chamar = (id = ID) => POST(new Request(`http://x/api/campeonatos/${id}/recalcular`, { method: 'POST' }), { params: Promise.resolve({ id }) });

describe('POST /api/campeonatos/[id]/recalcular', () => {
  beforeEach(() => {
    usuario = { id: 'u1' };
    recalcular.mockClear();
  });

  it('sem login → 401', async () => {
    usuario = null;
    const r = await chamar();
    expect(r.status).toBe(401);
    expect(recalcular).not.toHaveBeenCalled();
  });

  it('qualquer usuário logado (ex.: delegado recém-rebaixado) → 200 e recalcula', async () => {
    const r = await chamar();
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, avisos: ['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 7).'] });
    expect(recalcular).toHaveBeenCalledWith(ID, expect.anything());
  });

  it('id inválido → 400', async () => {
    const r = await chamar('nao-e-uuid');
    expect(r.status).toBe(400);
  });
});
