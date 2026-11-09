// Cliente SSR (Server Components, Route Handlers, Server Actions)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  CLIENTES SUPABASE NO SERVIDOR
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  `createClient()` (com cookies) — para páginas e ações que dependem da
 *  sessão do usuário (painel, coordenador, capitão).
 *
 *  `createPublicClient()` — para conteúdo PÚBLICO (mural de comunicados,
 *  súmulas,…). Usa a chave anônima sem tocar em cookies, o que permite
 *  gerar a página estaticamente (ou no máximo a cada revalidate) em vez
 *  de forçar render dinâmico em cada request.
 *
 *  Nenhum dos dois lança exceção quando as variáveis de ambiente faltam:
 *  um build em CI sem credenciais não pode quebrar.
 */

export const ERRO_SEM_CONFIGURACAO = {
  message:
    'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  code: 'MISSING_ENV',
  details: null,
  hint: null,
};

export function temConfiguracaoSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Cliente inerte — mesma superfície do `lib/supabase/client.ts`. */
function criarClienteInerte(): SupabaseClient {
  const query: any = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    neq: () => query,
    gt: () => query,
    gte: () => query,
    lt: () => query,
    lte: () => query,
    like: () => query,
    ilike: () => query,
    in: () => query,
    is: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    single: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolver: any) =>
      Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }).then(resolver),
    catch: () => undefined,
    finally: (fn: any) => fn(),
  };

  return {
    from: () => query,
    rpc: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
        remove: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
        getPublicUrl: (caminho: string) => ({ data: { publicUrl: caminho } }),
      }),
    },
  } as unknown as SupabaseClient;
}

/** Cliente SSR com sessão (usa cookies). */
export async function createClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return criarClienteInerte();
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

/**
 * Cliente público, sem cookies e sem dependência de sessão.
 * Use para conteúdo público e páginas que devem poder ser cacheadas.
 */
export function createPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return criarClienteInerte();
  }

  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Cliente com service role (só server-side, ignora RLS — CUIDADO!)
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return criarClienteInerte();
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type { CookieOptions };
