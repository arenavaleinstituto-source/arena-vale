'use client';

import type { FormaDisputa } from '@/lib/campeonatos/tipos';
import { CAIXA, CAMPO, TITULO_BLOCO } from './estilos';

type Time = { id: string; nome: string };
type Props = {
  forma: FormaDisputa;
  times: Time[];
  grupos: Record<string, string[]>;
  sementes: string[];
  onGrupos: (g: Record<string, string[]>) => void;
  onSementes: (s: string[]) => void;
};

const letras = (n: number) => Array.from({ length: Math.max(1, n) }, (_, i) => String.fromCharCode(65 + i));

/**
 * O que a forma de disputa pede montado à mão: grupos (cada time num grupo), a ordem da chave
 * do mata-mata direto, ou as cabeças de chave do sorteio.
 */
export function MontagemManual({ forma, times, grupos, sementes, onGrupos, onSementes }: Props) {
  if (forma.tipo === 'grupos_mata_mata' && forma.montagem === 'manual') {
    const ls = letras(forma.grupos);
    const grupoDe = (id: string) => ls.find((l) => grupos[l]?.includes(id)) ?? '';
    const colocar = (id: string, l: string) => {
      const novo: Record<string, string[]> = Object.fromEntries(ls.map((x) => [x, (grupos[x] ?? []).filter((t) => t !== id)]));
      if (l) novo[l] = [...novo[l], id];
      onGrupos(novo);
    };
    return (
      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Grupos montados à mão</span>
        {times.map((t) => (
          <label key={t.id} className="flex items-center gap-3 text-sm">
            <span className="flex-1">{t.nome}</span>
            <select aria-label={`Grupo de ${t.nome}`} className={`${CAMPO} w-32`} value={grupoDe(t.id)} onChange={(e) => colocar(t.id, e.target.value)}>
              <option value="">-</option>
              {ls.map((l) => (
                <option key={l} value={l}>
                  Grupo {l}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    );
  }

  if (forma.tipo === 'grupos_mata_mata' && forma.montagem === 'sorteio_cabecas') {
    return (
      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Cabeças de chave (uma por grupo)</span>
        {times.map((t) => (
          <label key={t.id} className={CAIXA}>
            <input
              type="checkbox"
              checked={sementes.includes(t.id)}
              onChange={(e) => onSementes(e.target.checked ? [...sementes, t.id] : sementes.filter((s) => s !== t.id))}
            />
            {t.nome}
          </label>
        ))}
      </div>
    );
  }

  if (forma.tipo === 'mata_mata' && forma.mata.chave === 'manual') {
    const ordem = [...sementes.filter((s) => times.some((t) => t.id === s)), ...times.map((t) => t.id).filter((id) => !sementes.includes(id))];
    const nome = (id: string) => times.find((t) => t.id === id)?.nome ?? '';
    const mover = (i: number, d: -1 | 1) => {
      const l = [...ordem];
      [l[i], l[i + d]] = [l[i + d], l[i]];
      onSementes(l);
    };
    return (
      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Chave montada à mão</span>
        <p className="text-xs text-av-cinza">Os times se enfrentam de dois em dois, na ordem da lista. Os primeiros passam direto quando o número de times pede fase preliminar.</p>
        <ol className="grid gap-1">
          {ordem.map((id, i) => (
            <li key={id} className="flex items-center gap-2 rounded-xl border border-av-linha bg-av-grafite-2 px-3 py-1.5 text-sm">
              <span className="w-6 text-av-cinza">{i + 1}</span>
              <span className="flex-1">{nome(id)}</span>
              <button type="button" aria-label={`Subir ${nome(id)}`} disabled={i === 0} onClick={() => mover(i, -1)} className="btn-leve px-3 py-1 disabled:opacity-30">
                ↑
              </button>
              <button type="button" aria-label={`Descer ${nome(id)}`} disabled={i === ordem.length - 1} onClick={() => mover(i, 1)} className="btn-leve px-3 py-1 disabled:opacity-30">
                ↓
              </button>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return null;
}

/** O que mandar para o `gerar`, a partir da montagem à mão. */
export function montagemParaGerar(forma: FormaDisputa, times: Time[], grupos: Record<string, string[]>, sementes: string[]): { grupos?: Record<string, string[]>; sementes?: string[] } {
  // Grupos vazios = ainda não montados aqui: o servidor usa os grupos já gravados nos jogos.
  if (forma.tipo === 'grupos_mata_mata' && forma.montagem === 'manual') return Object.keys(grupos).length ? { grupos } : {};
  if (forma.tipo === 'grupos_mata_mata' && forma.montagem === 'sorteio_cabecas') return { sementes };
  if (forma.tipo === 'mata_mata' && forma.mata.chave === 'manual') {
    return { sementes: [...sementes.filter((s) => times.some((t) => t.id === s)), ...times.map((t) => t.id).filter((id) => !sementes.includes(id))] };
  }
  return {};
}
