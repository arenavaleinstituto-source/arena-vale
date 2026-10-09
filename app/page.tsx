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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
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
            <Link href="#agenda" className="transition hover
