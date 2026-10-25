'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MenuPainelDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* BOTÃO PRINCIPAL "PAINEL" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition shadow-lg"
      >
        PAINEL
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* MENU SUSPENSO DOS 4 NÍVEIS HIERÁRQUICOS */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-[#11141d] p-3 shadow-2xl z-50 space-y-2 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f] block">SELECIONE O ACESSO · CFG6</span>
            <span className="text-[11px] text-[#8a92a6]">Hierarquia Autorizada</span>
          </div>

          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#e50914] to-[#ff1e27] hover:opacity-90 transition shadow-md shadow-[#e50914]/30"
          >
            <span>⭐ Painel do Proprietário</span>
            <span>→</span>
          </Link>

          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
          >
            <span>🛡️ Coordenadores (Ouro)</span>
            <span>→</span>
          </Link>

          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
          >
            <span>📋 Moderador de Time</span>
            <span>→</span>
          </Link>

          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
          >
            <span>⚡ Capitão de Equipe</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
