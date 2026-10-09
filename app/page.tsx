'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const championships = [
    {
      nome: 'COPA ARENA VALE 2026',
      status: 'EM ANDAMENTO',
      descricao: 'Principal competição da temporada · Pontos corridos + Mata-mata',
      times: '16 EQUIPES',
      premiacao: 'R$ 15.000'
    },
    {
      nome: 'LIGA BLUMENAU DE FUTSAL',
      status: 'EM ANDAMENTO',
      descricao: 'Campeonato regional com 4 turnos classificatórios',
      times: '12 EQUIPES',
      premiacao: 'R$ 8.000'
    },
    {
      nome: 'SUPERCOPA VALE 2026',
      status: 'FASE FINAL',
      descricao: 'Torneio eliminatório dos campeões regionais',
      times: '8 EQUIPES',
      premiacao: 'R$ 10.000'
    },
    {
      nome: 'COPA VERÃO 2027',
      status: 'EM BREVE',
      descricao: 'Abertura oficial da temporada de verão · Inscrições abertas',
      times: '20 EQUIPES',
      premiacao: 'R$ 12.000'
    }
  ];

  const games = [
    {
      status: 'AO VIVO',
      horario: 'HOJE · 19:30',
      mandante: 'FÊNIX CLUB',
      visitante: 'VALE UNITED',
      detalhe: 'GINÁSIO PRINCIPAL · NARRAÇÃO AO VIVO'
    },
    {
      status: 'EM BREVE',
      horario: 'HOJE · 21:00',
      mandante: 'ARENA FC',
      visitante: 'BLUMENAU 7',
      detalhe: 'QUADRA 02 · COBERTURA COMPLETA'
    },
    {
      status: 'AGENDADA',
      horario: 'AMANHÃ · 18:00',
      mandante: 'ESTRELA AZUL',
      visitante: 'LIONS SC',
      detalhe: 'ARENA VALE · PRÉ-JOGO ÀS 17:30'
    }
  ];

  const news = [
    {
      categoria: 'GIRO DA ARENA',
      tag: 'ANÁLISE',
      titulo: 'SUPERCOPA VALE ENTRA NA FASE DECISIVA',
      descricao: 'Confira a análise tática dos confrontos e as equipes favoritas ao título desta edição.'
    },
    {
      categoria: 'PÓS-JOGO ARENA',
      tag: 'HIGHLIGHTS',
      titulo: 'MELHORES MOMENTOS: FÊNIX AVALIA CLÁSSICO',
      descricao: 'Gols, defesas e as entrevistas exclusivas com os técnicos logo após o apito final.'
    },
    {
      categoria: 'ARENA BASE',
      tag: 'HISTÓRIAS',
      titulo: 'NOVOS TALENTOS GANHAM O HOLOFOTE NO VALE',
      descricao: 'Conheça os jovens que estão se destacando nas categorias de formação e chamando atenção de clubes.'
    }
  ];

  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-base sm:text-lg font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
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
            <Link href="#agenda" className="transition hover:text-white">
              Agenda
            </Link>
            <Link href="#campeonatos" className="transition hover:text-white">
              Campeonatos
            </Link>
            <Link href="/coordenador/atletasdestaques" className="transition hover:text-white">
              Atletas Destaques
            </Link>
          </nav>

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

      {/* 2. HERO */}
      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          <img
            src="/foto-pro-site-1.png"
            alt="Arena Vale"
            className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
              MÍDIA ESPORTIVA DIGITAL
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
              O PALCO DO <br />
              <span className="text-[#e50914]">ESPORTE É AQUI.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
              Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora das quadras.
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

      {/* 3. AO VIVO */}
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
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#161a24] p-6 lg:col-span-2 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-3.5 py-1 text-xs font-black tracking-wider text-white">
                    ● AO VIVO AGORA
                  </span>
                  <span className="text-xs font-bold text-[#8a92a6]">COPA ARENA VALE 2026</span>
                </div>

                <div className="my-10 flex items-center justify-around text-center">
                  <div className="flex-1">
                    <b className="block text-2xl sm:text-4xl font-black">FÊNIX CLUB</b>
                    <span className="mt-1 block text-xs font-bold text-[#8a92a6]">MANDANTE</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b0d12] px-6 py-3 text-2xl sm:text-4xl font-black text-[#e50914]">
