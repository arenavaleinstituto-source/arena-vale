'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FotoGaleria } from '@/lib/midia/galeria';

const LIMIAR_DESLIZE = 50;

/** Foto em tela cheia: setas, deslizar, Esc ou ✕ fecha, "3 / 24" e Baixar. */
export function Visualizador({ fotos, inicial, aoFechar }: { fotos: FotoGaleria[]; inicial: number; aoFechar: () => void }) {
  const [i, setI] = useState(() => Math.min(Math.max(0, inicial), fotos.length - 1));
  const inicioX = useRef<number | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const ir = (passo: number) => setI((atual) => Math.min(fotos.length - 1, Math.max(0, atual + passo)));

  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
      else if (e.key === 'ArrowRight') setI((a) => Math.min(fotos.length - 1, a + 1));
      else if (e.key === 'ArrowLeft') setI((a) => Math.max(0, a - 1));
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = antes;
      document.removeEventListener('keydown', tecla);
    };
  }, [aoFechar, fotos.length]);

  const foto = fotos[i];
  if (!foto) return null;
  return createPortal(
    <div
      className="visualizador"
      role="dialog"
      aria-modal="true"
      aria-label="Foto da galeria"
      onPointerDown={(e) => {
        inicioX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (inicioX.current === null) return;
        const dx = e.clientX - inicioX.current;
        inicioX.current = null;
        if (dx <= -LIMIAR_DESLIZE) ir(1);
        else if (dx >= LIMIAR_DESLIZE) ir(-1);
      }}
    >
      <div className="barra">
        <span className="contador">
          {i + 1} / {fotos.length}
        </span>
        <a className="baixar" href={`/api/galeria/baixar?id=${foto.id}`}>
          Baixar
        </a>
        <button ref={fecharRef} type="button" className="fechar" aria-label="Fechar" onClick={aoFechar}>
          ✕
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={foto.url} alt={`Foto ${i + 1} de ${fotos.length}`} width={foto.largura} height={foto.altura} draggable={false} />
      <button type="button" className="seta-v esq" aria-label="Foto anterior" disabled={i === 0} onClick={() => ir(-1)}>
        ‹
      </button>
      <button type="button" className="seta-v dir" aria-label="Próxima foto" disabled={i === fotos.length - 1} onClick={() => ir(1)}>
        ›
      </button>
    </div>,
    document.body,
  );
}
