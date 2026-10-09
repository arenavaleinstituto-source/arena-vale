'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO OFICIAL COM GATILHO MASTER E DROPDOWN DE PAINÉIS */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO: CLIQUE NO EMBLEMA [AV] LEVA AO PAINEL DO PROPRIETÁRIO */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/proprietario"
              title="Acesso Seguro"
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

          {/* NAVEGAÇÃO CENTRAL (DESKTOP) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#cad0e0]">
            <Link href="/#aovivo" className="hover:text-[#e50914] transition">Ao Vivo</Link>
            <Link href="/#campeonatos" className="hover:text-[#e50914] transition">Campeonatos</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-[#e50914] transition">Atletas</Link>
            <Link href="/inscricao" className="hover:text-[#e50914] transition">Inscrições</Link>
          </nav>

          {/* BOTÕES DE AÇÃO: MENU PAINEL + INSCRIÇÃO */}
          <div className="flex items-center gap-3">
            {/* BOTÃO DROPDOWN 'PAINEL' */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuPainelAberto(!menuPainelAberto)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-[#e50914] hover:bg-white/10"
              >
                <span>Painel</span>
                <span className="text-[10px] text-[#8a92a6]">▾</span>
              </button>

              {/* MENU SUSPENSO COM OS 3 NÍVEIS */}
              {menuPainelAberto && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-[#13161f] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in"
                  onMouseLeave={() => setMenuPainelAberto(false)}
                >
                  <Link
                    href="/coordenador"
                    onClick={() => setMenuPainelAberto(false)}
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
                    href="/moderador"
                    onClick={() => setMenuPainelAberto(false)}
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
                    href="/capitao"
                    onClick={() => setMenuPainelAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-base">
                      ⚽
                    </span>
                    <div>
                      <p className="font-black text-white">Capitão</p>
                      <p className="text-[10px] text-[#8a92a6]">Elenco & Escalações</p>
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

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#13161f] via-[#0b0d12] to-[#0b0d12] px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-7xl text-center">
            <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#e50914] mb-6">
              TEMPORADA REGIONAL 2026
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight text-white max-w-5xl mx-auto">
              O ESPORTE DO VALE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] via-red-500 to-amber-500">
                AO VIVO & EM DESTAQUE
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#cad0e0] max-w-2xl mx-auto leading-relaxed">
              Plataforma oficial de torneios, cobertura em tempo real, fichas técnicas e revelação dos novos talentos esportivos.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#aovivo"
                className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] transition"
              >
                Assistir Transmissões ▶
              </Link>
              <Link
                href="/inscricao"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:border-white/40 hover:bg-white/10 transition"
              >
                Formulário de Inscrição ↗
              </Link>
            </div>
          </div>
        </section>

        {/* TRANSMISSÕES AO VIVO */}
        <section id="aovivo" className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">TV ARENA VALE</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">Transmissão em Destaque</h2>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/30 px-3 py-1 text-xs font-black text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> AO VIVO
            </span>
          </div>

          <div className="relative aspect-video w-full rounded-[2.5rem] border border-white/10 bg-[#161a24] overflow-hidden shadow-2xl flex items-center justify-center text-center p-6">
            <div className="space-y-4 max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e50914]/20 text-[#e50914] text-2xl">
                ▶
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase text-white">Canal Oficial TV Arena Vale</h3>
              <p className="text-xs text-[#8a92a6]">
                Transmissões de finais, jogos da rodada e coberturas exclusivas dos campeonatos regionais.
              </p>
            </div>
          </div>
        </section>

        {/* CAMPEONATOS & TABELAS */}
        <section id="campeonatos" className="mx-auto max-w-7xl px-6 py-16 border-t border-white/10">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">COMPETIÇÕES</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">Modalidades em Disputa</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { mod: 'Futsal Regional', status: 'Fase de Grupos', partidas: '12 Jogos Restantes' },
              { mod: 'Voleibol Vale Cup', status: 'Oitavas de Final', partidas: '8 Jogos Restantes' },
              { mod: 'Basquetebol Open', status: 'Classificatória', partidas: '6 Jogos Restantes' },
              { mod: 'Futebol 7 Intermunicipal', status: 'Semifinais', partidas: '4 Jogos Restantes' }
            ].map((camp, idx) => (
              <div key={idx} className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
                <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                  ATIVO
                </span>
                <h3 className="mt-4 text-lg font-black uppercase text-white">{camp.mod}</h3>
                <p className="text-xs text-emerald-400 font-bold mt-1">{camp.status}</p>
                <p className="text-xs text-[#8a92a6] mt-3 border-t border-white/5 pt-3">{camp.partidas}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row text-xs text-[#8a92a6]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white">ARENA <span className="text-[#e50914]">VALE</span></span>
            <span>· © 2026 Todos os direitos reservados</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#aovivo" className="hover:text-white transition">TV Arena</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white transition">Galeria</Link>
            <Link href="/inscricao" className="hover:text-white transition">Inscrição</Link>
            <Link href="/login" className="hover:text-white transition">Área Restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
