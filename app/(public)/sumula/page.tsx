// Índice das súmulas digitais disponíveis (Server Component)
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * ÍNDICE DE SÚMULAS — /sumula
 *
 * Antes, `/sumula` respondia HTTP 404 (só existia a rota dinâmica
 * `/sumula/[id]`). Esta página lista os confrontos com súmula disponível
 * para que o link funcione e para que o QR Code impresso na súmula tenha
 * um ponto de entrada reverso.
 */
export default async function SumulasIndexPage() {
  const supabase = await createClient();

  const { data: jogos } = await supabase
    .from('jogos')
    .select(
      `
        id, data, local, status, placar_casa, placar_visitante,
        time_casa:times!time_casa_id(nome, sigla, escudo_cor),
        time_visitante:times!time_visitante_id(nome, sigla, escudo_cor),
        campeonato:campeonatos(nome),
        sumulas(jogo_id, status, validada_em)
      `
    )
    .order('data', { ascending: false })
    .limit(50);

  const lista = (jogos ?? []) as any[];

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">

      <div className="mx-auto max-w-5xl w-full px-6 py-12 space-y-8">
        <section>
          <div className="mb-8 border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
              <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">
                ARENA VALE · DOCUMENTOS
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none">
              SÚMULAS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">
                DIGITAIS
              </span>
            </h1>
            <p className="mt-4 text-sm text-[#d4d4d8] max-w-2xl uppercase">
              Consulta oficial das súmulas dos confrontos da temporada, com hash de integridade e assinaturas
              dos capitães e do árbitro.
            </p>
          </div>
        </section>

        {lista.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-14 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-wider">
              Nenhuma súmula publicada até o momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {lista.map((jogo) => {
              const sumula = Array.isArray(jogo.sumulas) ? jogo.sumulas[0] : jogo.sumulas;
              const dataJogo = jogo.data ? new Date(jogo.data) : null;

              return (
                <Link
                  key={jogo.id}
                  href={`/sumula/${jogo.id}`}
                  className="group rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-4 shadow-2xl transition hover:-translate-y-1 hover:border-[#e50914]/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">
                      {jogo.campeonato?.nome ?? 'Confronto'}
                    </span>
                    {sumula?.status && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {String(sumula.status).replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-[11px] font-black text-white"
                        style={{ background: jogo.time_casa?.escudo_cor ?? '#e50914' }}
                      >
                        {jogo.time_casa?.sigla ?? '—'}
                      </span>
                      <span className="text-xs font-bold uppercase truncate">
                        {jogo.time_casa?.nome ?? 'Casa'}
                      </span>
                    </div>

                    <span className="font-black text-xl shrink-0">
                      {jogo.placar_casa ?? 0} × {jogo.placar_visitante ?? 0}
                    </span>

                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="text-xs font-bold uppercase truncate text-right">
                        {jogo.time_visitante?.nome ?? 'Visitante'}
                      </span>
                      <span
                        className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-[11px] font-black text-white"
                        style={{ background: jogo.time_visitante?.escudo_cor ?? '#e50914' }}
                      >
                        {jogo.time_visitante?.sigla ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] uppercase text-gray-500 pt-3 border-t border-white/10">
                    <span>{jogo.local ?? 'Local a definir'}</span>
                    <span>
                      {dataJogo && !Number.isNaN(dataJogo.getTime())
                        ? dataJogo.toLocaleDateString('pt-BR')
                        : '—'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 bg-[#050505] px-6 py-8 text-center text-xs text-[#71717a]">
        © 2026 Arena Vale · Súmula digital oficial · CNPJ 40.694.741/0001-34
      </footer>
    </main>
  );
}
