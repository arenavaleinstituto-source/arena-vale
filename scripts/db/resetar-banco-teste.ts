import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { carregarEnvTeste } from './teste-env';

const DIR_MIGRACOES = path.join(process.cwd(), 'supabase', 'migrations');

/** Grants que o Supabase dá ao schema public num projeto novo. */
const GRANTS_PADRAO = `
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all routines in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
`;

export function listarMigracoes(): string[] {
  return readdirSync(DIR_MIGRACOES).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
}

/**
 * Recria o schema public do banco de TESTES do zero e aplica todas as migrações,
 * uma por consulta. Usuários de auth antigos de teste são apagados à parte
 * (`apagarUsuariosDeTeste`), porque `auth` não é tocado aqui.
 */
export async function resetarBancoTeste(): Promise<void> {
  const env = carregarEnvTeste();
  const cliente = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
  await cliente.connect();
  try {
    await cliente.query('drop schema if exists public cascade; create schema public;');
    await cliente.query(GRANTS_PADRAO);
    for (const arquivo of listarMigracoes()) {
      const sql = readFileSync(path.join(DIR_MIGRACOES, arquivo), 'utf8');
      try {
        await cliente.query(sql);
      } catch (e) {
        throw new Error(`Migração ${arquivo} falhou no banco de testes: ${(e as Error).message}`);
      }
    }
    // Sem reaplicar os grants aqui: como no banco oficial, as permissões são as
    // padrão (dadas antes) MENOS o que as migrações retiram (ex.: CPF na 0012,
    // execução de funções restritas na 0009–0011). Reaplicar desfazia essas restrições.
    await cliente.query("notify pgrst, 'reload schema';");
  } finally {
    await cliente.end();
  }
}

if (process.argv[1]?.endsWith('resetar-banco-teste.ts')) {
  resetarBancoTeste()
    .then(() => console.log('Banco de testes recriado com', listarMigracoes().length, 'migrações.'))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
