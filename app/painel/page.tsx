'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PainelPage() {
  const router = useRouter();

  const [usuarioEmail] = useState('arenavale2026@gmail.com');
  const [totalCampeonatos] = useState('12');
  const [totalInscricoes] = useState('1.436');
  const [campeonatoDestaque] = useState('Copa Regional Vale 2026');
  const [sistemaStatus] = useState(true);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* BARRA SUPERIOR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-amber-400">ARENA VALE</span>
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                Painel Restrito • {usuarioEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition flex items-center gap-2"
            >
              VER SITE PRINCIPAL ↗
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs md:text-sm font-bold rounded-lg bg-red-700 hover:bg-red-800 text-white transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              SAIR 🔒
            </button>
          </div>
        </header>

        {/* HERO / TÍTULO PRINCIPAL */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
            Centro de Comando & Gestão Editorial
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 tracking-wide uppercase font-medium">
            Painel do Coordenador: autoridade total para criar campeonatos, postar notícias, gerir atletas e conteúdos.
          </p>
        </section>

        {/* SEÇÃO DE MÉTRICAS */}
        <section className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-amber-300 bg-amber-400/10 rounded border border-amber-400/20 uppercase">
                Métricas e Avaliação
              </span>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white mt-2">
                Relatório de Tráfego e Desempenho
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                Acompanhamento em tempo real das visitas e conteúdos da Arena Vale
              </p>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  sistemaStatus
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sistemaStatus ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                {sistemaStatus ? 'Sistema Ativo & Sincronizado' : 'Aguardando Sincronização'}
              </span>
            </div>
          </div>

          {/* CARDS DE NÚMEROS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Campeonatos</span>
              <div className="text-3xl font-extrabold text-white mt-2">{totalCampeonatos}</div>
              <span className="text-[10px] font-medium text-emerald-400 mt-2 block">CADASTRADOS NA BASE</span>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Atletas Inscritos</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">{totalInscricoes}</div>
              <span className="text-[10px] font-medium text-slate-400 mt-2 block">TOTAL GERAL DE ATLETAS</span>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Conteúdo em Foco</span>
              <div className="text-sm font-bold text-white mt-2 truncate">TV Arena Vale - Ao Vivo</div>
              <span className="text-[10px] font-semibold text-amber-400 mt-2 block uppercase">Transmissões Ativas</span>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Campeonato Monitorado</span>
              <div className="text-sm font-bold text-white mt-2 truncate">{campeonatoDestaque}</div>
              <span className="text-[10px] font-semibold text-emerald-400 mt-2 block uppercase">Maior Volume de Acessos</span>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3 text-amber-300 text-xs font-medium">
            <span>💡</span>
            <span>DICA DE GESTÃO: Utilize estes dados para avaliar o alcance das transmissões e definir estratégias de divulgação junto aos atletas e patrocinadores.</span>
          </div>
        </section>

        {/* FERRAMENTAS DE CONTEÚDO
