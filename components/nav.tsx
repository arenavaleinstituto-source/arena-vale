'use client';

import React from 'react';
import Link from 'next/link';

export default function Nav() {
  return (
    <header className="w-full bg-[#0b0b0c] py-4 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* LOGÓTIPO */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-black text-xl tracking-wider text-[#ff3b44]">
            ARENA VALE
          </span>
        </Link>

        {/* MENU CENTRAL */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase text-zinc-200">
          <Link href="/" className="hover:text-[#ff3b44] transition">Início</Link>
          <Link href="/tv" className="hover:text-[#ff3b44] transition flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            TV Arena Vale
          </Link>
          <Link href="/noticias" className="hover:text-[#ff3b44] transition">Notícias</Link>
          <Link href="/agenda" className="hover:text-[#ff3b44] transition">Agenda</Link>
          {/* BUG CORRIGIDO: apontava para /painel/campeonatos (área
              administrativa) em vez da página pública de campeonatos. */}
          <Link href="/campeonatos" className="hover:text-[#ff3b44] transition">Campeonatos</Link>
          <Link href="/atletasdestaques" className="hover:text-[#ff3b44] transition">Atletas Destaque</Link>
          <Link href="/projetosocial" className="hover:text-[#ff3b44] transition text-[#ff3b44]">
            Projeto Social
          </Link>
        </nav>

        {/* BOTÕES */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/patrocinio"
            className="px-4 py-2 bg-[#e50914] hover:bg-[#e50914] text-[#0b0b0c] text-xs font-extrabold rounded-full transition"
          >
            ANUNCIE
          </Link>
          <Link
            href="/painel"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#e50914]/50 text-[#ff3b44] text-xs font-bold rounded-full flex items-center gap-1.5 transition"
          >
            🔒 PORTAIS ▾
          </Link>
        </div>

      </div>
    </header>
  );
}

/**
 * Export nomeado, além do default.
 *
 * As páginas /capitao e /moderador faziam `import { Nav } from
 * '@/components/nav'` — mas o componente só tinha export default. O
 * webpackNext avisava "Attempted import error: 'Nav' is not exported" e
 * a navegação dessas duas telas ficava quebrada.
 */
export { Nav };
