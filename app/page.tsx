import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-white flex flex-col font-sans">
      
      {/* CABEÇALHO ÚNICO CENTRALIZADO (Logo e botões aproximados) */}
      <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4">
          
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-black text-xl tracking-wider text-amber-400">
              ARENA VALE
            </span>
          </Link>

          {/* 2. MENU CENTRAL */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase text-slate-200">
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

          {/* 3. BOTÕES (ANUNCIE E PORTAIS) */}
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

      {/* DESTAQUE PRINCIPAL (HERO) */}
      <main className="flex-grow">
        <section className="relative w-full max-w-6xl mx-auto mt-8 px-4">
          <div className="relative bg-[#0a1120] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl p-8 md:p-16 lg:p-20">
            <div className="max-w-2xl space-y-6">
              <span className="inline-block py-1.5 px-4 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold tracking-widest uppercase">
                Cobertura & Transmissão Oficial
              </span>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase">
                O Palco do <span className="text-amber-400">Esporte</span> é Aqui.
              </h1>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">
                Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href="/tv"
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#070b13] font-black uppercase text-xs tracking-wider rounded-full transition text-center"
                >
                  ▶ Transmissões
                </Link>
                <Link
                  href="/painel/campeonatos"
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold uppercase text-xs tracking-wider rounded-full transition text-center"
                >
                  Ver Campeonatos →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
