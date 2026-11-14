'use client';
import { useState } from 'react';
import type { Modalidade } from '@/lib/midia/modalidades';

/** Painel interativo de modalidades — clica e troca. */
export function ModalidadesOrbita({ lista }: { lista: Modalidade[] }) {
  const [ativo, setAtivo] = useState(0);
  const atual = lista[ativo];
  return (
    <div className="orbita">
      <div className="orbita-botoes" role="group" aria-label="Modalidades">
        {lista.map((m, i) => (
          <button
            key={m.slug}
            type="button"
            className={`orbita-btn${i === ativo ? ' ativo' : ''}`}
            onClick={() => setAtivo(i)}
            aria-pressed={i === ativo}
          >
            <span className="orbita-num">0{i + 1}</span>
            <span>{m.nome}</span>
          </button>
        ))}
      </div>
      <div className="orbita-painel" aria-live="polite">
        {atual && (
          <>
            <span className="orbita-conta">
              0{ativo + 1}<small> / 0{lista.length}</small>
            </span>
            <h3>{atual.nome}</h3>
            <p>{atual.frase}</p>
          </>
        )}
      </div>
    </div>
  );
}
