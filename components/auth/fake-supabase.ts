import { vi } from 'vitest';

/** Cliente Supabase falso para testes de componentes de login. */
export function fakeSupabase(opts: { role?: string | null; nome?: string; userId?: string | null; dono?: boolean } = {}) {
  const userId = opts.userId === undefined ? null : opts.userId;
  const perfil = opts.role === undefined ? null : { role: opts.role, full_name: opts.nome ?? 'Fulano de Tal' };
  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
    setSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };
  const consulta = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: perfil, error: null }),
  };
  return {
    auth,
    from: vi.fn(() => consulta),
    rpc: vi.fn().mockResolvedValue({ data: opts.dono === true, error: null }),
    perfil: consulta,
  };
}
