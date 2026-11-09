'use client';

import { useState } from 'react';
import { ROTULO_PLATAFORMA, type ItemVideo } from '@/components/home/UltimosVideos';
import { formatarDiaMes } from '@/lib/midia/datas';

const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'youtube', rotulo: 'YouTube' },
  { id: 'instagram', rotulo: 'Instagram' },
] as const;

/** Grade de vídeos com o filtro "Todos / YouTube / Instagram" (spec Fase 3, seção 9). */
export function FiltroVideos({ videos }: { videos: ItemVideo[] }) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['id']>('todos');
  const lista = filtro === 'todos' ? videos : videos.filter((v) => v.plataforma === filtro);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`rounded-full border px-5 py-2 font-rotulo text-sm font-bold uppercase tracking-wider ${
              filtro === f.id ? 'border-av-vermelho bg-av-vermelho text-white' : 'border-av-linha text-av-cinza hover:text-white'
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>
      {lista.length === 0 ? (
        <p className="vazio">Nenhum vídeo por aqui ainda.</p>
      ) : (
        <div className="videos">
          {lista.map((v) => (
            <a key={v.id} href={v.link} className="video" target="_blank" rel="noopener noreferrer">
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element -- capas do YouTube/Instagram */}
                <img src={v.capa} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <span className="yt">
                {ROTULO_PLATAFORMA[v.plataforma]} · {formatarDiaMes(v.data)}
              </span>
              <h3>{v.titulo}</h3>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
