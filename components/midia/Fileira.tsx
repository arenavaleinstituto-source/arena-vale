'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const INTERVALO_GIRO = 4000;

/**
 * Fileira horizontal de cartazes: rola com o dedo; no computador, setas laterais.
 * Com `girar`, avança sozinha a cada 4 s e, no fim, volta ao começo (as mais novas).
 * Para enquanto a pessoa está com o mouse em cima, tocando ou com o foco dentro.
 */
export function Fileira({ rotulo, girar = false, children }: { rotulo: string; girar?: boolean; children: ReactNode }) {
  const trilho = useRef<HTMLDivElement>(null);
  const parado = useRef(false);

  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  useEffect(() => {
    if (!girar) return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      const el = trilho.current;
      if (!el || parado.current || document.hidden) return;
      const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (noFim) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
    }, INTERVALO_GIRO);
    return () => window.clearInterval(id);
  }, [girar]);

  const parar = () => {
    parado.current = true;
  };
  const seguir = () => {
    parado.current = false;
  };

  return (
    <div
      className="fileira"
      onMouseEnter={parar}
      onMouseLeave={seguir}
      onTouchStart={parar}
      onTouchEnd={() => window.setTimeout(seguir, INTERVALO_GIRO)}
      onFocus={parar}
      onBlur={seguir}
    >
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
