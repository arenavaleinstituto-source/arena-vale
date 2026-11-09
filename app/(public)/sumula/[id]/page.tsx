// Súmula digital pública (Server Component)
// Server Component de propósito: a súmula é um documento oficial e deve
// ser indexável e renderizado no servidor, sem depender de JavaScript.
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

/**
 * SÚMULA DIGITAL — /sumula/[id]
 *
 * ⚠️ ANTES, esta rota era uma CÓPIA DA HOME de outra organização: tinha
 * "Vale do Paraíba · SP", "A CASA DO FUTEBOL DO VALE", times fictícios
 * (Vila Real FC, União FC…) e rodapé "Feito com 💙💛 no Vale do Paraíba".
 * O parâmetro `[id]` nunca era lido — a rota ignorava o ID e servia a
 * mesma landing page para qualquer súmula, e ainda respondia HTTP 500.
 *
 * AGORA a rota exibe a súmula real do confronto: times, placar, local,
 * data, arbitragem, assinaturas e hash de conteúdo, lidos do banco.
 * O `[id]` é o ID do JOGO (é o que o QR Code aponta) — a súmula é
 * buscada por `jogo_id`, exatamente como em `getSumula()`.
 */

export const dynamic = 'force-dynamic';

interface LinhaSumula {
  id: string;
  hash_conteudo: string;
  status: string;
  arbitro_nome: string | null;
  capitão_casa_nome: string | null;
  capitão_visitante_nome: string | null;
  observacoes: string | null;
  validada_em: string | null;
}

