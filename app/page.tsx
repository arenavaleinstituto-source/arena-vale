'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface JogoInfo {
  status: string;
  horario: string;
  time1: string;
  time2: string;
  info: string;
}

const listaJogos: JogoInfo[] = [
  {
    status: 'AO VIVO',
    horario: 'HOJE · 19:30',
    time1: 'FÊNIX CLUB',
    time2: 'VALE UNITED',
    info: 'GINÁSIO PRINCIPAL'
  },
  {
    status: 'EM BREVE',
    horario: 'HOJE · 21:00',
    time1: 'ARENA FC',
    time2: 'BLUMENAU 7',
    info: 'QUADRA 02'
  },
  {
    status: 'AGENDADA',
    horario: 'AMANHÃ · 18:00',
    time1: 'ESTRELA AZUL',
    time2: 'LIONS SC',
    info: 'ARENA VALE'
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-arena-vale.png"
                alt="Arena Vale - O Palco do Esporte é Aqui"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

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
            <Link href="/coordenador/atletasdestaques" className="transition hover:text-white">
              Histórias
            </Link>
            <Link href="/inscricao" className="transition hover:text-white">
              Inscrição
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
                      <p className="font-black text-white
