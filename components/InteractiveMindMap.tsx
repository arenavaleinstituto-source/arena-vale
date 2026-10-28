'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07080c]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src="/logo 02.png" alt="Arena Vale" className="h-8 sm:h-10 w-auto object-contain rounded-lg mix-blend-lighten" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white hidden sm:inline">ARENA VALE</span>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL (DESKTOP) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-black uppercase tracking-wider text-[#b8c0d4]">
          <Link href="/" className="hover:text-white transition">Início</Link>
          <Link href="/tv" className="hover:text-white transition">TV Arena Vale</Link>
          <Link href="/campeonatos" className="hover:text-white transition">Campeonatos</Link>
          <Link href="/atletasdestaques" className="hover:text-white transition">Atletas</Link>
          <Link href="/projetosocial" className="hover:text-white transition">Projeto Social</Link>
          <Link href="/agenda" className="hover:text-white transition">Agenda</Link>
        </nav>

        {/* BOTÕES DE AÇÃO E MENU HIERÁRQUICO */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          <Link 
            href="/patrocinio" 
            className="rounded-full bg-[#e50914] px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
          >
            Anuncie
          </Link>

          {/* BOTÃO PAINEL COM DROPDOWN HIERÁRQUICO */}
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition"
            >
              Painel
              <span className={`transform transition-transform duration-200 text-[10px] ${menuAberto ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {menuAberto && (
              <div className="absolute right-0 mt-3 w-64 sm:w-72 rounded-2xl border border-white/15 bg-[#11141d] p-3 shadow-2xl z-50 space-y-2 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f] block">HIERARQUIA · CFG6</span>
                  <span className="text-[11px] text-[#8a92a6]">Selecione o painel de acesso</span>
                </div>

                <Link 
                  href="/login" 
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#e50914] to-[#ff1e27] hover:opacity-90 transition shadow-md shadow-[#e50914]/30"
                >
                  <span>⭐ Painel do Proprietário</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                >
                  <span>🛡️ Coordenadores</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                >
                  <span>📋 Moderador de Time</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                >
                  <span>⚡ Capitão de Equipe</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
