'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TimeDaPagina } from '@/lib/campeonatos/busca';
import { EscudoTime } from './EscudoTime';

export type LadoChave = { time?: TimeDaPagina; rotulo?: string; provavel?: string };
export type ConfrontoChave = { id: string; casa: LadoChave; visitante: LadoChave; placar: string | null; quando: string };
export type FaseChave = { fase: string; confrontos: ConfrontoChave[] };

function Lado({ l }: { l: LadoChave }) {
  if (l.time) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <EscudoTime time={l.time} tamanho={24} />
        <span className="truncate font-bold">{l.time.nome}</span>
      </span>
    );
  }
  return (
    <span className="min-w-0">
      <span className="block truncate text-av-cinza">{l.rotulo ?? 'A definir'}</span>
      {l.provavel && <span className="block truncate text-xs text-av-cinza/70">provável: {l.provavel}</span>}
    </span>
  );
}

/** Chave do mata-mata: colunas por fase no computador; uma fase por vez no celular. */
export function Chave({ fases }: { fases: FaseChave[] }) {
  const [atual, setAtual] = useState(0);
  if (!fases.length) return <p className="vazio">A chave aparece quando os jogos do mata-mata forem gerados.</p>;
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button type="button" aria-label="Fase anterior" disabled={atual === 0} onClick={() => setAtual((a) => Math.max(0, a - 1))} className="btn-leve px-4 disabled:opacity-40">
          ‹
        </button>
        <strong className="font-display text-lg font-extrabold uppercase">{fases[atual].fase}</strong>
        <button type="button" aria-label="Próxima fase" disabled={atual === fases.length - 1} onClick={() => setAtual((a) => Math.min(fases.length - 1, a + 1))} className="btn-leve px-4 disabled:opacity-40">
          ›
        </button>
      </div>
      <div className="grid gap-4 md:grid-flow-col md:auto-cols-[minmax(220px,1fr)] md:overflow-x-auto">
        {fases.map((f, i) => (
          <section key={f.fase} aria-label={f.fase} className={`${i === atual ? 'grid' : 'hidden'} content-around gap-3 md:grid`}>
            <h3 className="hidden font-display text-lg font-extrabold uppercase md:block">{f.fase}</h3>
            {f.confrontos.map((c) => (
              <Link key={c.id} href={`/sumula/${c.id}`} className="grid gap-1.5 rounded-xl border border-av-linha bg-av-grafite-2 p-3 text-sm hover:border-av-vermelho">
                <Lado l={c.casa} />
                <Lado l={c.visitante} />
                <span className="flex justify-between gap-2 border-t border-av-linha pt-1.5 font-rotulo text-xs font-bold uppercase tracking-wider text-av-cinza">
                  <span>{c.quando}</span>
                  {c.placar && <span className="text-av-branco">{c.placar}</span>}
                </span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
