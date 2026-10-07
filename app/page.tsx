'use client';

import React from 'react';

const championships = [
  ['🏆', 'EM ANDAMENTO', 'COPA ARENA VALE 2026', 'PRINCIPAL COMPETIÇÃO DA TEMPORADA · PONTOS CORRIDOS + MATA-MATA', '12', '66', 'R$ 15k', 'FASE DE GRUPOS', '62%', '12/03/2026', '20/12/2026'],
  ['⚽', 'EM ANDAMENTO', 'LIGA BLUMENAU 2026', 'CAMPEONATO REGIONAL DE PONTOS CORRIDOS · 4 TURNOS', '10', '90', 'R$ 8k', 'TURNO 2', '45%', '05/02/2026', '30/11/2026'],
  ['🥇', 'FASE DE GRUPOS', 'SUPERCOPA VALE 2026', 'TORNEIO ELIMINATÓRIO DOS CAMPEÕES REGIONAIS', '8', '15', 'R$ 20k', 'GRUPOS', '80%', '22/04/2026', '15/11/2026'],
  ['🌟', 'INSCRIÇÕES ABERTAS', 'TORNEIO DE INVERNO 2026', 'CATEGORIA SUB-17 E SUB-15 · FORMATO ELIMINATÓRIO EM JOGO ÚNICO', '16', '—', 'R$ 5k', 'INSCRIÇÕES', '12/16', '15/07/2026', '30/09/2026'],
  ['🔥', 'EM BREVE', 'COPA VERÃO 2027', 'ABERTURA DA TEMPORADA 2027 · PRÉ-INSCRIÇÃO EM DEZEMBRO', '16', '—', 'R$ 12k', 'AGUARDANDO', '0%', '10/01/2027', '20/03/2027'],
  ['🏅', 'FINALIZADO', 'COPA INAUGURAÇÃO 2025', 'TORNEIO DE ABERTURA DA ARENA VALE · CAMPEÃO: FÊNIX CLUB', '8', '14', 'R$ 6k', 'ENCERRADO', '100%', '15/08/2025', '12/12/2025']
];

const games = [
  ['PRÓXIMA', 'HOJE · 19:30', 'FÊNIX CLUB', 'VALE UNITED', 'QUADRA 01'],
  ['PRÓXIMA', 'HOJE · 20:30', 'ARENA FC', 'BLUMENAU 7', 'QUADRA 02'],
  ['AGENDADA', 'AMANHÃ · 18:00', 'ESTRELA AZUL', 'LIONS SC', 'QUADRA 01']
];

export default function PublicPage() {
  return (
    <main id="topo" className="min-h-screen bg-[#0a1830] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
        <a href="#topo" className="flex items-center gap-4">
          <img 
            src="https://dhu8izvlu5fgy.space.minimax.io/logo-header.png" 
            alt="" 
            className="h-12 w-auto sm:h-16 object-contain"
          />
          <span className="font-black tracking-[.08em] text-2xl sm:text-4xl leading-tight text-white whitespace-nowrap">
            COMPLEXO ESPORTIVO ARENA VALE
          </span>
        </a>
        <div className="flex gap-2 text-xs font-bold">
          <a href="/login" className="rounded-full bg-[#d4a849] px-6 py-3 text-[#0a1530] transition hover:opacity-90">
            PAINEL
          </a>
        </div>
      </header>

      <section className="relative mx-auto min-h-[590px] max-w-7xl overflow-hidden rounded-[2rem] px-6 py-28 lg:px-14">
        <img 
          src="/foto-pro-site-1.png" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/75 to-[#071426]/25" />
        <div className="relative max-w-2xl">
          <h1 className="text-6xl font-black uppercase leading-[.9] sm:text-8xl">
            <span className="text-[#d4a849]">ALÉM DO<br/>PLACAR,</span><br/>
            <span className="text-white">CONTAMOS<br/>HISTÓRIAS!</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg text-[#a8b4cc]">
            Acompanhe partidas, equipas e campeonatos com informação, emoção e a identidade oficial da Arena Vale Sports.
          </p>
        </div>
      </section>

      <section className="bg-[#0c1f4a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
            OS TALENTOS QUE BRILHARAM NAS QUADRAS, CAMPOS E ARENAS DO VALE
          </h2>

          <div className="relative mt-10 overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#071426] shadow-2xl">
            <img
              src="/foto-pro-site-1.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center brightness-90 transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-[#071426]/75 to-transparent sm:bg-gradient-to-r sm:from-[#071426]/95 sm:via-[#071426]/70 sm:to-transparent" />
            <div className="relative z-10 flex min-h-[380px] flex-col justify-end p-8 sm:min-h-[440px] sm:max-w-2xl sm:p-14">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#d4a849]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#d4a849] backdrop-blur-md">
                ⭐ GALERIA OFICIAL
              </span>
              <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
