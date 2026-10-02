import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/nav';
import { CapitaoElenco } from '@/components/capitao-elenco';

export default async function CapitaoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/capitao');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: capitao } = await supabase
    .from('time_capitaes')
    .select(`
      id,
      time_id,
      time:times(id, nome, sigla, escudo_url)
    `)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!capitao) {
    return (
      <>
        <Nav />

        <main className="pt-[78px] container py-10">
          <div className="panel text-center py-12">
            <h1 className="font-serif text-2xl font-bold">
              Nenhuma equipe vinculada
            </h1>

            <p className="text-[var(--text-dim)] mt-3">
              O coordenador ainda não vinculou você como capitão de um time.
            </p>
          </div>
        </main>
      </>
    );
  }

  const time = capitao.time as any;

  const { data: jogadores } = await supabase
    .from('jogadores')
    .select('*')
    .eq('time_id', capitao.time_id)
    .order('numero_camisa', { ascending: true });

  const { data: jogos } = await supabase
    .from('jogos')
    .select(`
      id,
      campeonato_id,
      data,
      local,
      placar_casa,
      placar_visitante,
      status,
      casa:times!time_casa_id(nome),
      visitante:times!time_visitante_id(nome)
    `)
    .or(
      `time_casa_id.eq.${capitao.time_id},time_visitante_id.eq.${capitao.time_id}`
    )
    .order('data', { ascending: true });

  const campeonatoIds = [
    ...new Set((jogos || []).map((jogo: any) => jogo.campeonato_id)),
  ];

  let classificacao: any[] = [];

  if (campeonatoIds.length > 0) {
    const { data: classificacaoData } = await supabase
      .from('v_classificacao')
      .select('*')
      .eq('time_id', capitao.time_id)
      .in('campeonato_id', campeonatoIds);

    classificacao = classificacaoData || [];
  }

  return (
    <>
      <Nav />

      <main className="pt-[78px] container py-10">
        <div className="panel mb-6">
          <span className="eyebrow">👑 Área do Capitão</span>

          <h1 className="font-serif text-2xl font-extrabold mt-2">
            {time?.nome || 'Meu time'}
          </h1>

          <p className="text-[var(--text-dim)] text-sm mt-2">
            Bem-vindo, {profile?.full_name}.
          </p>
        </div>
<CapitaoElenco
  timeId={capitao.time_id}
  jogadoresIniciais={jogadores || []}
/>

<div className="mt-6">
  <section className="panel">
    <h2 className="font-serif text-xl font-bold mb-5">
      📊 Minha classificação
    </h2>

    {classificacao.length === 0 && (
      <p className="text-[var(--text-mute)]">
        Ainda não há classificação disponível.
      </p>
    )}

    {classificacao.map((item: any) => (
      <div
        key={`${item.campeonato_id}-${item.time_id}`}
        className="grid grid-cols-4 gap-3 text-center"
      >
        <div>
          <strong className="block text-2xl">
            {item.pontos || 0}
          </strong>
          <small className="text-[var(--text-mute)]">Pontos</small>
        </div>

        <div>
          <strong className="block text-2xl">
            {item.jogos || 0}
          </strong>
          <small className="text-[var(--text-mute)]">Jogos</small>
        </div>

        <div>
          <strong className="block text-2xl">
            {item.vitorias || 0}
          </strong>
          <small className="text-[var(--text-mute)]">Vitórias</small>
        </div>

        <div>
          <strong className="block text-2xl">
            {item.gols_pro || 0}
          </strong>
          <small className="text-[var(--text-mute)]">Gols</small>
        </div>
      </div>
    ))}
  </section>
</div>

        

          <section className="panel">
            <h2 className="font-serif text-xl font-bold mb-5">
              📊 Minha classificação
            </h2>

            {classificacao.length === 0 && (
              <p className="text-[var(--text-mute)]">
                Ainda não há classificação disponível.
              </p>
            )}

            {classificacao.map((item: any) => (
              <div
                key={`${item.campeonato_id}-${item.time_id}`}
                className="grid grid-cols-4 gap-3 text-center"
              >
                <div>
                  <strong className="block text-2xl">
                    {item.pontos || 0}
                  </strong>
                  <small className="text-[var(--text-mute)]">
                    Pontos
                  </small>
                </div>

                <div>
                  <strong className="block text-2xl">
                    {item.jogos || 0}
                  </strong>
                  <small className="text-[var(--text-mute)]">
                    Jogos
                  </small>
                </div>

                <div>
                  <strong className="block text-2xl">
                    {item.vitorias || 0}
                  </strong>
                  <small className="text-[var(--text-mute)]">
                    Vitórias
                  </small>
                </div>

                <div>
                  <strong className="block text-2xl">
                    {item.gols_pro || 0}
                  </strong>
                  <small className="text-[var(--text-mute)]">
                    Gols
                  </small>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="panel mt-6">
          <h2 className="font-serif text-xl font-bold mb-5">
            ⚽ Jogos do meu time
          </h2>

          {(!jogos || jogos.length === 0) && (
            <p className="text-[var(--text-mute)]">
              Nenhum jogo encontrado.
            </p>
          )}

          <div className="grid gap-4">
            {jogos?.map((jogo: any) => (
              <div
                key={jogo.id}
                className="border-b border-white/10 pb-4"
              >
                <div className="flex justify-between gap-4 flex-wrap">
                  <strong>
                    {jogo.casa?.nome || 'Casa'} x{' '}
                    {jogo.visitante?.nome || 'Visitante'}
                  </strong>

                  <span className="text-xs text-[var(--text-mute)]">
                    {jogo.status}
                  </span>
                </div>

                <p className="text-sm text-[var(--text-dim)] mt-2">
                  Placar: {jogo.placar_casa} x {jogo.placar_visitante}
                </p>

                <p className="text-xs text-[var(--text-mute)] mt-1">
                  {new Date(jogo.data).toLocaleString('pt-BR')} ·{' '}
                  {jogo.local || 'Local não informado'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