function rotuloStatus(status: string): { texto: string; classe: string } {
  switch (status) {
    case 'validada':
      return { texto: 'VALIDADA', classe: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' };
    case 'pendente_assinatura':
      return { texto: 'AGUARDANDO ASSINATURAS', classe: 'bg-[#e50914]/15 text-[#ff3b44] border-[#e50914]/40' };
    case 'contestada':
      return { texto: 'CONTESTADA', classe: 'bg-red-500/15 text-red-300 border-red-500/40' };
    default:
      return { texto: 'RASCUNHO', classe: 'bg-white/10 text-gray-300 border-white/20' };
  }
}

export default async function SumulaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  // Busca o jogo pelo id do parâmetro.
  // `as any` no resultado: o PostgREST devolve as relações aninhadas
  // (times, campeonato) como arrays, e o tipo gerado do Supabase não
  // reflete isso para selects com relacionamentos.
  const { data: jogoBruto, error: erroJogo } = await supabase
    .from('jogos')
    .select(
      `
        id, fase, rodada, data, local, status,
        placar_casa, placar_visitante, placar_casa_1t, placar_visitante_1t,
        arbitro,
        time_casa:times!time_casa_id(nome, sigla, escudo_url, escudo_cor),
        time_visitante:times!time_visitante_id(nome, sigla, escudo_url, escudo_cor),
        campeonato:campeonatos(nome, ano)
      `
    )
    .eq('id', params.id)
    .maybeSingle();

  const jogo = jogoBruto as any;

  if (erroJogo || !jogo) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-6 px-6 font-sans text-center">
        <span className="text-6xl font-black text-[#e50914] tracking-widest">404</span>
        <h1 className="text-xl font-black uppercase tracking-wider">Súmula não encontrada</h1>
        <p className="text-sm text-gray-400 max-w-md">
          Não existe uma súmula para o código informado. Confira o QR Code ou volte ao mural de comunicados.
        </p>
        <Link
          href="/noticias"
          className="rounded-full bg-[#e50914] px-7 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#ff1e27] transition"
        >
          VOLTAR ÀS NOTÍCIAS
        </Link>
      </main>
    );
  }

  // A súmula é buscada pelo jogo_id.
  const { data: sumula } = await supabase
    .from('sumulas')
    .select(
      'id, hash_conteudo, status, arbitro_nome, capitão_casa_nome, capitão_visitante_nome, observacoes, validada_em'
    )
    .eq('jogo_id', params.id)
    .maybeSingle();

  const linha = (sumula ?? null) as LinhaSumula | null;
  const status = rotuloStatus(linha?.status ?? 'rascunho');
  const dataJogo = jogo.data ? new Date(jogo.data) : null;

  const dados = [
    { rotulo: 'Campeonato', valor: jogo.campeonato?.nome ?? '—' },
    { rotulo: 'Fase', valor: (jogo.fase ?? '—').toString().replace(/_/g, ' ') },
    { rotulo: 'Rodada', valor: jogo.rodada ? `${jogo.rodada}ª` : '—' },
    { rotulo: 'Local', valor: jogo.local ?? '—' },
    {
      rotulo: 'Data',
      valor: dataJogo && !Number.isNaN(dataJogo.getTime()) ? dataJogo.toLocaleString('pt-BR') : '—',
    },
    { rotulo: 'Árbitro', valor: linha?.arbitro_nome ?? jogo.arbitro ?? '—' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      {/* CABEÇALHO */}

      <div className="mx-auto max-w-5xl w-full px-6 py-12 space-y-8">
        {/* PLACAR */}
        <section className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${status.classe}`}>
              {status.texto}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full grid place-items-center text-white font-black text-lg sm:text-xl border border-white/10"
                style={{ background: jogo.time_casa?.escudo_cor ?? '#e50914' }}
              >
                {jogo.time_casa?.sigla ?? '—'}
              </div>
              <strong className="text-sm sm:text-base uppercase">{jogo.time_casa?.nome ?? 'Time da casa'}</strong>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 font-black text-4xl sm:text-6xl">
              <span>{jogo.placar_casa ?? 0}</span>
              <span className="text-gray-600 text-2xl sm:text-3xl font-normal">×</span>
              <span>{jogo.placar_visitante ?? 0}</span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full grid place-items-center text-white font-black text-lg sm:text-xl border border-white/10"
                style={{ background: jogo.time_visitante?.escudo_cor ?? '#e50914' }}
              >
                {jogo.time_visitante?.sigla ?? '—'}
              </div>
              <strong className="text-sm sm:text-base uppercase">
                {jogo.time_visitante?.nome ?? 'Time visitante'}
              </strong>
            </div>
          </div>

          {(jogo.placar_casa_1t ?? null) !== null && (
            <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
              1º tempo: {jogo.placar_casa_1t} × {jogo.placar_visitante_1t}
            </p>
          )}
        </section>

        {/* DADOS DA PARTIDA */}
        <section className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#e50914] mb-6">
            Dados da partida
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dados.map((dado) => (
              <div key={dado.rotulo} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                  {dado.rotulo}
                </span>
                <p className="mt-1 text-sm font-bold text-white uppercase">{dado.valor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ASSINATURAS */}
        <section className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#e50914] mb-6">
            Assinaturas
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { papel: 'Árbitro', nome: linha?.arbitro_nome ?? jogo.arbitro ?? null },
              { papel: 'Capitão da casa', nome: linha?.capitão_casa_nome ?? null },
              { papel: 'Capitão visitante', nome: linha?.capitão_visitante_nome ?? null },
            ].map((assinatura) => (
              <div
                key={assinatura.papel}
                className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {assinatura.papel}
                </span>
                <p className="mt-3 h-8 border-b border-white/20" />
                <p className="mt-2 text-xs font-bold text-white uppercase">
                  {assinatura.nome || 'Aguardando assinatura'}
                </p>
              </div>
            ))}
          </div>

          {linha?.observacoes && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                Observações
              </span>
              <p className="mt-2 text-sm text-[#d4d4d8] leading-relaxed">{linha.observacoes}</p>
            </div>
          )}
        </section>

        {/* INTEGRIDADE */}
        {linha?.hash_conteudo && (
          <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#e50914] mb-3">
              Integridade do documento
            </h2>
            <p className="text-[11px] text-gray-400 uppercase mb-3">
              Hash SHA-256 imutável do conteúdo desta súmula
            </p>
            <code className="block break-all text-[11px] text-[#a1a1aa] bg-black/40 border border-white/5 rounded-lg p-3">
              {linha.hash_conteudo}
            </code>
            {linha.validada_em && (
              <p className="mt-3 text-[11px] uppercase text-gray-500">
                Validada em {new Date(linha.validada_em).toLocaleString('pt-BR')}
              </p>
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-white/10 bg-[#050505] px-6 py-8 text-center text-xs text-[#71717a]">
        © 2026 Arena Vale · Súmula digital oficial · CNPJ 40.694.741/0001-34
      </footer>
    </main>
  );
}
