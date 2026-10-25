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
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 font-sans selection:bg-[#d4af37] selection:text-[#070b13]">
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase border ${
                  sistemaStatus
                    ? 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]'
                    : 'bg-white/10 border-white/20 text-[#8a92a6]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sistemaStatus ? 'bg-[#d4af37]' : 'bg-[#8a92a6]'} animate-pulse`} />
                {sistemaStatus ? 'Sistema Ativo & Sincronizado' : 'Aguardando Sincronização'}
              </span>
            </div>
          </div>

          {/* CARDS DE NUMEROS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37] opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">Total Campeonatos</span>
              <div className="text-4xl font-black text-white mt-3 tracking-tighter">{totalCampeonatos}</div>
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] mt-3 block uppercase">CADASTRADOS NA BASE</span>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37] opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">Atletas Inscritos</span>
              <div className="text-4xl font-black text-[#d4af37] mt-3 tracking-tighter">{totalInscricoes}</div>
              <span className="text-[10px] font-bold tracking-widest text-[#8a92a6] mt-3 block uppercase">TOTAL GERAL DE ATLETAS</span>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37] opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">Conteúdo em Foco</span>
              <div className="text-lg font-black text-white mt-3 truncate">TV Arena Vale - Ao Vivo</div>
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] mt-3 block uppercase">Transmissões Ativas</span>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37] opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">Campeonato Monitorado</span>
              <div className="text-lg font-black text-white mt-3 truncate">{campeonatoDestaque}</div>
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] mt-3 block uppercase">Maior Volume de Acessos</span>
            </div>
          </div>

          <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-4 flex items-start sm:items-center gap-4 text-[#d4af37] text-xs font-bold tracking-wider uppercase">
            <span className="text-lg">💡</span>
            <span className="leading-relaxed">DICA DE GESTÃO: Utilize estes dados para avaliar o alcance das transmissões e definir estratégias de divulgação junto aos atletas e patrocinadores.</span>
          </div>
        </section>

        {/* FERRAMENTAS DE CONTEUDO & CAMPEONATOS */}
        <section className="bg-[#101726] p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <span className="h-4 w-1.5 bg-[#d4af37] -skew-x-12" />
            <h2 className="text-lg font-black uppercase tracking-widest text-white">
              Ferramentas de Conteúdo & Campeonatos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/painel/campeonatos"
              className="group block p-8 bg-[#070b13] rounded-2xl border border-white/5 hover:border-[#d4af37]/60 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/10 transition-colors" />
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">🏆</div>
              <h3 className="font-black text-white group-hover:text-[#d4af37] transition-colors text-base tracking-wider uppercase mb-2">
                Gerir Campeonatos
              </h3>
              <p className="text-xs text-[#8a92a6] font-medium leading-relaxed">
                Criar novas copas, jornadas e inscrições.
              </p>
            </Link>

            <Link
              href="/painel/noticias"
              className="group block p-8 bg-[#070b13] rounded-2xl border border-white/5 hover:border-[#d4af37]/60 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/10 transition-colors" />
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">📰</div>
              <h3 className="font-black text-white group-hover:text-[#d4af37] transition-colors text-base tracking-wider uppercase mb-2">
                Publicar Notícias
              </h3>
              <p className="text-xs text-[#8a92a6] font-medium leading-relaxed">
                Lançar comunicados, destaques e novidades.
              </p>
            </Link>

            <Link
              href="/painel/tv"
              className="group block p-8 bg-[#070b13] rounded-2xl border border-white/5 hover:border-[#d4af37]/60 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/10 transition-colors" />
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">📺</div>
              <h3 className="font-black text-white group-hover:text-[#d4af37] transition-colors text-base tracking-wider uppercase mb-2">
                Atualizar TV Arena Vale
              </h3>
              <p className="text-xs text-[#8a92a6] font-medium leading-relaxed">
                Gerir transmissões e vídeos ao vivo.
              </p>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
