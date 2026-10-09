'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO COM GATILHO RESTRITO NO LOGÓTIPO E MENU DE PAINÉIS */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGÓTIPO: CLIQUE NO EMBLEMA [AV] ENTRA NO PAINEL DO PROPRIETÁRIO */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/proprietario"
              title="Acesso Administrativo"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914] cursor-pointer"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </Link>

            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          {/* MENU SUSPENSO 'PAINEL' COM OS 3 NÍVEIS */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAberto(!menuAberto)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-[#e50914] hover:bg-white/10"
              >
                <span>Painel</span>
                <span className="text-[10px] text-[#8a92a6]">▾</span>
              </button>

              {menuAberto && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-[#13161f] p-2 shadow-2xl backdrop-blur-xl z-50"
                  onMouseLeave={() => setMenuAberto(false)}
                >
                  <Link
                    href="/coordenador"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e50914]/15 text-[#e50914] text-base">
                      🛡️
                    </span>
                    <div>
                      <p className="font-black text-white">Coordenador</p>
                      <p className="text-[10px] text-[#8a92a6]">Gestão Operacional</p>
                    </div>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 text-base">
                      ⚖️
                    </span>
                    <div>
                      <p className="font-black text-white">Moderador</p>
                      <p className="text-[10px] text-[#8a92a6]">Torneios & Placares</p>
                    </div>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-base">
                      ⚽
                    </span>
                    <div>
                      <p className="font-black text-white">Capitão</p>
                      <p className="text-[10px] text-[#8a92a6]">Equipas & Elencos</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/inscricao"
              className="rounded-full bg-[#e50914] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 hover:bg-[#ff1e27] transition"
            >
              Inscrever Atleta
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CORPO PRINCIPAL */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#13161f] via-[#0b0d12] to-[#0b0d12] px-6 py-20 lg:py-28 text-center">
          <div className="mx-auto max-w-5xl">
            <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#e50914] mb-6">
              TEMPORADA REGIONAL 2026
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight text-white">
              O DESPORTO DO VALE <br />
              <span className="text-[#e50914]">AO VIVO & EM DESTAQUE</span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-[#cad0e0] max-w-2xl mx-auto leading-relaxed">
              Plataforma oficial de competições regionais, transmissão de partidas em direto, acompanhamento de classificações e divulgação de novos talentos.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/coordenador/atletasdestaques"
                className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] transition"
              >
                Ver Galeria de Atletas →
              </Link>
              <Link
                href="/inscricao"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:border-white/40 transition"
              >
                Formulário de Inscrição ↗
              </Link>
            </div>
          </div>
        </section>

        {/* MODALIDADES */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">COMPETIÇÕES</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">Modalidades Oficiais</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { nome: 'Futsal Regional', fase: 'Fase de Grupos' },
              { nome: 'Voleibol Vale Cup', fase: 'Oitavos de Final' },
              { nome: 'Basquetebol Open', fase: 'Classificatórias' },
              { nome: 'Futebol 7 Intermunicipal', fase: 'Semifinais' }
            ].map((m, idx) => (
              <div key={idx} className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
                <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#e50914]">
                  EM ANDAMENTO
                </span>
                <h3 className="mt-4 text-lg font-black uppercase text-white">{m.nome}</h3>
                <p className="text-xs text-emerald-400 font-bold mt-1">{m.fase}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>© 2026 Arena Vale · Plataforma Oficial</div>
          <div className="flex items-center gap-4">
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Atletas</Link>
            <Link href="/inscricao" className="hover:text-white">Inscrição</Link>
            <Link href="/login" className="hover:text-white">Área Restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
