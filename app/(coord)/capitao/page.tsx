import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { MinhaEquipe, type ConviteCapitao } from '@/components/capitao/MinhaEquipe';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Minha equipe | ARENA VALE', robots: { index: false, follow: false } };

/** Painel do capitão: cadastra a própria equipe e o elenco em cada campeonato convidado. */
export default async function CapitaoPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/capitao');
  if (cargo !== 'capitao' && cargo !== 'coordenador') redirect('/acesso-negado');

  const { data } = await supabase
    .from('time_capitaes')
    .select('campeonato_id, time_id, campeonatos(nome), times(id, nome)')
    .eq('profile_id', userId);

  const convites: ConviteCapitao[] = await Promise.all(
    ((data ?? []) as Record<string, unknown>[])
      .filter((v) => v.campeonato_id)
      .map(async (v) => {
        const time = (v.times as { id: string; nome: string } | null) ?? null;
        const { data: jogadores } = time
          ? await supabase.from('jogadores').select('*').eq('time_id', time.id).order('nome')
          : { data: [] };
        return {
          campeonatoId: v.campeonato_id as string,
          campeonatoNome: (v.campeonatos as { nome?: string } | null)?.nome ?? 'Campeonato',
          time,
          jogadores: jogadores ?? [],
        };
      }),
  );

  return (
    <>
      <CabecalhoEquipe titulo="Minha equipe" subtitulo="Área do capitão" />
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        <MinhaEquipe convites={convites} />
      </main>
    </>
  );
}
