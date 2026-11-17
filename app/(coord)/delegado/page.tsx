import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { CabecalhoEquipe } from '@/components/painel/CabecalhoEquipe';
import { MesaDoJogo, type JogoDelegado } from '@/components/delegado/MesaDoJogo';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mesa do Jogo | ARENA VALE', robots: { index: false, follow: false } };

export default async function DelegadoPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/delegado');
  if (cargo !== 'delegado' && cargo !== 'coordenador') redirect('/acesso-negado');

  let q = supabase
    .from('jogos')
    .select('id, data, local, status, placar_casa, placar_visitante, nome_casa_custom, nome_visitante_custom, casa:times!jogos_time_casa_id_fkey(id, nome), fora:times!jogos_time_visitante_id_fkey(id, nome)')
    .order('data', { ascending: true });
  if (cargo === 'delegado') q = (q as typeof q).eq('delegado_id', userId).not('status', 'in', '("finalizado","cancelado","adiado")');
  const { data: jogos } = await q;

  return (
    <>
      <CabecalhoEquipe titulo="Mesa do Jogo" subtitulo="Placar ao vivo" />
      <main className="mx-auto w-full max-w-lg px-4 py-6">
        <MesaDoJogo jogos={(jogos ?? []) as unknown as JogoDelegado[]} ehCoordenador={cargo === 'coordenador'} />
      </main>
    </>
  );
}
