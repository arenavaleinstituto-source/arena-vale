import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { ResultadosCampeonato, type CampeonatoDoModerador, type JogoDoModerador, type LinhaClassificacao } from '@/components/moderador/ResultadosCampeonato';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Resultados | Arena Vale', robots: { index: false, follow: false } };

/** Painel do moderador: lança resultados só dos campeonatos ligados a ele (coordenação vê todos). */
export default async function ModeradorPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/moderador');
  if (cargo !== 'moderador' && cargo !== 'coordenador') redirect('/acesso-negado');

  let ids: string[] | null = null;
  if (cargo === 'moderador') {
    const { data } = await supabase.from('campeonato_moderadores').select('campeonato_id').eq('profile_id', userId);
    ids = (data ?? []).map((v) => v.campeonato_id as string);
  }

  let consultaCamps = supabase.from('campeonatos').select('id, nome').order('ano', { ascending: false });
  if (ids) consultaCamps = consultaCamps.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const { data: camps } = await consultaCamps;
  const lista = (camps ?? []) as { id: string; nome: string }[];

  const campeonatos: CampeonatoDoModerador[] = await Promise.all(
    lista.map(async (c) => {
      const [{ data: jogos }, { data: tabela }] = await Promise.all([
        supabase
          .from('jogos')
          .select('id, data, local, status, placar_casa, placar_visitante, placar_casa_1t, placar_visitante_1t, casa:times!jogos_time_casa_id_fkey(id, nome), fora:times!jogos_time_visitante_id_fkey(id, nome)')
          .eq('campeonato_id', c.id)
          .order('data'),
        supabase.from('v_classificacao').select('*').eq('campeonato_id', c.id).order('pontos', { ascending: false }),
      ]);
      return {
        id: c.id,
        nome: c.nome,
        jogos: (jogos ?? []) as unknown as JogoDoModerador[],
        classificacao: (tabela ?? []) as LinhaClassificacao[],
      };
    }),
  );

  return (
    <>
      <CabecalhoEquipe titulo="Resultados" subtitulo="Moderação de campeonatos" />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <ResultadosCampeonato campeonatos={campeonatos} />
      </main>
    </>
  );
}
