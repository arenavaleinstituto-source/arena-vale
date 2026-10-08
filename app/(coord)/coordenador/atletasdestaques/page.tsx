import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GestaoAtletasClient from './gestao-atletas-client';

export const dynamic = 'force-dynamic';

export default async function AtletasDestaquesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Se não estiver logado, redireciona para a página de login
  if (!user) {
    redirect('/login?next=/coordenador/atletasdestaques');
  }

  // Verifica se o usuário tem o cargo de coordenador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'coordenador') {
    redirect('/login?error=not_coord');
  }

  return <GestaoAtletasClient />;
}
