'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

const STATUS = [
  ['agendado', 'Agendado'],
  ['ao_vivo', 'Ao vivo'],
  ['finalizado', 'Finalizado'],
  ['adiado', 'Adiado'],
  ['cancelado', 'Cancelado'],
] as const;
const EVENTOS = [
  ['gol', 'Gol'],
  ['cartao_amarelo', 'Cartão amarelo'],
  ['cartao_vermelho', 'Cartão vermelho'],
] as const;

const num = (v: string) => (v.trim() === '' ? null : Math.max(0, Number.parseInt(v, 10) || 0));

function CartaoJogo({ jogo }: { jogo: JogoDoModerador }) {
  const router = useRouter();
  const id = useId();
  const [casa, setCasa] = useState(String(jogo.placar_casa ?? 0));
  const [fora, setFora] = useState(String(jogo.placar_visitante ?? 0));
  const [casa1t, setCasa1t] = useState(jogo.placar_casa_1t == null ? '' : String(jogo.placar_casa_1t));
  const [fora1t, setFora1t] = useState(jogo.placar_visitante_1t == null ? '' : String(jogo.placar_visitante_1t));
  const [status, setStatus] = useState(jogo.status);
  const [tipo, setTipo] = useState<string>('gol');
  const [minuto, setMinuto] = useState('');
  const [timeEvento, setTimeEvento] = useState(jogo.casa.id);
  const [msg, setMsg] = useState<string | null>(null);
  const titulo = `${jogo.casa.nome} × ${jogo.fora.nome}`;

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    // Só campos de resultado — data, local e times são da coordenação (o banco também barra).
    const { error } = await createClient()
      .from('jogos')
      .update({ placar_casa: num(casa) ?? 0, placar_visitante: num(fora) ?? 0, placar_casa_1t: num(casa1t), placar_visitante_1t: num(fora1t), status })
      .eq('id', jogo.id);
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
      <form onSubmit={salvar} className="flex flex-wrap items-end gap-3">
        <label htmlFor={`${id}-c`} className="grid gap-1 text-xs">Gols {jogo.casa.nome}<input id={`${id}-c`} type="number" min={0} value={casa} onChange={(e) => setCasa(e.target.value)} className={campo} /></label>
        <label htmlFor={`${id}-f`} className="grid gap-1 text-xs">Gols {jogo.fora.nome}<input id={`${id}-f`} type="number" min={0} value={fora} onChange={(e) => setFora(e.target.value)} className={campo} /></label>
        <label htmlFor={`${id}-c1`} className="grid gap-1 text-xs">1º tempo {jogo.casa.nome}<input id={`${id}-c1`} type="number" min={0} value={casa1t} onChange={(e) => setCasa1t(e.target.value)} className={campo} /></label>
        <label htmlFor={`${id}-f1`} className="grid gap-1 text-xs">1º tempo {jogo.fora.nome}<input id={`${id}-f1`} type="number" min={0} value={fora1t} onChange={(e) => setFora1t(e.target.value)} className={campo} /></label>
        <label htmlFor={`${id}-s`} className="grid gap-1 text-xs">Status
          <select id={`${id}-s`} value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            {STATUS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">Salvar resultado</button>
      </form>
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
            <table aria-label={`Classificação — ${c.nome}`} className="w-full min-w-[420px] text-sm">
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
