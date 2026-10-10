'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface JogoItem {
  status: string;
  horario: string;
  time1: string;
  time2: string;
}

const listaJogos: JogoItem[] = [
  {
    status: 'AO VIVO',
    horario: 'HOJE · 19:30',
    time1: 'FÊNIX CLUB',
    time2: 'VALE UNITED'
  },
  {
    status: 'EM BREVE',
    horario: 'HOJE · 21:00',
    time1: 'ARENA FC',
    time2: 'BLUMENAU 7'
  },
  {
    status: 'AGENDADA',
    horario: 'AMANHÃ · 18:00',
    time1: 'ESTRELA AZUL',
    time2: 'LIONS SC'
  }
];

const noticias = [
  {
    titulo: 'LIGA REGIONAL DE FUTSAL',
    descricao: 'Confira a análise técnica da rodada e os melhores momentos.',
    categoria: 'GIRO DA ARENA',
    tag: 'ANÁLISE'
  },
  {
    titulo: 'SUPERCOPA VALE 2026',
    descricao: 'Grandes jogadas e os bastidores das semifinais eletrizantes.',
    categoria: 'PÓS-JOGO ARENA',
    tag: 'HIGHLIGHTS'
  },
  {
    titulo: 'FORMAÇÃO E NOVOS TALENTOS',
    descricao: 'Conheça os jovens que estão se destacando nas categorias de base.',
    categoria: 'ARENA BASE',
    tag: 'HISTÓRIAS'
  }
];

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);

  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/proprietario"
              title="Acesso Seguro"
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914] cursor-pointer"
            >
              <span className="text-base sm:text-lg font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </Link>

            <Link href="/" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          {/* MENU SUPERIOR ATUALIZADO */}
          <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-wider text-[#a0a8be] lg:flex">
            <Link href="#inicio" className="text-white transition hover:text-[#e50914]">
              Início
            </Link>
            <Link href="#aovivo" className="flex items-center gap-1.5 text-white transition hover:text-[#e50914]">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse" />
              Ao Vivo
            </Link>
            <Link href="#noticias" className="transition hover:text-white">
              Notícias
            </Link>
            <Link href="#agenda" className="transition hover:text-white">
              Agenda
            </Link>
            <Link href="#campeonatos" className="transition hover:text-white">
              Campeonatos
            </Link>
            <Link href="/coordenador/atletasdestaques" className="transition hover:text-white">
              Atletas Destaques
            </Link>
            <Link href="#projetosocial" className="transition hover:text-white">
              Projeto Social
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5547988444404"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-105"
            >
              Anuncie
            </a>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuPainelAberto(!menuPainelAberto)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-[#a0a8be] transition hover:border-white/40 hover:text-white"
              >
                <span>Painel</span>
                <span className="text-[10px]">▾</span>
              </button>

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
                    href="/login"
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
                    href="/login"
                    onClick={() => setMenuPainelAberto(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-base">
                      ⚽
                    </span>
                    <div>
                      <p className="font-black text-white">Capitão</p>
                      <p className="text-[10px] text-[#8a92a6]">Equipes & Elencos</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL */}
      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[580px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          <img
            src="/foto-pro-site-1.png"
            alt="Arena Vale - O Palco do Esporte é Aqui"
            className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
              COBERTURA & TRANSMISSÃO OFICIAL
            </div>

            {/* FRASE EM 2 LINHAS COM 'ESPORTE' A VERMELHO */}
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
              <span className="block whitespace-nowrap">
                O PALCO DO <span className="text-[#e50914]">ESPORTE</span>
              </span>
              <span className="block whitespace-nowrap mt-2">
                É AQUI.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
              Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#aovivo"
                className="flex items-center gap-2 rounded-full bg-[#e50914] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105"
              >
                <span>▶</span> ASSISTIR AO VIVO
              </a>

              <a
                href="#agenda"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40"
              >
                VER A AGENDA →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSMISSÕES AO VIVO */}
      <section id="aovivo" className="border-t border-white/5 bg-[#10131a] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
                TRANSMISSÕES OFICIAIS
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                ARENA VALE AO VIVO
              </h2>
            </div>
            <a
              href="https://www.youtube.com/@TVArenaVale"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#e50914] hover:border-[#e50914]"
            >
              Canal no YouTube ↗
            </a>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#161a24] p-6 lg:col-span-2 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-3 py-1 text-xs font-black tracking-wider text-white">
                  ● AO VIVO AGORA
                </span>
                <span className="text-xs font-bold text-[#8a92a6]">COPA ARENA VALE 2026</span>
              </div>

              <div className="my-8 flex items-center justify-around text-center">
                <div className="flex-1">
                  <b className="block text-2xl
