'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl w-full px-6 py-20 text-center flex-grow flex flex-col items-center justify-center">
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-10 sm:p-14 shadow-2xl relative overflow-hidden w-full">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />
          
          <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff2a35] mb-4">ERRO 404 · PÁGINA NÃO ENCONTRADA</span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">Ops! Página Indisponível</h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] mt-4 uppercase leading-relaxed">A página que procura não existe, foi removida ou o endereço foi inserido incorretamente.</p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30">
              Voltar à Página Inicial ↗
            </Link>
            <Link href="/tv" className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition">
              Ver TV Arena Vale
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**. Todos os direitos reservados.
      </footer>
    </div>
  );
}
