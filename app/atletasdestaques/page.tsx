'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AtletaItem {
  id: string;
  nome: string;
  modalidade: string;
  equipe: string;
  destaque: string;
  imagem?: string;
  jogos?: string;
  golsOrPontos?: string;
  assistencias?: string;
}

const ATLETAS_INICIAIS: AtletaItem[] = [
  {
    id: 'atleta-1',
    nome: 'GABRIEL MENDES',
    modalidade: 'FUTSAL',
    equipe: 'Fênix Club · Ala / Fixo',
    destaque: 'Artilheiro da Copa Vale 2026',
    imagem: '/fundo-arena.jpg',
    jogos: '12',
    golsOrPontos: '18 Gols',
    assistencias: '9'
  },
  {
    id: 'atleta-2',
    nome: 'LUCAS SILVEIRA',
    modalidade: 'BASQUETEBOL',
    equipe: 'Vale United Basquete · Armador',
    destaque: 'MVP da Rodada Classificatória',
    imagem: '/fundo-arena.jpg',
    jogos: '8',
    golsOrPontos: '164 Pontos',
    assistencias: '42'
  },
  {
    id: 'atleta-3',
    nome: 'MATHEUS BECKER',
    modalidade: 'FUTEBOL 7',
    equipe: 'Arena FC · Pivô',
    destaque: 'Melhor Jogador do Mês',
    imagem: '/fundo-arena.jpg',
    jogos: '10',
    golsOrPontos: '14 Gols',
    assistencias: '6'
  }
];

export default function AtletasDestaquesPage() {
  const [filtro, setFiltro] = useState('TODOS');
  const [atletas, setAtletas] = useState<AtletaItem[]>(ATLETAS_INICIAIS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arenavale_atletas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setAtletas(parsed);
      }
    } catch {
      // Fallback
    }
  }, []);

  const atletasFiltrados = filtro === 'TODOS' 
    ? atletas 
    : atletas.filter(a => a.modalidade.toUpperCase().includes(filtro));

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-12 flex-grow space-y-10">
        
        <div className="text-center sm:text-left border-b border-white/10 pb-8">
          <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff2a35] mb-3">GALERIA OFICIAL · 2026</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">Atletas em Destaque</h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] mt-2 uppercase max-w-2xl">Os talentos, artilheiros e protagonistas das competições do ecossistema Arena Vale.</p>
        </div>

        {/* FILTROS DE MODALIDADE */}
        <div className="flex flex-wrap gap-2.5">
          {['TODOS', 'FUTSAL', 'BASQUETEBOL', 'FUTEBOL 7', 'VOLEIBOL'].map((mod) => (
            <button
              key={mod}
              onClick={() => setFiltro(mod)}
              className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                filtro === mod 
                  ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30' 
                  : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* GRELHA DE ATLETAS */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {atletasFiltrados.map((atleta, index) => (
            <div 
              key={atleta.id || index}
              className="group relative rounded-[2rem] border border-white/10 bg-[#11141d] p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#e50914]/60 hover:-translate-y-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#11141d]/80 to-transparent opacity-90" />
              
              {/* Imagem de Fundo Válida (Sem erros) */}
              <img 
                src={atleta.imagem || '/fundo-arena.jpg'} 
                alt={atleta.nome} 
                className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-45 transition duration-500" 
              />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-[#e50914] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-4 shadow-md">
                  {atleta.modalidade}
                </span>
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">{atleta.destaque}</p>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight mt-1">{atleta.nome}</h3>
                <p className="text-xs text-[#cad0e0] uppercase mt-1">{atleta.equipe}</p>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <span className="block text-base font-black text-white">{atleta.jogos || '10'}</span>
                  <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Jogos</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <span className="block text-base font-black text-[#e50914]">{atleta.golsOrPontos || '15'}</span>
                  <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Gols/Pts</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <span className="block text-base font-black text-white">{atleta.assistencias || '5'}</span>
                  <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Assist.</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**. Todos os direitos reservados.
      </footer>
    </div>
  );
}
