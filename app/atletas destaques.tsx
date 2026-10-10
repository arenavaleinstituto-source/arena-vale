'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const atletasIniciais = [
  {
    id: 1,
    nome: 'Gabriel Mendes',
    modalidade: 'Futsal',
    clube: 'Fênix Club',
    posicao: 'Ala / Fixo',
    foto: '/foto-pro-site-1.png',
    destaque: 'Artilheiro da Copa Vale 2026',
    estatisticas: { jogos: 12, gols: 18, assistencias: 9 }
  },
  {
    id: 2,
    nome: 'Lucas Silveira',
    modalidade: 'Basquetebol',
    clube: 'Vale United Basquete',
    posicao: 'Armador',
    foto: '/foto-pro-site-1.png',
    destaque: 'MVP da Rodada Classificatória',
    estatisticas: { jogos: 8, pontos: 164, assistencias: 42 }
  },
  {
    id: 3,
    nome: 'Matheus Becker',
    modalidade: 'Futebol 7',
    clube: 'Arena FC',
    posicao: 'Pivô',
    foto: '/foto-pro-site-1.png',
    destaque: 'Melhor Jogador do Mês',
    estatisticas: { jogos: 10, gols: 14, assistencias: 6 }
  }
];

export default function AtletasDestaquesPublicoPage() {
  const [filtro, setFiltro] = useState('TODOS');

  const modalidades = ['TODOS', 'Futsal', 'Basquetebol', 'Futebol 7', 'Voleibol'];

  const atletasFiltrados = filtro === 'TODOS'
    ? atletasIniciais
    : atletasIniciais.filter((a) => a.modalidade.toLowerCase() === filtro.toLowerCase());

  return (<div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white pb-20"><header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4"><Link href="/" className="flex items-center gap-2"><img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain" /></Link><Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold text-[#a0a8be] hover:text-white transition">← Voltar ao Início</Link></div></header><main className="mx-auto max-w-7xl px-4 sm:px-6 pt-10"><div className="text-center sm:text-left mb-10"><span className="rounded-full bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#e50914]">Galeria Oficial</span><h1 className="mt-4 text-3xl sm:text-5xl font-black uppercase tracking-tight">Atletas em <span className="text-[#e50914]">Destaque</span></h1><p className="mt-2 text-sm text-[#8a92a6]">Os talentos, artilheiros e protagonistas das competições do ecossistema Arena Vale.</p></div><div className="flex flex-wrap gap-2.5 mb-10">{modalidades.map((mod) => (<button key={mod} type="button" onClick={() => setFiltro(mod)} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${filtro === mod ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30' : 'border border-white/15 bg-white/5 text-[#a0a8be] hover:text-white'}`}>{mod}</button>))}</div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{atletasFiltrados.map((atleta) => (<div key={atleta.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#13161f] shadow-2xl transition hover:border-[#e50914]/50 flex flex-col justify-between"><div className="relative h-64 w-full overflow-hidden bg-[#1c1417]"><img src={atleta.foto} alt={atleta.nome} className="h-full w-full object-cover object-center transition duration-500 hover:scale-105 brightness-90" /><div className="absolute inset-0 bg-gradient-to-t from-[#13161f] via-transparent to-transparent" /><div className="absolute top-4 left-4"><span className="rounded-full bg-[#e50914] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">{atleta.modalidade}</span></div></div><div className="p-6 pt-2"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">{atleta.destaque}</p><h2 className="mt-1 text-2xl font-black uppercase text-white">{atleta.nome}</h2><p className="text-xs text-[#8a92a6] font-semibold mt-0.5">{atleta.clube} · {atleta.posicao}</p><div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center"><div className="rounded-xl bg-[#0b0d12] p-2.5"><span className="block text-lg font-black text-white">{atleta.estatisticas.jogos}</span><span className="text-[9px] uppercase font-bold text-[#8a92a6]">Jogos</span></div><div className="rounded-xl bg-[#0b0d12] p-2.5"><span className="block text-lg font-black text-[#e50914]">{atleta.estatisticas.gols ?? atleta.estatisticas.pontos}</span><span className="text-[9px] uppercase font-bold text-[#8a92a6]">{atleta.modalidade === 'Basquetebol' ? 'Pontos' : 'Gols'}</span></div><div className="rounded-xl bg-[#0b0d12] p-2.5"><span className="block text-lg font-black text-white">{atleta.estatisticas.assistencias}</span><span className="text-[9px] uppercase font-bold text-[#8a92a6]">Assist.</span></div></div></div></div>))}</div></main></div>);
}
