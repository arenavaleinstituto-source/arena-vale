'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AtletasDestaquesPage() {
  const [filtro, setFiltro] = useState('TODOS');

  const atletas = [
    {
      id: 1,
      nome: 'LUCAS SILVA',
      apelido: 'LUCAS 10',
      modalidade: 'FUTSAL',
      posicao: 'ALA DIREITO',
      equipe: 'FÊNIX CLUB',
      cidade: 'BLUMENAU - SC',
      gols: '14 GOLS',
      destaque: 'ARTILHEIRO DA COPA',
      imagem: '/foto-pro-site-1.png'
    },
    {
      id: 2,
      nome: 'GABRIEL SANTOS',
      apelido: 'BIEL',
      modalidade: 'FUT 7',
      posicao: 'MEIA-ARMADOR',
      equipe: 'VALE UNITED',
      cidade: 'GASPAR - SC',
      gols: '9 ASSISTÊNCIAS',
      destaque: 'LÍDER EM PASSE',
      imagem: '/foto-pro-site-1.png'
    },
    {
      id: 3,
      nome: 'MATEUS ROCHA',
      apelido: 'PAREDÃO',
      modalidade: 'FUTSAL',
      posicao: 'GOLEIRO',
      equipe: 'BLUMENAU 7',
      cidade: 'BLUMENAU - SC',
      gols: 'MENOS VAZADO',
      destaque: 'MELHOR GOLEIRO',
      imagem: '/foto-pro-site-1.png'
    },
    {
      id: 4,
      nome: 'RAFAEL COSTA',
      apelido: 'RAFA',
      modalidade: 'CAMPO',
      posicao: 'ATACANTE',
      equipe: 'LIONS SC',
      cidade: 'INDAIAL - SC',
      gols: '8 GOLS',
      destaque: 'REVELAÇÃO 2026',
      imagem: '/foto-pro-site-1.png'
    }
  ];

  const atletasFiltrados =
    filtro === 'TODOS'
      ? atletas
      : atletas.filter((a) => a.modalidade === filtro);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
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
            <Link
              href="/inscricao"
              className="rounded-full bg-[#e50914] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27]"
            >
              Indicar Atleta +
            </Link>
            <Link
              href="/coordenador"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
            >
              Painel
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* Banner do Topo com as novas frases */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
              ACOMPANHE NOSSOS TALENTOS
            </span>
            <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
              ATLETAS EM <br />
              <span className="text-[#e50914]">DESTAQUE</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base font-bold uppercase tracking-wider text-[#cad0e0] leading-relaxed">
              ALÉM DO PLACAR, CONTAMOS HISTÓRIAS.
            </p>
          </div>

          {/* Filtros por Modalidade */}
          <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t border-white/10">
            {['TODOS', 'FUTSAL', 'FUT 7', 'CAMPO'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltro(cat)}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                  filtro === cat
                    ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30'
                    : 'border border-white/10 bg-white/5 text-[#8a92a6] hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Atletas */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {atletasFiltrados.map((atleta) => (
            <div
              key={atleta.id}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#13161f] shadow-xl transition hover:border-[#e50914]/50 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0b0d12]">
                <img
                  src={atleta.imagem}
                  alt={atleta.nome}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13161f] via-transparent to-transparent" />
                
                <span className="absolute top-4 left-4 rounded-full bg-[#e50914] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                  {atleta.modalidade}
                </span>

                <span className="absolute top-4 right-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10">
                  {atleta.posicao}
                </span>
              </div>

              <div className="p-6 pt-2">
                <span className="text-[10px] font-black tracking-wider text-[#e50914] uppercase">
                  {atleta.destaque}
                </span>
                <h3 className="mt-1 text-xl font-black uppercase text-white tracking-tight">
                  {atleta.nome}
                </h3>
                <p className="text-xs font-bold text-[#8a92a6] mt-0.5">
                  {atleta.equipe} · {atleta.cidade}
                </p>

                <div className="mt-5 rounded-xl border border-white/5 bg-[#0b0d12] p-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8a92a6]">Desempenho</span>
                  <span className="text-xs font-black text-white">{atleta.gols}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>
            © 2026 Arena Vale · Cobertura e Galeria Oficial
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador" className="hover:text-white">Painel</Link>
            <Link href="/inscricao" className="hover:text-white">Inscrição</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
