import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import PainelLegado from './painel-legado';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

/** Defesa em camadas: além do proxy, a página confere no servidor se é o dono. */
export default async function ProprietarioPage() {
  const { ehDono } = await lerCargo(await createClient());
  if (!ehDono) notFound();
  return <PainelLegado />;
}
