'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { VideoYT } from '@/lib/midia/youtube';

/** Player em tela cheia de um corte (Short), sem cookies do YouTube. */
export function PlayerCorte({ video, aoFechar }: { video: VideoYT; aoFechar: () => void }) {
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = antes;
      document.removeEventListener('keydown', tecla);
    };
  }, [aoFechar]);

  return createPortal(
    <>
      <div className="fundo-corte" onClick={aoFechar} />
      <div className="player-corte" role="dialog" aria-modal="true" aria-label={video.titulo}>
        <button ref={fecharRef} type="button" className="fechar" aria-label="Fechar" onClick={aoFechar}>
          ✕
        </button>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1`}
          title={video.titulo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </>,
    document.body,
  );
}
