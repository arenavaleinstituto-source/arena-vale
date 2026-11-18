import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { MeusCampeonatos, type CampeonatoDaLista } from '@/components/campeonatos/painel/MeusCampeonatos';
import { GerenciarCampeonato } from '@/components/campeonatos/painel/GerenciarCampeonato';

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

  return (
    <>
      <CabecalhoEquipe titulo="Meus campeonatos" subtitulo="Moderação de campeonatos" />
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8">
        {escolhido ? (
          <>
            <Link href="/moderador" className="btn-leve w-fit">
              ← Meus campeonatos
            </Link>
            <GerenciarCampeonato id={escolhido.id} ehCoordenacao={cargo === 'coordenador'} />
          </>
        ) : (
          <MeusCampeonatos campeonatos={lista} ehCoordenacao={cargo === 'coordenador'} />
        )}
      </main>
    </>
  );
}
