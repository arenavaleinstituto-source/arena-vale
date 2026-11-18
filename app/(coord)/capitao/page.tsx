import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { MinhaEquipe, type ConviteCapitao, type TimeDoCapitao } from '@/components/capitao/MinhaEquipe';
import { COLUNAS_ELENCO, paraElenco } from '@/lib/atletas/elenco-campeonato';

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
    .select('campeonato_id, time_id, campeonatos(nome), times(id, nome, sigla, escudo_url, escudo_cor)')
    .eq('profile_id', userId);

  const convites: ConviteCapitao[] = await Promise.all(
    ((data ?? []) as Record<string, unknown>[])
      .filter((v) => v.campeonato_id)
      .map(async (v) => {
        const time = (v.times as TimeDoCapitao | null) ?? null;
        const campeonatoId = v.campeonato_id as string;
        const { data: inscricoes } = time
          ? await supabase.from('inscricoes').select('id, campeonato_id, campeonatos(nome)').eq('time_id', time.id)
          : { data: [] };
        const lista = (inscricoes ?? []) as unknown as { id: string; campeonato_id: string; campeonatos: { nome?: string } | null }[];
        const inscricao = lista.find((i) => i.campeonato_id === campeonatoId) ?? null;
        const { data: elenco } = inscricao
          ? await supabase.from('inscricao_atletas').select(COLUNAS_ELENCO).eq('inscricao_id', inscricao.id)
          : { data: [] };
        return {
          campeonatoId,
          campeonatoNome: (v.campeonatos as { nome?: string } | null)?.nome ?? 'Campeonato',
          time,
          inscricaoId: inscricao?.id ?? null,
          outrasInscricoes: lista.filter((i) => i.id !== inscricao?.id).map((i) => ({ id: i.id, campeonatoNome: i.campeonatos?.nome ?? 'Campeonato' })),
          elenco: paraElenco(elenco as unknown[] | null),
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
