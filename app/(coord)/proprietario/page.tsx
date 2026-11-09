import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { GestaoCoordenadores, type Coordenador } from '@/components/proprietario/GestaoCoordenadores';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Arena Vale', robots: { index: false, follow: false } };

/**
 * Área escondida do proprietário (aberta pelo toque triplo no logo).
 * Defesa em camadas: proxy + esta checagem no servidor + RLS.
 */
export default async function ProprietarioPage() {
  const supabase = await createClient();
  const { ehDono, userId } = await lerCargo(supabase);
  if (!ehDono || !userId) notFound();

  const [{ data: perfis }, { data: marca }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').eq('role', 'coordenador').order('created_at'),
    supabase.from('proprietario').select('limite_coordenadores').eq('profile_id', userId).maybeSingle(),
  ]);

  const coordenadores: Coordenador[] = (perfis ?? []).map((p) => ({
    id: p.id as string,
    nome: (p.full_name as string | null) ?? '',
    email: (p.email as string | null) ?? '',
  }));
  const limite = (marca as { limite_coordenadores?: number } | null)?.limite_coordenadores ?? 3;

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b73]">Acesso restrito</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">Gestão da equipe</h1>
        </div>
        <Link href="/coordenador" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white hover:border-[#e50914]">
          Painel da coordenação →
        </Link>
      </div>
      <GestaoCoordenadores coordenadores={coordenadores} limite={limite} donoId={userId} />
    </main>
  );
}
