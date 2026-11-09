'use client';

import { useRef, type ReactNode } from 'react';

/** Fileira horizontal de cartazes: rola com o dedo; no computador, setas laterais. */
export function Fileira({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const trilho = useRef<HTMLDivElement>(null);
  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' });
  }
  return (
    <div className="fileira">
      <button type="button" className="seta esq" aria-label={`Anterior ${rotulo}`} onClick={() => rolar(-1)}>
        ‹
      </button>
      <div className="trilho" ref={trilho} role="region" aria-label={rotulo}>
        {children}
      </div>
      <button type="button" className="seta dir" aria-label={`Próximo ${rotulo}`} onClick={() => rolar(1)}>
        ›
      </button>
    </div>
  );
}
