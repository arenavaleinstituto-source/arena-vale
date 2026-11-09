import type { SupabaseClient } from '@supabase/supabase-js';
import { cargoDoBanco, type Cargo } from './rotas';

export type QuemEsta = { cargo: Cargo; ehDono: boolean; userId: string | null };

/**
 * Lê o cargo de quem está logado, sempre pelo banco (nunca por cookie ou
 * localStorage). `ehDono` vem de `is_proprietario()`, que só é true para o dono.
 */
export async function lerCargo(supabase: SupabaseClient): Promise<QuemEsta> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { cargo: 'visitante', ehDono: false, userId: null };

  const [{ data: perfil }, { data: dono }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_proprietario'),
  ]);
  return {
    cargo: cargoDoBanco((perfil as { role?: string } | null)?.role ?? 'autenticado'),
    ehDono: dono === true,
    userId: user.id,
  };
}
