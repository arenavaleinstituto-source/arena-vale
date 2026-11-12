'use client';

import { useCallback, useRef, useState } from 'react';
import type { FotoGaleria } from '@/lib/midia/galeria';
import { Visualizador } from './Visualizador';

/** Grade de miniaturas do álbum; tocar abre o visualizador. */
export function FotosDoAlbum({ fotos }: { fotos: FotoGaleria[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const origem = useRef<HTMLButtonElement | null>(null);
  const fechar = useCallback(() => {
    setAberta(null);
    origem.current?.focus();
  }, []);

  if (fotos.length === 0) return <p className="vazio">Este álbum ainda não tem fotos.</p>;
  return (
    <>
      <div className="grade-fotos">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className="miniatura"
            aria-label={`Abrir foto ${i + 1}`}
            onClick={(e) => {
              origem.current = e.currentTarget;
              setAberta(i);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.miniaturaUrl} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      {aberta !== null && <Visualizador fotos={fotos} inicial={aberta} aoFechar={fechar} />}
    </>
  );
}
