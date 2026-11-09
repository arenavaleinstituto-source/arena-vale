// Cliente browser (componentes client-side)
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  CLIENTE SUPABASE RESILIENTE
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  ANTES: `createClient()` era chamado no corpo do componente, ou seja,
 *  TAMBÉM durante o prerender do Next.js. Sem as variáveis de ambiente o
 *  build inteiro quebrava com:
 *      "Error: @supabase/ssr: Your project's URL and API key are required"
 *  e o build falhava em 5 rotas (/noticias, /campeonatos, /painel/*).
 *
 *  AGORA: sem credenciais, devolvemos um cliente INERTE. As consultas
 *  retornam `{ data: null, error }` — e todas as telas do site já sabem
 *  cair no conteúdo de fallback quando não há dados. O build passa em
 *  qualquer ambiente (CI, preview, produção).
 */

/** Erro padrão devolvido pelo cliente inerte. */
export const ERRO_SEM_CONFIGURACAO = {
  message:
    'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  code: 'MISSING_ENV',
  details: null,
  hint: null,
};

/** `true` quando as credenciais públicas do Supabase estão presentes. */
export function temConfiguracaoSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

type ResultadoInerte = { data: null; error: typeof ERRO_SEM_CONFIGURACAO };

/**
 * Construtor de query inerte: toda chamada devolve ele mesmo e, ao ser
 * aguardado (`await`), resolve com `{ data: null, error }`.
 */
function criarQueryInerte(): any {
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
    then: (resolver: any) => Promise.resolve<ResultadoInerte>({ data: null, error: ERRO_SEM_CONFIGURACAO }).then(resolver),
    catch: () => undefined,
    finally: (fn: any) => fn(),
  };
  return query;
}

/** Cliente inerte que imita a superfície do Supabase usada pelo site. */
function criarClienteInerte(): SupabaseClient {
  return {
    from: () => criarQueryInerte(),
    rpc: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
        remove: () => Promise.resolve({ data: null, error: ERRO_SEM_CONFIGURACAO }),
        getPublicUrl: (caminho: string) => ({ data: { publicUrl: caminho } }),
      }),
    },
    channel: () => ({
      subscribe: () => undefined,
      unsubscribe: () => undefined,
      on: () => undefined,
    }),
  } as unknown as SupabaseClient;
}

/**
 * Cria o cliente Supabase para uso no navegador.
 *
 * Nunca lança: se as variáveis públicas não estiverem definidas, devolve
 * um cliente inerte em vez de derrubar o build ou a página.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return criarClienteInerte();
  }

  return createBrowserClient(url, anonKey);
}
