import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { getDashboardStats, getInscricoes, getPatrocinadores } from '@/lib/supabase/queries';
import { CoordShell } from '@/components/coord-shell';
import type { Profile } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Coordenação | Arena Vale', robots: { index: false, follow: false } };

/** Painel real da coordenação (substitui o painel de demonstração com dados fixos). */
export default async function CoordenadorPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/coordenador');
  if (cargo !== 'coordenador') redirect('/acesso-negado');

  const [{ data: perfil }, stats, inscricoes, patrocinadores] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    getDashboardStats(),
    getInscricoes().catch(() => []),
    getPatrocinadores(false).catch(() => []),
  ]);

  const user = { ...(perfil as Profile), full_name: (perfil as Profile | null)?.full_name || 'Coordenação' };
  return <CoordShell user={user} stats={stats} inscricoes={inscricoes ?? []} patrocinadores={patrocinadores ?? []} />;
}
