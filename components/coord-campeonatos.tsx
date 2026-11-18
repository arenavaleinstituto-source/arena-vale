'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MeusCampeonatos, type CampeonatoDaLista } from '@/components/campeonatos/painel/MeusCampeonatos';
import { GerenciarCampeonato } from '@/components/campeonatos/painel/GerenciarCampeonato';

/** Aba "Campeonatos" do painel da coordenação: o que aguarda liberação no topo, todos os campeonatos e o gerenciador. */
export function CoordCampeonatos() {
  const [lista, setLista] = useState<CampeonatoDaLista[]>([]);
  const [aberto, setAberto] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await createClient().from('campeonatos').select('id, nome, ano, slug, visivel, modalidade').order('ano', { ascending: false }).order('nome');
    setLista((data ?? []) as CampeonatoDaLista[]);
  }, []);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const { data } = await createClient().from('campeonatos').select('id, nome, ano, slug, visivel, modalidade').order('ano', { ascending: false }).order('nome');
      if (vivo) setLista((data ?? []) as CampeonatoDaLista[]);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (aberto) {
    return (
      <div className="grid gap-4">
        <button type="button" className="btn-leve w-fit" onClick={() => (setAberto(null), void carregar())}>
          ← Campeonatos
        </button>
        <GerenciarCampeonato id={aberto} ehCoordenacao onApagado={() => (setAberto(null), void carregar())} />
      </div>
    );
  }

  const aguardando = lista.filter((c) => !c.visivel);
  return (
    <div className="grid gap-5">
      {aguardando.length > 0 && (
        <section aria-label="Aguardando liberação" className="panel grid gap-3 border-av-amarelo/40">
          <h2 className="font-display text-xl font-extrabold uppercase text-av-amarelo">Aguardando liberação</h2>
          <ul className="grid gap-2">
            {aguardando.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-av-linha bg-av-grafite-2 p-3">
                <strong className="min-w-0 flex-1 truncate">
                  {c.nome} <span className="text-av-cinza">· {c.ano}</span>
                </strong>
                <button type="button" className="btn-forte" onClick={() => setAberto(c.id)}>
                  Revisar e liberar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <MeusCampeonatos campeonatos={lista} ehCoordenacao onAbrir={setAberto} />
    </div>
  );
}
