import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link'; // AQUI ESTÁ A IMPORTAÇÃO QUE RESOLVE O ERRO GLOBAL
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena Vale Sports',
  description: 'Plataforma de gestão de campeonatos e transmissões desportivas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#070b13] text-white font-sans antialiased min-h-screen flex flex-col">
        
        {/* CABEÇALHO CENTRALIZADO (max-w-5xl aproxima os elementos) */}
        <header className="w-full bg-[#070b13] py-4 border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            
            {/* 1. LOGO */}
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Arena Vale" className="h-10" />
            </div>

            {/* 2. MENU CENTRAL */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase text-slate-300">
              <Link href="/" className="hover:text-amber-400 transition">Início</Link>
              <Link href="/tv" className="hover:text-amber-400 transition flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> TV Arena Vale
              </Link>
              <Link href="/noticias" className="hover:text-amber-400 transition">Notícias</Link>
              <Link href="/agenda" className="hover:text-amber-400 transition">Agenda</Link>
              <Link href="/campeonatos" className="hover:text-amber-400 transition">Campeonatos</Link>
              {/* Link exato para a pasta do projeto social */}
              <Link href="/projetosocial" className="hover:text-amber-400 transition">Projeto Social</Link>
            </nav>

            {/* 3. BOTÕES */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/anuncie" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-full transition">
                ANUNCIE
              </Link>
              <Link href="/login" className="px-4 py-2 bg-transparent hover:bg-amber-500/10 border border-amber-500 text-amber-500 text-xs font-bold rounded-full flex items-center gap-2 transition">
                🔒 PORTAIS ▾
              </Link>
            </div>

          </div>
        </header>

        {/* CONTEÚDO DINÂMICO DAS PÁGINAS */}
        <main className="flex-grow">
          {children}
        </main>

      </body>
    </html>
  );
}
