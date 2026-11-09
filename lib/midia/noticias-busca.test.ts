import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createPublicClient: () => ({}) }));

import { buscarNoticiasPublicadas } from './noticias-busca';

type Resp = { data: unknown[] | null; error: { code: string; message: string } | null };

/** Cliente falso: grava os filtros e devolve respostas em sequência. */
function clienteFalso(respostas: Resp[]) {
  const chamadas: string[][] = [];
  const from = () => {
    const filtros: string[] = [];
    chamadas.push(filtros);
    const q: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'order', 'limit', 'neq']) {
      q[m] = (...a: unknown[]) => {
        filtros.push(`${m}:${a.slice(0, 2).join('=')}`);
        return q;
      };
    }
    q.then = (ok: (v: Resp) => unknown) => Promise.resolve(respostas.shift() ?? { data: [], error: null }).then(ok);
    return q;
  };
  return { cliente: { from } as never, chamadas };
}

describe('buscarNoticiasPublicadas', () => {
  it('banco novo: filtra publicadas da aba e mapeia', async () => {
    const { cliente, chamadas } = clienteFalso([{ data: [{ id: '1', titulo: 'A', status: 'publicado', aba: 'mundo', publicado_em: '2026-11-01T00:00:00Z' }], error: null }]);
    const r = await buscarNoticiasPublicadas({ aba: 'mundo', limite: 5 }, cliente);
    expect(r.map((n) => n.titulo)).toEqual(['A']);
    expect(chamadas[0]).toEqual(expect.arrayContaining(['eq:status=publicado', 'eq:aba=mundo']));
  });

  it('banco antigo (sem a coluna status): usa as ativas, só na aba ARENA VALE', async () => {
    const { cliente } = clienteFalso([
      { data: null, error: { code: '42703', message: 'column noticias.status does not exist' } },
      { data: [{ id: '1', titulo: 'Velha', ativo: true, categoria: 'Projeto Social', created_at: '2026-10-01T00:00:00Z' }], error: null },
    ]);
    expect((await buscarNoticiasPublicadas({ aba: 'arena', categoria: 'projeto_social' }, cliente)).map((n) => n.titulo)).toEqual(['Velha']);
  });

  it('banco antigo: aba mundo fica vazia', async () => {
    const { cliente } = clienteFalso([
      { data: null, error: { code: '42703', message: 'column noticias.aba does not exist' } },
      { data: [{ id: '1', titulo: 'Velha', ativo: true }], error: null },
    ]);
    expect(await buscarNoticiasPublicadas({ aba: 'mundo' }, cliente)).toEqual([]);
  });

  it('erro qualquer: lista vazia, nunca quebra a página', async () => {
    const { cliente } = clienteFalso([{ data: null, error: { code: '500', message: 'fora do ar' } }]);
    expect(await buscarNoticiasPublicadas({ aba: 'arena' }, cliente)).toEqual([]);
  });
});
