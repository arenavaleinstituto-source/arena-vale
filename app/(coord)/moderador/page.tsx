import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/nav';

export default async function ModeradorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/moderador');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: teamLink } = await supabase
    .from('time_moderadores')
    .select(`
      *,
      time:times(id, nome),
      campeonato:campeonatos(id, nome, ano)
    `)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!teamLink) {
    return (
      <>
        <Nav />

        <main className="pt-[78px] container py-10">
          <div className="panel text-center py-12">
            <h1 className="font-serif text-2xl font-bold">
              Nenhuma liberação encontrada
            </h1>

            <p className="text-[var(--text-dim)] mt-3">
              O coordenador ainda não liberou um time e campeonato para você.
            </p>
          </div>
        </main>
      </>
    );
  }

  const { data: jogos } = await supabase
    .from('jogos')
    .select(`
      id,
      data,
      local,
      placar_casa,
      placar_visitante,
      status,
      casa:times!time_casa_id(nome),
      visitante:times!time_visitante_id(nome)
    `)
    .eq('campeonato_id', teamLink.campeonato_id)
    .or(
      `time_casa_id.eq.${teamLink.time_id},time_visitante_id.eq.${teamLink.time_id}`
    )
    .order('data', { ascending: true });

  return (
    <>
      <Nav />

      <main className="pt-[78px] container py-10">
        <div className="panel mb-6">
          <span className="eyebrow">🛡️ Painel do Moderador</span>

          <h1 className="font-serif text-2xl font-extrabold mt-2">
            {teamLink.time?.nome || 'Time não informado'}
          </h1>

          <p className="text-[var(--text-dim)] text-sm mt-2">
            Bem-vindo, {profile?.full_name}.
          </p>

          <div className="mt-4 text-sm">
            <strong>Campeonato liberado:</strong>{' '}
            {teamLink.campeonato?.nome || 'Não informado'}{' '}
            {teamLink.campeonato?.ano || ''}
          </div>
        </div>

        <div className="panel">
          <h2 className="font-serif text-xl font-bold mb-5">
            Jogos autorizados
          </h2>

          {!jogos || jogos.length === 0 ? (
            <p className="text-[var(--text-mute)]">
              Nenhum jogo encontrado para este time e campeonato.
            </p>
          ) : (
            <div className="grid gap-4">
              {jogos.map((jogo: any) => (
                <div
                  key={jogo.id}
                  className="border-b border-white/10 pb-4"
                >
                  <strong>
                    {jogo.casa?.nome || 'Casa'} x{' '}
                    {jogo.visitante?.nome || 'Visitante'}
                  </strong>

                  <p className="text-sm text-[var(--text-dim)] mt-2">
                    Placar: {jogo.placar_casa} x {jogo.placar_visitante}
                  </p>

                  <p className="text-xs text-[var(--text-mute)] mt-1">
                    {new Date(jogo.data).toLocaleString('pt-BR')} ·{' '}
                    {jogo.local || 'Local não informado'} · {jogo.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
