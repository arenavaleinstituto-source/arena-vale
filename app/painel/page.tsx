'use client';

import React from 'react';
import Link from 'next/link';

export default function PainelPage() {
  const usuarioEmail = 'arenavale2026@gmail.com';
  const totalCampeonatos = '12';
  const totalInscricoes = '1.436';
  const campeonatoDestaque = 'Copa Regional Vale 2026';
  const sistemaStatus = true;

  function handleLogout() {
    window.location.href = '/login';
  }

  return (
    <main className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 font-sans selection:bg-[#d4af37] selection:text-[#070b13]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BARRA SUPERIOR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-widest text-[#d4af37] uppercase">ARENA VALE</span>
              <span className="text-xs text-[#8a92a6] font-bold uppercase tracking-widest">
                Painel Restrito • <span className="text-white">{usuarioEmail}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg bg-[#101726] border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] text-white transition-all flex items-center gap-2 shadow-lg"
            >
              VER SITE PRINCIPAL ↗
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              SAIR 🔒
            </button>
          </div>
        </header>

        {/* HERO / TITULO PRINCIPAL */}
        <section className="bg-gradient-to-r from-[#101726] via-[#0c121e] to-[#070b13] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d4af37]/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
              CENTRO DE COMANDO & <span className="text-[#d4af37]">GESTÃO EDITORIAL</span>
            </h1>
            <p className="text-xs md:text-sm text-[#8a92a6] mt-3 tracking-widest uppercase font-bold max-w-3xl">
              Painel do Coordenador: autoridade total para criar campeonatos, postar notícias, gerir atletas e conteúdos da plataforma.
            </p>
          </div>
        </section>

        {/* SECAO DE METRICAS */}
        <section className="bg-[#101726] p-8 rounded-[2rem] border border-white/10 space-y-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest text-[#d4af37] bg-[#d4af37]/10 rounded border border-[#d4af37]/20 uppercase mb-3">
                Métricas e Avaliação
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Relatório de Tráfego e Desempenho
              </h2>
              <p className="text-xs text-[#8a92a6] uppercase tracking-widest mt-1 font-bold">
                Acompanhamento em tempo real das visitas e conteúdos da Arena Vale
              </p>
            </div>

            <div>
              <span
                className={`inline-flex items-center
