'use client';

import React from 'react';
import Link from 'next/link';

export default function Nav() {
  return (
    <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* LOGÓTIPO */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-black text-xl tracking-wider text-amber-400">
            ARENA VALE
          </span>
        </Link>

        {/* MENU CENTRAL */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase text-slate-200">
          <Link href="/" className="hover:text-amber-400 transition">Início</Link>
          <Link href="/tv" className="hover:text-amber-400 transition flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            TV Arena Vale
          </Link>
          <Link href="/noticias" className="hover:text-amber-400 transition">Notícias</Link>
          <Link href="/agenda" className="hover:text-amber-400 transition">Agenda</Link>
          <Link href="/painel/campeonatos" className="hover:text-amber-400 transition">Campeonatos</Link>
          <Link href="/atletasdestaques" className="hover:text-amber-400 transition">Atletas Destaque</Link>
          <Link href="/projetosocial" className="hover:text-amber-400 transition text-amber-300">
            Projeto Social
          </Link>
        </nav>

        {/* BOTÕES */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/patrocinio"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#070b13] text-xs font-extrabold rounded-full transition"
          >
            ANUNCIE
          </Link>
          <Link
            href="/painel"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-400/50 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1.5 transition"
          >
            🔒 PORTAIS ▾
          </Link>
        </div>

      </div>
    </header>
  );
}
