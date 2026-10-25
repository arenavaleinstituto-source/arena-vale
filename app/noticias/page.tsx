'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicNoticiasPage() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchNoticias = async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNoticias(data);
      }
      setLoading(false);
    };

    fetchNoticias();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#e50914] selection:text-white font-sans">
      
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center shrink-0">
            <Link href="/" title="Início" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e50914]/30 via-white/10 to-transparent opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />
              <img src="/logo.png" alt="Arena Vale Oficial" className="relative h-12 sm:h-16 w-auto object-contain rounded-xl mix-blend-lighten contrast-110 drop-shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
            </Link>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-[#e50914] hover:bg-white/10 whitespace-nowrap">
              ← VOLTAR À HOME
            </Link>
          </div>
        </div>
      </header>

      {/* TÍTULO DO MURAL */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
              <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">ARENA VALE · PORTAL</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
              COMUNICADOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">OFICIAIS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-end">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">TEMPORADA 2026</span>
            <span className="h-2 w-2 rounded-full bg-[#e50914]" />
          </div>
        </div>
      </section>

      {/* GRELHA DE NOTÍCIAS */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-[#e50914] text-sm font-black uppercase tracking-widest animate-pulse">
              A carregar base de dados...
            </div>
          </div>
        ) : noticias.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-16 text-center shadow-2xl">
             <p className="text-gray-400 font-bold uppercase tracking-wider">Ainda não há comunicados publicados.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((nota) => (
              <article key={nota.id} className="group relative min-h-[460px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70">
                
                {/* Imagem de Fundo */}
                <img 
                  src={nota.imagem_url || '/fundo-arena.jpg'} 
                  alt={nota.titulo} 
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:opacity-55 group-hover:mix-blend-normal" 
                />
                
                {/* Gradientes */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/15 via-transparent to-black/80 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Texto de Fundo */}
                <span className="pointer-events-none select-none absolute -right-3 top-10 text-7xl font-black italic uppercase tracking-tighter text-white/[0.03] transition-transform duration-500 group-hover:-translate-x-3 whitespace-nowrap">
                  {nota.categoria}
                </span>
                
                {/* Cantos Estilizados */}
                <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
                <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
                
                {/* Cabeçalho do Card */}
                <div className="relative z-10 p-6 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block -skew-x-12 bg-[#e50914] px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]">
                      <span className="inline-block skew-x-12">{nota.categoria}</span>
                    </span>
                    {nota.selo && (
                      <span className="inline-block -skew-x-12 border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#cad0e0]">
                        <span className="inline-block skew-x-12">{nota.selo}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Conteúdo Principal */}
                <div className="relative z-10 p-6 pt-0 mt-auto">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1 w-8 bg-[#e50914] transition-all duration-300 group-hover:w-14" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">
                      {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-[26px] font-black italic uppercase leading-[1.08] tracking-tight text-white drop-shadow-md group-hover:text-[#e50914] transition-colors">
                    {nota.titulo}
                  </h3>
                  
                  <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 font-medium">
                    {nota.conteudo}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <button className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-[#e50914] transition">
                      <span>LER COMUNICADO</span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] group-hover:bg-[#e50914] group-hover:text-white group-hover:translate-x-1 transition-all">↗</span>
                    </button>
                  </div>
                </div>
                
                {/* Linha de Base */}
                <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
              </article>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
