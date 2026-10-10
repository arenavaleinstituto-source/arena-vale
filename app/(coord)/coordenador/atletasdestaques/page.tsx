import React from 'react';
import Link from 'next/link';
import GestaoAtletasClient from './gestao-atletas-client';

export const metadata = {
  title: 'Atletas em Destaque | Arena Vale',
  description: 'Gestão editorial e aprovação de atletas da Arena Vale'
};

export default function AtletasDestaquesPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/coordenador"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914]"
              title="Voltar ao Painel Geral"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </Link>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/coordenador"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
            >
              ← Painel Coordenador
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        <div className="rounded-[2.5rem] border border-white/10 bg-[#161a24] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            MODERAÇÃO EDITORIAL
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            GALERIA DE ATLETAS <br />
            <span className="text-[#e50914]">EM DESTAQUE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Aprovação, curadoria e homologação de talentos para exibição na montra da página principal do portal Arena Vale.
          </p>
        </div>

        <GestaoAtletasClient />
      </main>

      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>© 2026 Arena Vale · Sistema de Gestão Interna</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador" className="hover:text-white">Painel Geral</Link>
            <Link href="/login" className="hover:text-white">Sair</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
