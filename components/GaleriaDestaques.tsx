'use client';

import React, { useState } from 'react';
import CartaoDestaque from '@/components/CartaoDestaque';
import { FILTROS_MODALIDADE, type Destaque } from '@/lib/content';

/**
 * GALERIA DE ATLETAS DESTAQUE — parte interativa
 *
 * A página `app/atletasdestaques/page.tsx` é uma Server Component: ela
 * busca os destaques no banco e entrega a lista já pronta. Este
 * componente cuida só do filtro por modalidade.
 *
 * Antes, a galeria era um Client Component que buscava dentro de um
 * useEffect — o HTML inicial mostrava só um "A carregar destaques..." e
 * os atletas publicados não existiam para os buscadores. Pior: ela lia
 * `localStorage`, uma chave que NENHUM código escreve, então os atletas
 * publicados pelo painel nunca apareciam.
 */
interface GaleriaDestaquesProps {
  destaques: Destaque[];
}

export default function GaleriaDestaques({ destaques }: GaleriaDestaquesProps) {
  const [filtro, setFiltro] = useState<string>('TODOS');

  const atletasFiltrados =
    filtro === 'TODOS'
      ? destaques
      : destaques.filter((a) => a.modalidade.toUpperCase() === filtro);

  return (
    <>
      {/* FILTROS DE MODALIDADE — vocabulário único do projeto */}
      <div className="flex flex-wrap gap-2.5">
        {FILTROS_MODALIDADE.map((mod) => (
          <button
            key={mod}
            type="button"
            onClick={() => setFiltro(mod)}
            aria-pressed={filtro === mod}
            className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition ${
              filtro === mod
                ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                : 'border border-white/15 bg-white/5 text-[#d4d4d8] hover:text-white'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* GRELHA DE ATLETAS */}
      {atletasFiltrados.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-14 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-wider">
            Nenhum atleta em destaque nesta modalidade.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {atletasFiltrados.map((atleta) => (
            <CartaoDestaque key={atleta.id} destaque={atleta} />
          ))}
        </div>
      )}
    </>
  );
}
