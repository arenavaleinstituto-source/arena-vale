'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const games = [
  ['AO VIVO', 'HOJE · 19:30', 'FÊNIX CLUB', 'VALE UNITED', 'TRANSMISSÃO AO VIVO', 'GINÁSIO PRINCIPAL'],
  ['EM BREVE', 'HOJE · 21:00', 'ARENA FC', 'BLUMENAU 7', 'COBERTURA COMPLETA', 'QUADRA 02'],
  ['AGENDADA', 'AMANHÃ · 18:00', 'ESTRELA AZUL', 'LIONS SC', 'PRÉ-JOGO ÀS 17:30', 'ARENA VALE']
];

const highlights = [
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
      {/* 1. CABEÇALHO OFICIAL */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO: CLIQUE NO EMBLEMA [AV] LEVA AO PROPRIETÁRIO */}
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

          {/* NAVEGAÇÃO CENTRAL */}
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

          {/* BOTÕES DE AÇÃO: ANUNCIE + MENU DROPDOWN PAINEL */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5547988444404"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-105"
            >
              Anuncie
            </a>

            {/* BOTÃO PAINEL COM OS 3 ÍCONES */}
            <div className="relative">
              <button
