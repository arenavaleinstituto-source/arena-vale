'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);

  return (
    <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo 02.png" alt="Arena Vale" className="h-10 w-auto object-contain rounded-lg mix-blend-lighten" />
          <span className="text-sm font-black uppercase tracking-widest text-white hidden sm:inline">ARENA VALE</span>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#b8c0d4]">
          <Link href="/" className="hover:text-white transition">Início</Link>
          <Link href="/tv" className="hover:text-white transition">TV Arena Vale</Link>
          <Link href="/campeonatos" className="hover:text-white transition">Campeonatos</Link>
          <Link href="/atletasdestaques" className="hover:text-white transition">Atletas</Link>
          <Link href="/projetosocial" className="hover:text-white transition">Projeto Social</Link>
          <Link href="/agenda" className="hover:text-white transition">Agenda</Link>
        </nav>

        {/* BOTÕES DE AÇÃO (ANUNCIE E PAINEL COM DROPDOWN HIERÁRQUICO) */}
        <div className="flex items-center gap-4 relative">
          <Link 
            href="/patrocinio" 
            className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
          >
            Anuncie
          </Link>

          {/* BOTÃO PAINEL */}
          <div className="relative">
            <button
              onClick={() => setMenuPainelAberto(!menuPainelAberto)}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition"
            >
              Painel
              <span className={`transform transition-transform duration-200 ${menuPainelAberto ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* MENU SUSPENSO COM OS 4 NÍVEIS HIERÁRQUICOS (CFG6) */}
            {menuPainelAberto && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/15 bg-[#11141d] p-3 shadow-2xl z-50 space-y-2 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f] block">ACESSO RESTRITO · CFG6</span>
                  <span className="text-[11px] text-[#8a92a6]">Selecione o seu nível</span>
                </div>

                <Link 
                  href="/login" 
                  onClick={() => setMenuPainelAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#e50914] to-[#ff1e27] hover:opacity-90 transition shadow-md shadow-[#e50914]/30"
                >
                  <span>⭐ Painel do Proprietário</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuPainelAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                >
                  <span>🛡️ Coordenadores</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuPainelAberto(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                >
                  <span>📋 Moderador de Time</span>
                  <span>→</span>
                </Link>

                <Link 
                  href="/login" 
                  onClick={() => setMenuPainelAberto(false)}
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
