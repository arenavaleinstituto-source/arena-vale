'use client';

import { useCallback, useRef, useState } from 'react';
import { Fileira } from '@/components/midia/Fileira';
import { PlayerCorte } from '@/components/midia/PlayerCorte';
import type { VideoYT } from '@/lib/midia/youtube';

/** Home: fileira de cortes (Shorts do canal) que abrem num player vertical. */
export function Cortes({ cortes }: { cortes: VideoYT[] }) {
  const [aberto, setAberto] = useState<VideoYT | null>(null);
  const origem = useRef<HTMLButtonElement | null>(null);

  const fechar = useCallback(() => {
    setAberto(null);
    origem.current?.focus();
  }, []);

  if (cortes.length === 0) return null;
  return (
    <section className="faixa" id="cortes">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Cortes</h2>
            <p>Os melhores lances em vídeos curtos.</p>
          </div>
        </div>
        <Fileira rotulo="cortes">
          {cortes.map((c) => (
            <button
              key={c.id}
              type="button"
              className="corte"
              onClick={(e) => {
                origem.current = e.currentTarget;
                setAberto(c);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.capa} alt="" loading="lazy" />
              <span className="play" aria-hidden="true">▶</span>
              <span className="nome">{c.titulo}</span>
            </button>
          ))}
        </Fileira>
      </div>
      {aberto && <PlayerCorte video={aberto} aoFechar={fechar} />}
    </section>
  );
}
