'use client';

import React from 'react';
import Link from 'next/link';

interface Atleta {
  id: string;
  nome: string;
  categoria: string;
  equipe: string;
  campeonato: string;
  imagem: string;
}

const ATLETAS_DESTAQUE: Atleta[] = [
  {
    id: '1',
    nome: 'Maurício Miranda',
    categoria: 'FUNDADOR',
    equipe: 'ARENA VALE SPORTS',
    campeonato: 'COPA ARENA VALE 2026',
    imagem: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    nome: 'João Santos',
    categoria: 'FUTEBOL',
    equipe: 'AMIGOS FC',
    campeonato: 'LIGA BLUMENAU 2026',
    imagem: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    nome: 'Ana Oliveira',
    categoria: 'VÔLEI',
    equipe: 'RESENHA FC',
    campeonato: 'SUPERCOPA VALE 2026',
    imagem: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80'
  }
];

export default function GaleriaAtletasDestaques() {
  return (
    <div className="min-h-screen bg-[#071426] p-6 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho da Galeria com texto e subtítulo em caixa alta */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl leading-none">
              ATLETAS EM DESTAQUE
            </h1>
            <p className="mt-4 text-xl sm:text-2xl md:text-3xl text-[#a8b4cc] font-semibold uppercase tracking-wide leading-relaxed">
              OS TALENTOS QUE BRILHARAM NAS QUADRAS, CAMPOS E ARENAS DO VALE.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/10 hover:border-white/40"
          >
            ← Voltar ao Início
          </Link>
        </div>

        {/* Galeria apenas com os cards das fotos */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {ATLETAS_DESTAQUE.map((atleta) => (
            <article
              key={atleta.id}
              className="flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e2148] shadow-2xl transition duration-300 hover:border-[#d4a849]/50"
            >
              <div>
                <div className="h-64 w-full overflow-hidden bg-[#071426]">
                  <img
                    src={atleta.imagem}
                    alt={atleta.nome}
                    className="h-full w-full object-cover object-top transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-[#d4a849]/15 px-3 py-1 text-xs font-black uppercase text-[#d4a849]">
                    ★ {atleta.categoria}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white">{atleta.nome}</h3>
                  <p className="mt-1 text-sm font-bold text-[#a8b4cc]">{atleta.equipe}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#071426]/70 px-3.5 py-2 text-xs text-[#d4a849]">
                    <span>🏆</span>
                    <span className="truncate font-bold uppercase">
                      {atleta.campeonato}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
