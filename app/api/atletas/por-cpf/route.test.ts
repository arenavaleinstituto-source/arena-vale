import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

let usuario: { id: string } | null = { id: 'u1' };
let staff = true;
let jogador: Record<string, unknown> | null = { id: 'j1', nome: 'João Silva', foto_url: 'https://x/j.jpg', time: { nome: 'Brusque' } };
const filtros: unknown[][] = [];
function consulta(tabela: string) {
  const c: Record<string, unknown> = {};
  for (const m of ['select', 'in', 'eq', 'order', 'limit']) c[m] = (...a: unknown[]) => (filtros.push([tabela, m, ...a]), c);
  c.maybeSingle = async () => ({ data: tabela === 'jogadores' ? jogador : { campeonato: { nome: 'Catarinense Sub 20' } }, error: null });
  return c;
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    rpc: async () => ({ data: staff, error: null }),
  }),
  createAdminClient: () => ({ from: consulta }),
}));

import { GET } from './route';

const req = (cpf: string) => ({ nextUrl: new URL(`https://x/api/atletas/por-cpf?cpf=${encodeURIComponent(cpf)}`) }) as unknown as NextRequest;
const CPF = '529.982.247-25';

describe('GET /api/atletas/por-cpf', () => {
  it('coordenação recebe nome, foto, time e campeonato, sem o CPF', async () => {
    const r = await GET(req(CPF));
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo).toEqual({ atleta: { nome: 'João Silva', foto_url: 'https://x/j.jpg', time: 'Brusque', campeonato: 'Catarinense Sub 20' } });
    expect(JSON.stringify(corpo)).not.toContain('52998224725');
    expect(filtros).toContainEqual(['jogadores', 'in', 'cpf', ['52998224725', CPF]]);
  });

  it('CPF inválido: 400; não encontrado: 404', async () => {
    expect((await GET(req('123'))).status).toBe(400);
    jogador = null;
    expect((await GET(req(CPF))).status).toBe(404);
    jogador = { id: 'j1', nome: 'João', foto_url: null, time: null };
  });

  it('sem login: 401; sem ser da coordenação: 403', async () => {
    usuario = null;
    expect((await GET(req(CPF))).status).toBe(401);
    usuario = { id: 'u1' };
    staff = false;
    expect((await GET(req(CPF))).status).toBe(403);
    staff = true;
  });
});
