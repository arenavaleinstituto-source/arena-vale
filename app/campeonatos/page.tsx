'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Campeonato {
  id: string;
  nome: string;
  ano: number;
  categoria: string;
  formato: string;
  status: string;
  data_inicio: string;
}

export default function PublicCampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      const { data, error } = await supabase
        .from('campeonatos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (!error && data) {
        setCampeonatos(data);
      }
      setLoading(false);
    };

    fetchCampeonatos();
  }, []);

  const formatarStatus = (status: string) => {
    const mapa: Record<string, string> = {
      'inscricoes_abertas': 'Inscrições Abertas',
      'fase_grupos': 'Fase de Grupos',
      'em_andamento': 'Em Andamento',
      'finalizado': 'Finalizado'
    };
    return mapa[status] || status;
  };

  const formatarFormato = (formato: string) => {
    const mapa: Record<string, string> = {
      'pontos_corridos': 'Pontos Corridos',
      'mata_mata': 'Mata-Mata',
      'misto': 'Misto (Grupos + Eliminatórias)'
    };
    return mapa[formato] || formato;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white selection:bg-[#e50914] selection:text-[#0b0b0c]">
      
      {/* CABEÇALHO (Idêntico ao da Home e Notícias) */}

      {/* TÍTULO DA PÁGINA */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
              <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">COMPETIÇÕES OFICIAIS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
              CAMPEONATOS DA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#f3e5ab]">ARENA VALE</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-end">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#a1a1aa]">TEMPORADA 2026</span>
            <span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse" />
          </div>
        </div>
      </section>

      {/* GRELHA DE CAMPEONATOS */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-[#e50914] text-sm font-black uppercase tracking-widest animate-pulse">
              A carregar base de dados...
            </div>
          </div>
        ) : campeonatos.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#141417] p-16 text-center shadow-2xl">
             <p className="text-[#a1a1aa] font-bold uppercase tracking-wider">Ainda não há competições registadas na temporada atual.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {campeonatos.map((camp) => (
              <article key={camp.id} className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#141417] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70 relative overflow-hidden">
                
                {/* Efeito de Fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#e50914]/5 rounded-bl-full group-hover:bg-[#e50914]/10 transition-colors pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/0 via-transparent to-[#e50914]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Status Badge */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <span className={`inline-block px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded shadow-lg ${
                    camp.status === 'inscricoes_abertas' ? 'bg-[#e50914] text-[#0b0b0c] shadow-[#e50914]/30' : 
                    camp.status === 'finalizado' ? 'bg-white/10 text-white/50' : 
                    'bg-[#101726] border border-[#e50914]/30 text-[#e50914]'
                  }`}>
                    {formatarStatus(camp.status)}
                  </span>
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all opacity-80">🏆</span>
                </div>
                
                {/* Informação Principal */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">EDIÇÃO {camp.ano}</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase leading-[1.1] tracking-tight text-white group-hover:text-[#e50914] transition-colors mb-4">
                    {camp.nome}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Categoria</span>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">{camp.categoria}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Formato</span>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">{formatarFormato(camp.formato)}</span>
                    </div>
                    {camp.data_inicio && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Início Previsto</span>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{new Date(camp.data_inicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Botão de Ação */}
                <div className="relative z-10 pt-6 border-t border-white/10 mt-auto">
                  <a 
                    href={`https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20${camp.nome}%20(${camp.categoria})!`}
                    target="_blank" 
                    rel="noreferrer" 
                    className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      camp.status === 'inscricoes_abertas' 
                        ? 'bg-[#e50914] hover:bg-[#b5952f] text-[#0b0b0c] shadow-lg shadow-[#e50914]/20' 
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {camp.status === 'inscricoes_abertas' ? 'INSCREVER EQUIPA ↗' : 'SABER MAIS ↗'}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
