'use client';

import { useId, useState, type FormEvent } from 'react';

export type ValoresResultado = {
  placar_casa: number;
  placar_visitante: number;
  placar_casa_1t?: number | null;
  placar_visitante_1t?: number | null;
  penaltis_casa?: number | null;
  penaltis_visitante?: number | null;
  wo?: 'casa' | 'visitante' | null;
  status?: string;
};

export const STATUS_JOGO = [
  ['agendado', 'Agendado'],
  ['ao_vivo', 'Ao vivo'],
  ['finalizado', 'Finalizado'],
  ['adiado', 'Adiado'],
  ['cancelado', 'Cancelado'],
] as const;

type Props = {
  nomeCasa: string;
  nomeFora: string;
  /** "Gols", "Sets" ou "Pontos": vira o rótulo de cada placar ("Gols Leões"). */
  unidade?: string;
  inicial?: Partial<ValoresResultado>;
  comStatus?: boolean;
  comPrimeiroTempo?: boolean;
  /** Campo de desempate ("Pênaltis", "Set de ouro") — aparece quando `mostrarDesempate` diz que o confronto empatou. */
  desempate?: string | null;
  mostrarDesempate?: (casa: number, fora: number) => boolean;
  comWo?: boolean;
  botao?: string;
  onSalvar: (v: ValoresResultado) => void | Promise<void>;
};

const num = (v: string) => (v.trim() === '' ? null : Math.max(0, Number.parseInt(v, 10) || 0));
const txt = (v: number | null | undefined) => (v == null ? '' : String(v));

/** Formulário do resultado de um jogo (placar, 1º tempo, status, desempate e W.O., conforme o uso). */
export function FormResultado({
  nomeCasa, nomeFora, unidade = 'Gols', inicial = {}, comStatus = false, comPrimeiroTempo = false,
  desempate = null, mostrarDesempate, comWo = false, botao = 'Salvar resultado', onSalvar,
}: Props) {
  const id = useId();
  const [casa, setCasa] = useState(txt(inicial.placar_casa));
  const [fora, setFora] = useState(txt(inicial.placar_visitante));
  const [casa1t, setCasa1t] = useState(txt(inicial.placar_casa_1t));
  const [fora1t, setFora1t] = useState(txt(inicial.placar_visitante_1t));
  const [penCasa, setPenCasa] = useState(txt(inicial.penaltis_casa));
  const [penFora, setPenFora] = useState(txt(inicial.penaltis_visitante));
  const [wo, setWo] = useState<'' | 'casa' | 'visitante'>(inicial.wo ?? '');
  const [status, setStatus] = useState(inicial.status ?? 'agendado');

  const pc = num(casa) ?? 0;
  const pf = num(fora) ?? 0;
  const comDesempate = Boolean(desempate) && (mostrarDesempate ? mostrarDesempate(pc, pf) : pc === pf);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const v: ValoresResultado = { placar_casa: pc, placar_visitante: pf };
    if (comPrimeiroTempo) Object.assign(v, { placar_casa_1t: num(casa1t), placar_visitante_1t: num(fora1t) });
    if (desempate) Object.assign(v, comDesempate ? { penaltis_casa: num(penCasa), penaltis_visitante: num(penFora) } : { penaltis_casa: null, penaltis_visitante: null });
    if (comWo) v.wo = wo || null;
    if (comStatus) v.status = status;
    void onSalvar(v);
  }

  const campo = 'input w-20 text-center';
  return (
    <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
      <label htmlFor={`${id}-c`} className="grid gap-1 text-xs">{unidade} {nomeCasa}<input id={`${id}-c`} type="number" min={0} value={casa} onChange={(e) => setCasa(e.target.value)} className={campo} /></label>
      <label htmlFor={`${id}-f`} className="grid gap-1 text-xs">{unidade} {nomeFora}<input id={`${id}-f`} type="number" min={0} value={fora} onChange={(e) => setFora(e.target.value)} className={campo} /></label>
      {comPrimeiroTempo && (
        <>
          <label htmlFor={`${id}-c1`} className="grid gap-1 text-xs">1º tempo {nomeCasa}<input id={`${id}-c1`} type="number" min={0} value={casa1t} onChange={(e) => setCasa1t(e.target.value)} className={campo} /></label>
          <label htmlFor={`${id}-f1`} className="grid gap-1 text-xs">1º tempo {nomeFora}<input id={`${id}-f1`} type="number" min={0} value={fora1t} onChange={(e) => setFora1t(e.target.value)} className={campo} /></label>
        </>
      )}
      {comDesempate && (
        <>
          <label htmlFor={`${id}-pc`} className="grid gap-1 text-xs">{desempate} {nomeCasa}<input id={`${id}-pc`} type="number" min={0} value={penCasa} onChange={(e) => setPenCasa(e.target.value)} className={campo} /></label>
          <label htmlFor={`${id}-pf`} className="grid gap-1 text-xs">{desempate} {nomeFora}<input id={`${id}-pf`} type="number" min={0} value={penFora} onChange={(e) => setPenFora(e.target.value)} className={campo} /></label>
        </>
      )}
      {comWo && (
        <label htmlFor={`${id}-wo`} className="grid gap-1 text-xs">W.O.
          <select id={`${id}-wo`} value={wo} onChange={(e) => setWo(e.target.value as typeof wo)} className="input">
            <option value="">Sem W.O.</option>
            <option value="casa">Faltou {nomeCasa}</option>
            <option value="visitante">Faltou {nomeFora}</option>
          </select>
        </label>
      )}
      {comStatus && (
        <label htmlFor={`${id}-s`} className="grid gap-1 text-xs">Status
          <select id={`${id}-s`} value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            {STATUS_JOGO.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
      )}
      <button type="submit" className="btn btn-primary">{botao}</button>
    </form>
  );
}
