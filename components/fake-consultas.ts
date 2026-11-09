import { vi } from 'vitest';

/**
 * Supabase falso para listas: `from(tabela)` devolve uma cadeia "thenable"
 * (select/eq/order/in/...) que resolve com `tabelas[tabela]`. Updates,
 * inserts e deletes são registrados em `escritas`.
 */
export function fakeConsultas(tabelas: Record<string, unknown[]> = {}, rpcResposta: { data?: unknown; error?: { message: string } | null } = {}) {
  const escritas: { tabela: string; op: string; payload?: unknown; filtros: unknown[][] }[] = [];
  function cadeia(tabela: string, op = 'select', payload?: unknown) {
    const filtros: unknown[][] = [];
    const registro = op === 'select' ? null : { tabela, op, payload, filtros };
    if (registro) escritas.push(registro);
    const c: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'in', 'order', 'neq', 'is', 'limit']) {
      c[m] = (...args: unknown[]) => { filtros.push([m, ...args]); return c; };
    }
    c.maybeSingle = () => Promise.resolve({ data: (tabelas[tabela] ?? [])[0] ?? null, error: null });
    c.single = c.maybeSingle;
    c.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: op === 'select' ? tabelas[tabela] ?? [] : null, error: null }).then(ok);
    return c;
  }
  const sb = {
    from: vi.fn((t: string) => ({
      ...cadeia(t),
      update: (p: unknown) => cadeia(t, 'update', p),
      insert: (p: unknown) => cadeia(t, 'insert', p),
      delete: () => cadeia(t, 'delete'),
    })),
    rpc: vi.fn().mockResolvedValue({ data: rpcResposta.data ?? null, error: rpcResposta.error ?? null }),
    escritas,
  };
  return sb;
}
