'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface JogoItem {
  id: string;
  dataHora: string;
  equipeA: string;
  equipeB: string;
  modalidade: string;
  local: string;
  status: string;
}

export default function AgendaCompletaPage() {
  const [jogos, setJogos] = useState<JogoItem[]>([]);
  const [filtroModalidade, setFiltroModalidade] = useState('TODAS');

  useEffect(() => {
    try {
      const j = localStorage.getItem('arenavale_agenda');
      if (j) {
        setJogos(JSON.parse(j));
      }
    } catch {
      // Fallback vazio
    }
  }, []);

  const jogosFiltrados = filtroModalidade === 'TODAS' 
    ? jogos 
    : jogos.filter(j => j.modalidade.toUpperCase().includes(filtroModalidade));

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
      {/* HEADER SIMPLIFICADO DE NAVEGAÇÃO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      {/* CONTEÚDO DA AGENDA */}
      <main className="mx-auto max-w-7xl px-6 py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4">
            CALENDÁRIO OFICIAL 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white">
            AGENDA COMPLETA DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">JOGOS</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] uppercase">
            ACOMPANHE TODOS OS CONFRONTOs, HORÁRIOS, LOCAIS E TRANSMISSÕES EM DIRETO DA TEMPORADA.
          </p>
        </div>

        {/* FILTROS DE MODALIDADE */}
        <div className="flex flex-wrap justify-center gap-3">
          {['TODAS', 'FUTSAL', 'FUTEBOL 7', 'BASQUETEBOL', 'VOLEIBOL'].map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setFiltroModalidade(mod)}
              className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                filtroModalidade === mod
                  ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                  : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* LISTA DE JOGOS */}
        {jogosFiltrados.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {jogosFiltrados.map((jogo) => (
              <div
                key={jogo.id}
                className="group relative min-h-[360px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0f17] p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70"
              >
                <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
                <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
                <span className="pointer-events-none select-none absolute -right-3 top-10 text-7xl font-black italic uppercase tracking-tighter text-white/[0.04]">
                  MATCH
                </span>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-block -skew-x-12 bg-amber-500 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      <span className="inline-block skew-x-12">{jogo.modalidade}</span>
                    </span>
                    <span className="text-xs font-mono font-black text-[#cad0e0]">📅 {jogo.dataHora}</span>
                  </div>
                  <div className="my-6 text-center">
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tight group-hover:text-[#ff2a35] transition-colors">
                      {jogo.equipeA}
                    </h3>
                    <div className="my-2 inline-flex items-center justify-center rounded-full bg-[#e50914]/20 border border-[#e50914]/50 px-4 py-1 text-xs font-black italic text-[#ff4b52]">
                      VS
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tight group-hover:text-[#ff2a35] transition-colors">
                      {jogo.equipeB}
                    </h3>
                  </div>
                  <p className="text-xs text-center font-bold text-[#8a92a6] uppercase tracking-widest mt-4">
                    📍 {jogo.local}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="rounded bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/30">
                    {jogo.status}
                  </span>
                  <Link href="/#aovivo" className="text-xs font-black uppercase tracking-wider text-white hover:text-[#e50914] transition">
                    Ver Transmissão ↗
                  </Link>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#11141d] p-12 text-center max-w-xl mx-auto shadow-2xl">
            <h3 className="text-xl font-black uppercase text-white">Nenhum jogo encontrado para esta categoria</h3>
            <p className="mt-2 text-xs text-[#8a92a6]">Tente selecionar outra modalidade ou consulte o painel de coordenação para novos lançamentos na agenda.</p>
          </div>
        )}
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] px-6 py-12 mt-20 text-center">
        <p className="text-xs text-[#555d6e]">© 2026 Arena Vale · Calendário Oficial Desportivo.</p>
      </footer>
    </div>
  );
}