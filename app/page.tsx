'use client';

import React from 'react';
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
  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      
      {/* 1. CABEÇALHO OFICIAL ARENA VALE (MÍDIA ESPORTIVA) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* LOGO FRAME AV + MARCA */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              {/* Símbolo AV em Frame */}
              <span className="font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight leading-none text-white sm:text-2xl">
                ARENA <span className="text-[#e50914]">VALE</span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#8a92a6] uppercase mt-0.5">
                Mídia Esportiva
              </span>
            </div>
          </Link>

          {/* MENU ORIENTADO A CONTEÚDO */}
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
            <Link href="#videos" className="transition hover:text-white">
              Vídeos
            </Link>
            <Link href="/coordenador/atletasdestaques" className="transition hover:text-white">
              Histórias
            </Link>
            <Link href="#sobre" className="transition hover:text-white">
              Sobre
            </Link>
          </nav>

          {/* AÇÕES: ANUNCIE + PAINEL */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5547988444404"
              className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-105"
            >
              Anuncie
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-[#a0a8be] transition hover:border-white/40 hover:text-white"
            >
              Painel
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL: O PALCO DO ESPORTE É AQUI */}
      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[580px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          
          {/* Background com sobreposição escura de transmissão */}
          <img
            src="/foto-pro-site-1.png"
            alt="Arena Vale - O Palco do Esporte é Aqui"
            className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />

          {/* Conteúdo Hero */}
          <div className="relative z-10 max-w-3xl">
            
            {/* Tag Badge Transmissão */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
              COBERTURA & TRANSMISSÃO OFICIAL
            </div>

            {/* Slogan Oficial */}
            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
              O PALCO DO <br />
              <span className="text-[#e50914]">ESPORTE É AQUI.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
              Transmiss
