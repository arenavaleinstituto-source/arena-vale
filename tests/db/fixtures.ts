import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { carregarEnvTeste } from '../../scripts/db/teste-env';

export type CargoTeste = 'autenticado' | 'coordenador' | 'moderador' | 'capitao';
export type UsuarioTeste = { id: string; email: string; senha: string };

const env = carregarEnvTeste();
const SEM_SESSAO = { auth: { persistSession: false, autoRefreshToken: false } };
let contador = 0;

/** Cliente com a chave secreta do banco de TESTES (ignora RLS). */
export function admin(): SupabaseClient {
  return createClient(env.url, env.serviceKey, SEM_SESSAO);
}

/** Cria um usuário de teste confirmado e grava o cargo pela service role. */
export async function criarUsuario(cargo: CargoTeste, opts: { dono?: boolean } = {}): Promise<UsuarioTeste> {
  contador += 1;
  const email = `teste+${cargo}-${Date.now()}-${contador}@arenavale.test`;
  const senha = `Senha-${Date.now()}-${contador}`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: senha, email_confirm: true });
  if (error || !data.user) throw new Error(`criarUsuario: ${error?.message}`);
  const id = data.user.id;
  if (cargo !== 'autenticado') {
    const { error: e2 } = await admin().from('profiles').update({ role: cargo }).eq('id', id);
    if (e2) throw new Error(`criarUsuario (cargo): ${e2.message}`);
  }
  if (opts.dono) {
    const { error: e3 } = await admin().from('proprietario').insert({ profile_id: id });
    if (e3) throw new Error(`criarUsuario (dono): ${e3.message}`);
  }
  return { id, email, senha };
}

/** Cliente com a chave publicável, logado como o usuário (sujeito a RLS). */
export async function clienteComo(u: UsuarioTeste): Promise<SupabaseClient> {
  const c = createClient(env.url, env.anonKey, SEM_SESSAO);
  const { error } = await c.auth.signInWithPassword({ email: u.email, password: u.senha });
  if (error) throw new Error(`clienteComo: ${error.message}`);
  return c;
}

/** Cliente de visitante (sem login). */
export function visitante(): SupabaseClient {
  return createClient(env.url, env.anonKey, SEM_SESSAO);
}

/** Remove todos os usuários de teste (@arenavale.test). */
export async function apagarUsuariosDeTeste(): Promise<void> {
  const a = admin();
  for (let pagina = 1; ; pagina += 1) {
    const { data, error } = await a.auth.admin.listUsers({ page: pagina, perPage: 200 });
    if (error) throw new Error(`apagarUsuariosDeTeste: ${error.message}`);
    const deTeste = data.users.filter((u) => u.email?.endsWith('@arenavale.test'));
    for (const u of deTeste) await a.auth.admin.deleteUser(u.id);
    if (data.users.length < 200) break;
  }
}
