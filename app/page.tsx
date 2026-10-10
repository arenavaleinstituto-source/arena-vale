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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/proprietario"
              title="Acesso Seguro"
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914] cursor-pointer"
            >
              <span className="text-base sm:text-lg font-black tracking-t
