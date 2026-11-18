'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NovoCampeonato } from './NovoCampeonato';

export type CampeonatoDaLista = { id: string; nome: string; ano: number; slug: string; visivel: boolean; modalidade: string | null };

/** Lista de campeonatos do painel (os do moderador, ou todos para a coordenação) e o assistente de criação. */
export function MeusCampeonatos({ campeonatos, ehCoordenacao, onAbrir }: { campeonatos: CampeonatoDaLista[]; ehCoordenacao: boolean; onAbrir?: (id: string) => void }) {
  const router = useRouter();
  const [criando, setCriando] = useState(false);

  if (criando) {
    return (
      <div className="panel grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold uppercase">Novo campeonato</h2>
          <button type="button" className="btn-leve" onClick={() => setCriando(false)}>
            Fechar
          </button>
        </div>
        <NovoCampeonato
          gerirModalidades={ehCoordenacao}
          onCriado={(id) => {
            setCriando(false);
            if (onAbrir) return onAbrir(id);
            router.push(`?campeonato=${id}`);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="panel grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">{ehCoordenacao ? 'Campeonatos' : 'Meus campeonatos'}</h2>
        <button type="button" className="btn-forte" onClick={() => setCriando(true)}>
          + Novo campeonato
        </button>
      </div>
      {campeonatos.length === 0 ? (
        <p className="text-av-cinza">Nenhum campeonato ainda. Crie o primeiro.</p>
      ) : (
        <ul className="grid gap-2">
          {campeonatos.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-av-linha bg-av-grafite-2 p-3">
              <span className="min-w-0 flex-1">
                <strong className="block truncate">
                  {c.nome}
                </strong>
                {!c.visivel && (
                  <span className="mt-1 inline-block rounded-full border border-av-amarelo/60 px-3 py-0.5 font-rotulo text-xs font-bold uppercase tracking-wider text-av-amarelo">
                    Aguardando liberação da ARENA VALE
                  </span>
                )}
              </span>
              <Link href={`/campeonatos/${c.slug}`} target="_blank" className="btn-leve">
                Pré-visualizar
              </Link>
              {onAbrir ? (
                <button type="button" className="btn-forte" onClick={() => onAbrir(c.id)}>
                  Abrir
                </button>
              ) : (
                <Link href={`?campeonato=${c.id}`} className="btn-forte">
                  Abrir
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
