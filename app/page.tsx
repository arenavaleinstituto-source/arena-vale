'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const listaJogos = [
  { status: 'AO VIVO', horario: 'HOJE · 19:30', time1: 'FÊNIX CLUB', time2: 'VALE UNITED' },
  { status: 'EM BREVE', horario: 'HOJE · 21:00', time1: 'ARENA FC', time2: 'BLUMENAU 7' },
  { status: 'AGENDADA', horario: 'AMANHÃ · 18:00', time1: 'ESTRELA AZUL', time2: 'LIONS SC' }
];

const noticias = [
  { titulo: 'LIGA REGIONAL DE FUTSAL', descricao: 'Confira a análise técnica da rodada e os melhores momentos.', categoria: 'GIRO DA ARENA', tag: 'ANÁLISE' },
  { titulo: 'SUPERCOPA VALE 2026', descricao: 'Grandes jogadas e os bastidores das semifinais eletrizantes.', categoria: 'PÓS-JOGO ARENA', tag: 'HIGHLIGHTS' },
  { titulo: 'FORMAÇÃO E NOVOS TALENTOS', descricao: 'Conheça os jovens que estão se destacando nas categorias de base.', categoria: 'ARENA BASE', tag: 'HISTÓRIAS' }
];

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);

  return (
<div id="topo" className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
      <div className="flex items-center">
        <Link href="/proprietario" title="Acesso Seguro" className="flex items-center transition hover:opacity-90">
          <img
            src="/logo 02.png"
            alt="Arena Vale Sports"
            className="h-14 sm:h-16 md:h-20 w-auto max-w-[190px] sm:max-w-[240px] object-contain shrink-0"
          />
        </Link>
      </div>

      <nav className="hidden xl:flex items-center gap-6 text-sm font-black uppercase tracking-wider text-[#a0a8be]">
        <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
        <Link href="#aovivo" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shrink-0" /> Ao Vivo
        </Link>
