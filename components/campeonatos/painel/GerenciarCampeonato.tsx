'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { lerRegulamento } from '@/lib/campeonatos/regulamento';
import { gruposDosJogos, paraJogoCalc } from '@/lib/campeonatos/portas';
import type { Regulamento, Sorteios } from '@/lib/campeonatos/tipos';
import { AbaJogosCampeonato, type JogoDoPainel } from './AbaJogosCampeonato';
import type { TimeInscrito } from './TimesDoCampeonato';

export type CampeonatoDoPainel = {
  id: string;
  nome: string;
  ano: number;
  slug: string;
  visivel: boolean;
  modalidade: string | null;
  categoria: string | null;
  status: string;
  logo_url: string | null;
  formato: string | null;
  regulamento: Regulamento;
  ordem_sorteio: Sorteios;
  fases_destravadas: string[];
};

export type DadosDoPainel = {
  campeonato: CampeonatoDoPainel;
  times: TimeInscrito[];
  jogos: JogoDoPainel[];
  delegados: { id: string; nome: string }[];
};

export type Aba = 'jogos' | 'times' | 'forma' | 'regulamento' | 'dados';
const ABAS: [Aba, string][] = [
  ['jogos', 'Jogos'],
  ['times', 'Times'],
  ['forma', 'Forma de disputa'],
  ['regulamento', 'Regulamento'],
  ['dados', 'Dados e escudo'],
];

const COLUNAS_JOGO =
  'id,ordem,fase,grupo,rodada,data,local,delegado_id,time_casa_id,time_visitante_id,status,placar_casa,placar_visitante,penaltis_casa,penaltis_visitante,wo,parciais,vaga_casa,vaga_visitante,vaga_manual,jogo_volta_de';

/** Carrega tudo o que o gerenciador precisa (com a sessão de quem está no painel). */
export async function carregarPainel(id: string, ehCoordenacao: boolean): Promise<DadosDoPainel | null> {
  const sb = createClient();
  const [{ data: c }, { data: insc }, { data: js }, { data: dels }] = await Promise.all([
    sb.from('campeonatos').select('id,nome,ano,slug,visivel,modalidade,categoria,status,logo_url,formato,regulamento,ordem_sorteio,fases_destravadas').eq('id', id).maybeSingle(),
    sb.from('inscricoes').select('id,status,time:times(id,nome,sigla,escudo_url,escudo_cor)').eq('campeonato_id', id).eq('status', 'aprovada'),
    sb.from('jogos').select(COLUNAS_JOGO).eq('campeonato_id', id).order('ordem', { ascending: true, nullsFirst: false }),
    ehCoordenacao ? sb.from('profiles').select('id,full_name,email').eq('role', 'delegado').order('full_name') : Promise.resolve({ data: [] }),
  ]);
  if (!c) return null;
  const linha = c as Record<string, unknown>;
  return {
    campeonato: {
      ...(linha as unknown as CampeonatoDoPainel),
      regulamento: lerRegulamento(linha.regulamento, { formatoAntigo: (linha.formato as string | null) ?? null, modalidade: (linha.modalidade as string | null) ?? null }),
      ordem_sorteio: (linha.ordem_sorteio as Sorteios | null) ?? {},
      fases_destravadas: (linha.fases_destravadas as string[] | null) ?? [],
    },
    times: ((insc ?? []) as unknown as { id: string; time: TimeInscrito | null }[]).filter((i) => i.time).map((i) => ({ ...(i.time as TimeInscrito), inscricao_id: i.id })),
    jogos: ((js ?? []) as Record<string, unknown>[]).map((l) => ({ ...paraJogoCalc(l as never), data: (l.data as string | null) ?? null, local: (l.local as string | null) ?? null, delegado_id: (l.delegado_id as string | null) ?? null })),
    delegados: ((dels ?? []) as { id: string; full_name: string | null; email: string | null }[]).map((d) => ({ id: d.id, nome: d.full_name || d.email || 'Delegado' })),
  };
}

type Props = { id: string; ehCoordenacao: boolean };

/** Gerenciador de um campeonato no painel (moderador do campeonato ou coordenação). */
export function GerenciarCampeonato({ id, ehCoordenacao }: Props) {
  const [dados, setDados] = useState<DadosDoPainel | null>(null);
  const [erro, setErro] = useState(false);
  const [aba, setAba] = useState<Aba>('jogos');

  const recarregar = useCallback(async () => {
    try {
      const d = await carregarPainel(id, ehCoordenacao);
      setDados(d);
      setErro(!d);
    } catch {
      setErro(true);
    }
  }, [id, ehCoordenacao]);

  useEffect(() => {
    let vivo = true;
    void carregarPainel(id, ehCoordenacao)
      .then((d) => vivo && (setDados(d), setErro(!d)))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [id, ehCoordenacao]);

  if (erro) return <p className="panel text-av-cinza">Não encontrei este campeonato, ou você não tem acesso a ele.</p>;
  if (!dados) return <p className="panel text-av-cinza">Carregando…</p>;
  const c = dados.campeonato;
  const nomes = Object.fromEntries(dados.times.map((t) => [t.id, { nome: t.nome }]));

  return (
    <div className="grid gap-5">
      <div className="panel grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-extrabold uppercase">
            {c.nome} <span className="text-av-cinza">{c.ano}</span>
          </h2>
          {!c.visivel && (
            <span className="rounded-full border border-av-amarelo/60 px-3 py-0.5 font-rotulo text-xs font-bold uppercase tracking-wider text-av-amarelo">Aguardando liberação da ARENA VALE</span>
          )}
          <a href={`/campeonatos/${c.slug}`} target="_blank" rel="noreferrer" className="btn-leve ml-auto">
            Pré-visualizar
          </a>
        </div>
        <nav aria-label="Abas do campeonato" className="flex flex-wrap gap-2">
          {ABAS.map(([a, rotulo]) => (
            <button
              key={a}
              type="button"
              aria-pressed={aba === a}
              onClick={() => setAba(a)}
              className={`rounded-full border px-4 py-2 font-rotulo text-sm font-bold uppercase tracking-wider ${aba === a ? 'border-av-vermelho bg-av-vermelho text-white' : 'border-av-linha text-av-cinza'}`}
            >
              {rotulo}
            </button>
          ))}
        </nav>
      </div>
      <div className="panel">
        {aba === 'jogos' ? (
          <AbaJogosCampeonato
            campeonato={c}
            jogos={dados.jogos}
            times={nomes}
            grupos={gruposDosJogos(dados.jogos)}
            ehCoordenacao={ehCoordenacao}
            delegados={dados.delegados}
            onMudou={() => void recarregar()}
          />
        ) : (
          <p className="text-av-cinza">Em breve.</p>
        )}
      </div>
    </div>
  );
}
