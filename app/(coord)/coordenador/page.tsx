'use client';

import React from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const coordenadores = [
    { cargo: 'COORDENADOR GERAL', nome: 'Coordenação Arena Vale', email: 'arenavale2026@gmail.com', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMPETIÇÕES', nome: 'Gestão de Campeonatos', email: 'competicoes@arenavale.com.br', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMUNICAÇÃO', nome: 'Mídia & TV Arena Vale', email: 'imprensa@arenavale.com.br', tel: '(47) 98844-4404' }
  ];

  const usuarios = [
    { nome: 'Carlos Eduardo', papel: 'MODERADOR', equipe: 'Arena Vale Oficial', email: 'carlos@arenavale.com' },
    { nome: 'Lucas Silveira', papel: 'CAPITAO', equipe: 'Fênix Club', email: 'lucas@fenix.com' },
    { nome: 'Rodrigo Matos', papel: 'CAPITAO', equipe: 'Vale United', email: 'rodrigo@valeunited.com' }
  ];

  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Gestão de fotos, perfis e aprovação pública dos atletas.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Configuração do player, links do YouTube e placar da rodada.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Inscrições →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Estruturação de torneios regionais, fases e premiações.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Campeonatos →', destaque: false }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-sm font-black tracking-tighter text-white"><span className="text-[#e50914]">A</span>V</span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">ARENA <span className="text-[#e50914]">VALE</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white">Ver Site ↗</Link>
            <Link href="/login" className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300">Sair</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">PAINEL ADMINISTRATIVO</span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">CENTRAL DE CONTROLE <br /><span className="text-[#e50914]">ARENA VALE</span></h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">Gestão executiva da coordenação geral, atletas, equipas e permissões de acesso ao sistema.</p>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white">Coordenadores Oficiais (3 Vagas)</h2>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#8a92a6]">3 / 3 Ocupadas</span>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {coordenadores.map((coord, idx) => (
              <div key={idx} className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="rounded-full bg-[#e50914]/1
