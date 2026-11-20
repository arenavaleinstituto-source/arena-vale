'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FormResultado, STATUS_JOGO, type ValoresResultado } from './FormResultado';

export { FormResultado, STATUS_JOGO };

type Time = { id: string; nome: string };
export type JogoDoModerador = {
  id: string;
  data: string;
  local: string | null;
  status: string;
  placar_casa: number | null;
  placar_visitante: number | null;
  placar_casa_1t: number | null;
  placar_visitante_1t: number | null;
  casa: Time;
  fora: Time;
};
export type LinhaClassificacao = {
  time_id: string;
  time_nome: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  saldo: number;
  pontos: number;
};
export type CampeonatoDoModerador = { id: string; nome: string; jogos: JogoDoModerador[]; classificacao: LinhaClassificacao[] };

const EVENTOS = [
  ['gol', 'Gol'],
  ['cartao_amarelo', 'Cartão amarelo'],
  ['cartao_vermelho', 'Cartão vermelho'],
] as const;

function CartaoJogo({ jogo }: { jogo: JogoDoModerador }) {
  const router = useRouter();
  const id = useId();
  const [tipo, setTipo] = useState<string>('gol');
  const [minuto, setMinuto] = useState('');
  const [timeEvento, setTimeEvento] = useState(jogo.casa.id);
  const [msg, setMsg] = useState<string | null>(null);
  const titulo = `${jogo.casa.nome} × ${jogo.fora.nome}`;

  async function salvar(v: ValoresResultado) {
    setMsg(null);
    // Só campos de resultado.
    const { error } = await createClient().from('jogos').update(v).eq('id', jogo.id);
    setMsg(error ? error.message : 'Resultado salvo.');
    if (!error) router.refresh();
  }

  async function adicionarEvento() {
    setMsg(null);
    const m = Number.parseInt(minuto, 10);
    if (!Number.isFinite(m) || m < 0) return setMsg('Informe o minuto do evento.');
    const { error } = await createClient().from('eventos_jogo').insert({ jogo_id: jogo.id, tipo, minuto: m, time_id: timeEvento });
    setMsg(error ? error.message : 'Evento adicionado.');
    if (!error) setMinuto('');
  }

  const campo = 'input w-20 text-center';
  return (
    <fieldset aria-label={titulo} className="rounded-2xl border border-white/10 p-4">
      <legend className="px-2 text-sm font-black uppercase">{titulo}</legend>
      <p className="mb-3 text-xs text-[var(--text-dim)]">
        {new Date(jogo.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · {jogo.local ?? 'Local a definir'}
      </p>
      <FormResultado
        nomeCasa={jogo.casa.nome}
        nomeFora={jogo.fora.nome}
        inicial={{ placar_casa: jogo.placar_casa ?? 0, placar_visitante: jogo.placar_visitante ?? 0, placar_casa_1t: jogo.placar_casa_1t, placar_visitante_1t: jogo.placar_visitante_1t, status: jogo.status }}
        comStatus
        comPrimeiroTempo
        onSalvar={salvar}
      />
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-white/10 pt-4">
        <label htmlFor={`${id}-t`} className="grid gap-1 text-xs">Tipo de evento
          <select id={`${id}-t`} value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
            {EVENTOS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-m`} className="grid gap-1 text-xs">Minuto<input id={`${id}-m`} type="number" min={0} value={minuto} onChange={(e) => setMinuto(e.target.value)} className={campo} /></label>
        <label htmlFor={`${id}-te`} className="grid gap-1 text-xs">Time do evento
          <select id={`${id}-te`} value={timeEvento} onChange={(e) => setTimeEvento(e.target.value)} className="input">
            <option value={jogo.casa.id}>{jogo.casa.nome}</option>
            <option value={jogo.fora.id}>{jogo.fora.nome}</option>
          </select>
        </label>
        <button type="button" onClick={adicionarEvento} className="btn">Adicionar evento</button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm">{msg}</p>}
    </fieldset>
  );
}

/** Painel do moderador: resultados dos campeonatos ligados a ele (spec 5.1). */
export function ResultadosCampeonato({ campeonatos }: { campeonatos: CampeonatoDoModerador[] }) {
  if (campeonatos.length === 0) {
    return <p className="panel text-center">Nenhum campeonato liberado para você ainda. Fale com a coordenação.</p>;
  }
  return (
    <div className="grid gap-8">
      {campeonatos.map((c) => (
        <section key={c.id} className="panel grid gap-5">
          <h2 className="text-2xl font-black uppercase">{c.nome}</h2>
          {c.jogos.length === 0 && <p className="text-sm text-[var(--text-dim)]">A coordenação ainda não montou a tabela de jogos.</p>}
          {c.jogos.map((j) => <CartaoJogo key={j.id} jogo={j} />)}
          <div className="overflow-x-auto">
            <table aria-label={`Classificação: ${c.nome}`} className="w-full min-w-[420px] text-sm">
              <thead><tr className="text-left text-xs uppercase text-[var(--text-dim)]"><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead>
              <tbody>
                {c.classificacao.map((l) => (
                  <tr key={l.time_id} className="border-t border-white/10">
                    <td className="py-2 font-bold">{l.time_nome}</td><td>{l.pontos}</td><td>{l.jogos}</td><td>{l.vitorias}</td><td>{l.empates}</td><td>{l.derrotas}</td><td>{l.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
