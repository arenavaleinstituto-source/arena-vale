'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  youtubeId: string;
  titulo: string;
  formato: 'widescreen' | 'shorts';
}

const VIDEOS_PADRAO: VideoItem[] = [
  {
    id: 'default-1',
    youtubeId: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem · TV Arena Vale',
    formato: 'widescreen'
  }
];

export default function TVArenaValePage() {
  const [videos, setVideos] = useState<VideoItem[]>(VIDEOS_PADRAO);
  const [filtroFormato, setFiltroFormato] = useState('TODOS');

  useEffect(() => {
    try {
      const v = localStorage.getItem('arenavale_videos');
      if (v) setVideos(JSON.parse(v));
    } catch {
      // Fallback
    }
  }, []);

  const videosFiltrados = filtroFormato === 'TODOS' 
    ? videos 
    : videos.filter(v => v.formato === filtroFormato.toLowerCase());

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4"><span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> SINAL ABERTO · BROADCAST</span>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white">CATÁLOGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">TV ARENA VALE</span></h1>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['TODOS', 'WIDESCREEN', 'SHORTS'].map((fmt) => (
            <button key={fmt} type="button" onClick={() => setFiltroFormato(fmt)} className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition ${filtroFormato === fmt ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30' : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'}`}>{fmt}</button>
          ))}
        </div>

        {videosFiltrados.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videosFiltrados.map((v) => (
              <div key={v.id} className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all hover:-translate-y-2 hover:border-[#e50914]/70">
                <div className={`relative ${v.formato === 'shorts' ? 'aspect-[9/16] max-h-96' : 'aspect-video'} w-full overflow-hidden bg-black flex items-center justify-center`}>
                  <iframe className={`${v.formato === 'widescreen' ? 'h-[140%] w-[140%] max-w-none' : 'h-full w-full'}`} src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=0&controls=1&modestbranding=1&rel=0`} title={v.titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 bg-gradient-to-t from-[#07080c] to-[#0c0f17]">
                  <h4 className="text-lg font-black italic uppercase text-white leading-snug">{v.titulo}</h4>
                  <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noreferrer" className="mt-4 font-black uppercase tracking-wider text-[#e50914]">Ver no YouTube ↗</a>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#11141d] p-12 text-center max-w-xl mx-auto shadow-2xl">
            <h3 className="text-xl font-black uppercase text-white">Nenhum vídeo encontrado</h3>
          </div>
        )}
      </main>
    </div>
  );
}
