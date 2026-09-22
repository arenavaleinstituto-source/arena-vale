// Dashboard do coordenador (Server Component) — protegido por middleware
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats, getInscricoes, getPatrocinadores } from '@/lib/supabase/queries';
import { Nav } from '@/components/nav';
import { CoordShell } from '@/components/coord-shell';

export default async function CoordenadorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/coordenador');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role !== 'coordenador') redirect('/login?error=not_coord');

  const [stats, inscricoes, patrocinadores] = await Promise.all([
    getDashboardStats().catch(() => ({ inscricoes_pendentes: 0, total_times: 0, total_jogos: 0, receita_mensal: 0 })),
    getInscricoes('pendente').catch(() => []),
    getPatrocinadores().catch(() => []),
  ]);

  return (
    <>
      <Nav />
      <main className="pt-[78px] container py-10">
        <CoordShell
          user={profile}
          stats={stats}
          inscricoes={inscricoes}
          patrocinadores={patrocinadores}
        />
      </main>
    </>
  );
}
