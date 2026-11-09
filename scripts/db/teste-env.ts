import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/** Ref do projeto Supabase de PRODUÇÃO — os testes nunca podem apontar para ele. */
export const REF_PRODUCAO = 'cpvmfpxxrdpvfbonwynr';

export type EnvTeste = { url: string; anonKey: string; serviceKey: string; databaseUrl: string };

const CAMPOS = ['TEST_SUPABASE_URL', 'TEST_SUPABASE_ANON_KEY', 'TEST_SUPABASE_SERVICE_ROLE_KEY', 'TEST_DATABASE_URL'] as const;

function lerArquivoEnv(arquivo: string): Record<string, string> {
  if (!existsSync(arquivo)) return {};
  const vars: Record<string, string> = {};
  for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) vars[m[1]] = m[2];
  }
  return vars;
}

/**
 * Lê as credenciais do banco de TESTES (`.env.test.local`, ou o objeto passado).
 * Lança erro se faltar algum campo ou se qualquer valor apontar para produção.
 */
export function carregarEnvTeste(fonte?: Record<string, string | undefined>): EnvTeste {
  const vars = fonte ?? lerArquivoEnv(path.join(process.cwd(), '.env.test.local'));
  for (const campo of CAMPOS) {
    const v = vars[campo];
    if (!v || v.startsWith('COLE_AQUI')) throw new Error(`Falta ${campo} no .env.test.local`);
  }
  if (CAMPOS.some((c) => vars[c]!.includes(REF_PRODUCAO))) {
    throw new Error('O .env.test.local aponta para o banco de produção — os testes foram bloqueados.');
  }
  return {
    url: vars.TEST_SUPABASE_URL!,
    anonKey: vars.TEST_SUPABASE_ANON_KEY!,
    serviceKey: vars.TEST_SUPABASE_SERVICE_ROLE_KEY!,
    databaseUrl: vars.TEST_DATABASE_URL!,
  };
}
