import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { getDashboardStats, getInscricoes, getPatrocinadores } from '@/lib/supabase/queries';
import { CoordShell } from '@/components/coord-shell';
import { lerConfigSite } from '@/lib/midia/config';
import { buscarVideosYT, estaAoVivo } from '@/lib/midia/youtube';
import type { Profile } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Coordenação | ARENA VALE', robots: { index: false, follow: false } };

const STATS_VAZIO = { inscricoes_pendentes: 0, campeonatos: 0, equipes: 0, jogos: 0 };

/** Painel da coordenação (spec Fase 3, seção 12). */
export default async function CoordenadorPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/coordenador');
  if (cargo !== 'coordenador') redirect('/acesso-negado');

  const config = await lerConfigSite();
  const [{ data: perfil }, stats, inscricoes, patrocinadores, videos, aoVivoDetectado] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    getDashboardStats().catch(() => STATS_VAZIO),
    getInscricoes().catch(() => []),
    getPatrocinadores(false).catch(() => []),
    buscarVideosYT(config.youtubeChannelId),
    estaAoVivo(config.youtubeChannelId),
  ]);

  const user = { ...(perfil as Profile), full_name: (perfil as Profile | null)?.full_name || 'Coordenação' };
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Suspense>
        <CoordShell
          user={user}
          stats={{ ...stats, videos: videos.length }}
          inscricoes={inscricoes ?? []}
          patrocinadores={patrocinadores ?? []}
          aoVivoDetectado={aoVivoDetectado}
        />
      </Suspense>
    </main>
  );
}
