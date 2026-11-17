import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { MeusCampeonatos, type CampeonatoDaLista } from '@/components/campeonatos/painel/MeusCampeonatos';
import { ResultadosCampeonato, type CampeonatoDoModerador, type JogoDoModerador, type LinhaClassificacao } from '@/components/moderador/ResultadosCampeonato';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meus campeonatos | ARENA VALE', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ campeonato?: string }> };

/** Painel do moderador: os campeonatos ligados a ele (a coordenação vê todos). */
export default async function ModeradorPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/moderador');
  if (cargo !== 'moderador' && cargo !== 'coordenador') redirect('/acesso-negado');

  let ids: string[] | null = null;
  if (cargo === 'moderador') {
    const { data } = await supabase.from('campeonato_moderadores').select('campeonato_id').eq('profile_id', userId);
    ids = (data ?? []).map((v) => v.campeonato_id as string);
  }
  let consulta = supabase.from('campeonatos').select('id, nome, ano, slug, visivel, modalidade').order('ano', { ascending: false }).order('nome');
  if (ids) consulta = consulta.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const { data: camps } = await consulta;
  const lista = (camps ?? []) as CampeonatoDaLista[];

  const aberto = (await searchParams).campeonato;
  const escolhido = aberto ? lista.find((c) => c.id === aberto) : undefined;

  let resultados: CampeonatoDoModerador | null = null;
  if (escolhido) {
    const [{ data: jogos }, { data: tabela }] = await Promise.all([
      supabase
        .from('jogos')
        .select('id, data, local, status, placar_casa, placar_visitante, placar_casa_1t, placar_visitante_1t, casa:times!jogos_time_casa_id_fkey(id, nome), fora:times!jogos_time_visitante_id_fkey(id, nome)')
        .eq('campeonato_id', escolhido.id)
        .order('ordem', { ascending: true, nullsFirst: false }),
      supabase.from('v_classificacao').select('*').eq('campeonato_id', escolhido.id).order('pontos', { ascending: false }),
    ]);
    resultados = { id: escolhido.id, nome: escolhido.nome, jogos: (jogos ?? []) as unknown as JogoDoModerador[], classificacao: (tabela ?? []) as LinhaClassificacao[] };
  }

  return (
    <>
      <CabecalhoEquipe titulo="Meus campeonatos" subtitulo="Moderação de campeonatos" />
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8">
        {escolhido && resultados ? (
          <>
            <Link href="/moderador" className="btn-leve w-fit">
              ← Meus campeonatos
            </Link>
            <ResultadosCampeonato campeonatos={[resultados]} />
          </>
        ) : (
          <MeusCampeonatos campeonatos={lista} ehCoordenacao={cargo === 'coordenador'} />
        )}
      </main>
    </>
  );
}
