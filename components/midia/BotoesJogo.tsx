'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { ItemAgenda } from '@/lib/midia/agenda';
import { linkGoogleAgenda } from '@/lib/midia/lembrete';

/** Botões do cartão do jogo: Lembrar (agenda), sininho do YouTube e Ver fotos. */
export function BotoesJogo({
  item,
  baseUrl,
  youtubeHandle,
  albumId,
}: {
  item: ItemAgenda;
  baseUrl: string;
  youtubeHandle: string;
  albumId?: string | null;
}) {
  const [aberto, setAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const idMenu = useId();

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const fora = (e: PointerEvent) => {
      if (caixaRef.current && !caixaRef.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fora);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('pointerdown', fora);
    };
  }, [aberto]);

  const ics = `/api/lembrete?origem=${item.origem}&id=${encodeURIComponent(item.id)}`;

  return (
    <div className="botoes-jogo">
      <div className="lembrar" ref={caixaRef}>
        <button
          ref={botaoRef}
          type="button"
          className="bj"
          aria-expanded={aberto}
          aria-controls={idMenu}
          onClick={() => setAberto((v) => !v)}
        >
          ⏰ Lembrar
        </button>
        {aberto && (
          <div className="menu-lembrar" id={idMenu}>
            <a href={linkGoogleAgenda(item, baseUrl)} target="_blank" rel="noopener noreferrer" onClick={() => setAberto(false)}>
              Google Agenda
            </a>
            <a href={ics} onClick={() => setAberto(false)}>
              Agenda do celular
            </a>
          </div>
        )}
      </div>
      <a
        className="bj"
        href={`https://www.youtube.com/${youtubeHandle}?sub_confirmation=1`}
        target="_blank"
        rel="noopener noreferrer"
      >
        🔔 Ativar o sininho
      </a>
      {albumId && (
        <Link className="bj" href={`/galeria/${albumId}`}>
          📷 Ver fotos
        </Link>
      )}
    </div>
  );
}
