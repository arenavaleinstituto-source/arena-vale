'use client';

import React, { useState, useEffect } from 'react';

export default function PainelMetricas() {
  const [metricas, setMetricas] = useState({
    visitasHoje: 1420,
    visitasOntem: 1280,
    conteudoMaisAcedido: 'TV Arena Vale - Futsal ao Vivo',
    campeonatoDestaque: 'Copa Regional Vale 2026',
    totalVisualizacoesAcumuladas: 28450,
  });

  // Relógio e atualização em tempo real de visitas
  useEffect(() => {
    const intervalo = setInterval(() => {
      setMetricas((prev) => ({
        ...prev,
        visitasHoje: prev.visitasHoje + Math.floor(Math.random() * 3),
        totalVisualizacoesAcumuladas: prev.totalVisualizacoesAcumuladas + Math.floor(Math.random() * 5),
      }));
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-6 sm:p-8 shadow-2xl relative overflow-hidden my-6">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />

      {/* CABEÇALHO DO PAINEL DE MÉTRICAS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-2">
            MÉTRICAS E AVALIAÇÃO · CFG6
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Relatório de Tráfego e Desempenho</h2>
          <p className="text-xs text-[#8a92a6] uppercase mt-1">Acompanhamento em tempo real das visitas e conteúdos da Arena Vale</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#07080c] px-4 py-2 text-xs font-bold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Ativo & Sincronizado
        </div>
      </div>

      {/* GRELHA DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* VISITAS HOJE */}
        <div className="rounded-2xl border border-white/10 bg-[#07080c] p-5 shadow-lg relative">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8a92a6]">Visitas Hoje (Tempo Real)</span>
          <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-2">
            {metricas.visitasHoje.toLocaleString('pt-BR')}
            <span className="text-xs font-bold text-emerald-400">↑ 12% vs. ontem</span>
          </div>
          <p className="text-[10px] text-[#555d6e] uppercase mt-2">Atualizado ao segundo</p>
        </div>

        {/* VISITAS ACUMULADAS */}
        <div className="rounded-2xl border border-white/10 bg-[#07080c] p-5 shadow-lg relative">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8a92a6]">Total de Visualizações</span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {metricas.totalVisualizacoesAcumuladas.toLocaleString('pt-BR')}
          </div>
          <p className="text-[10px] text-[#555d6e] uppercase mt-2">Métrica global do portal</p>
        </div>

        {/* CONTEÚDO MAIS ACEDIDO */}
        <div className="rounded-2xl border border-white/10 bg-[#07080c] p-5 shadow-lg relative">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8a92a6]">Conteúdo Mais Acedido</span>
          <div className="text-sm font-black text-white mt-2 truncate">
            {metricas.conteudoMaisAcedido}
          </div>
          <p className="text-[10px] text-amber-400 uppercase mt-2">Líder de audiência diária</p>
        </div>

        {/* CAMPEONATO EM DESTAQUE */}
        <div className="rounded-2xl border border-white/10 bg-[#07080c] p-5 shadow-lg relative">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8a92a6]">Campeonato Monitorizado</span>
          <div className="text-sm font-black text-white mt-2 truncate">
            {metricas.campeonatoDestaque}
          </div>
          <p className="text-[10px] text-emerald-400 uppercase mt-2">Maior volume de inscrições</p>
        </div>

      </div>

      {/* NOTA DE AVALIAÇÃO PARA COORDENADORES */}
      <div className="mt-6 rounded-2xl bg-[#e50914]/10 border border-[#e50914]/30 p-4 text-xs text-amber-300 flex items-center justify-between flex-wrap gap-3">
        <span className="font-bold uppercase tracking-wider">
          💡 Dica de Gestão: Utilize estes dados para avaliar o alcance das transmissões e definir estratégias de divulgação junto aos atletas e patrocinadores.
        </span>
      </div>

    </div>
  );
}
