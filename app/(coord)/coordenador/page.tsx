'use client';

import React from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const modulos = [
    {
      titulo: 'ATLETAS EM DESTAQUE',
      subtitulo: 'Gerenciamento de fotos, perfis e aprovação pública dos atletas.',
      tag: 'EDITORIAL',
      link: '/coordenador/atletasdestaques',
      botao: 'Acessar Galeria & Perfis →',
      destaque: true
    },
    {
      titulo: 'TRANSMISSÕES AO VIVO',
      subtitulo: 'Configuração do player, links do YouTube e placar da rodada.',
      tag: 'TV ARENA',
      link: '/#aovivo',
      botao: 'Configurar Transmissões →',
      destaque: false
    },
    {
      titulo: 'SOLICITAÇÕES DE INSCRIÇÃO',
      subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário oficial.',
      tag: 'CADASTROS',
      link: '/inscricao',
      botao: 'Ver Fluxo de Inscrição →',
      destaque: false
    },
    {
      titulo: 'CAMPEONATOS & TABELAS',
      subtitulo: 'Estruturação de torneios regionais, fases e premiações.',
      tag: 'COMPETIÇÕES',
      link: '/#campeonatos',
      botao: 'Gerir Campeonatos →',
      destaque: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between">
      {/* 1. CABEÇALHO DO PAINEL */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#e50914]/30 bg-[#e50914]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#e50914]">
              ● MODO GESTÃO ATIVO
            </span>
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
            >
              Ver Portal Público ↗
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL / DASHBOARD */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* Banner de Boas-vindas */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
              PAINEL ADMINISTRATIVO
            </span>
            <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
              CENTRAL DE CONTROLE <br />
              <span className="text-[#e50914]">ARENA VALE</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed">
              Gerencie a cobertura esportiva, aprove perfis de atletas para a galeria pública, organize competições e controle as transmissões ao vivo.
            </p>
          </div>
        </div>

        {/* Módulos do Sistema */}
        <div className="grid gap-6 sm:grid-cols-2">
          {modulos.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-[2rem] border p-8 shadow-xl transition hover:border-[#e50914]/50 ${
                m.destaque
                  ? 'border-[#e50914]/40 bg-[#161a24]'
                  : 'border-white/10 bg-[#13161f]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                    {m.tag}
                  </span>
                  {m.destaque && (
                    <span className="rounded-full bg-[#e50914] px-2.5 py-0.5 text-[10px] font-black text-white">
                      PRINCIPAL
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                  {m.titulo}
                </h2>
                <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">
                  {m.subtitulo}
                </p>
              </div>

              <div className="mt-8 border-t border-white/5 pt-5">
                <Link
                  href={m.link}
                  className={`inline-flex items-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider transition ${
                    m.destaque
                      ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-105'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:border-white/30 hover:text-white'
                  }`}
                >
                  {m.botao}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>
            © 2026 Arena Vale · Sistema de Gestão Interna
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Galeria de Atletas</Link>
            <Link href="/login" className="hover:text-white">Sair</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
