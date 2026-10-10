'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(0);

  const modalidades = [
    {
      id: 'futsal',
      nome: 'Futsal',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Circuitos regionais de alto rendimento e categorias de base no Vale.',
      statusBadge: 'INSCRIÇÕES EM BREVE'
    },
    {
      id: 'basquete',
      nome: 'Basquetebol',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Competições abertas, clínicas desportivas e etapas regionais oficiais.',
      statusBadge: 'EM PLANEAMENTO'
    },
    {
      id: 'fut7',
      nome: 'Futebol 7',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Torneios intermunicipais com transmissão ao vivo e cobertura multimédia completa.',
      statusBadge: 'PRÉ-TEMPORADA'
    },
    {
      id: 'volei',
      nome: 'Voleibol',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Circuito regional e integração comunitária através do desporto.',
      statusBadge: 'PROJETOS ABERTOS'
    }
  ];

  const noticias = [
    { titulo: 'NOVA TEMPORADA DE TRANSMISSÕES', descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional.', categoria: 'INSTITUCIONAL', tag: 'NOVIDADES' },
    { titulo: 'INCENTIVO AO DESPORTO REGIONAL', descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva.', categoria: 'PROJETO VALE', tag: 'DESENVOLVIMENTO' },
    { titulo: 'CADASTRO DE EQUIPAS E COMISSÕES', descricao: 'Capitães já podem preencher a ficha de interesse e agremiação para as próximas competições.', categoria: 'COMPETIÇÕES', tag: 'INSCRIÇÕES' }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1750px] items-center justify-between px-6 lg:px-12 py-4">
          <div className="flex items-center shrink-0">
            <Link href="/proprietario" title="Painel Exclusivo" className="flex items-center transition hover:opacity-90">
              <img src="/logo 02.png" alt="Arena Vale Sports" className="h-16 sm:h-18 md:h-20 w-auto max-w-[220px] sm:max-w-[270px] object-contain shrink-0" />
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 text-base font-black uppercase tracking-wider text-[#cad0e0]">
            <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
            <Link href="#aovivo" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shrink-0" /> Ao Vivo
            </Link>
            <Link href="#noticias" className="hover:text-white whitespace-nowrap transition">Notícias</Link>
            <Link href="#campeonatos" className="hover:text-white whitespace-nowrap transition">Modalidades</Link>
            <Link href="/atletasdestaques" className="hover:text-white whitespace-nowrap transition">Atletas Destaque</Link>
            <Link href="/inscricao" className="hover:text-white whitespace-nowrap transition">Inscrição</Link>
            <Link href="#projetosocial" className="hover:text-white whitespace-nowrap transition">Projeto Social</Link>
          </nav>
          <div className="flex items-center gap-4 shrink-0">
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-7 py-3 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 transition hover:bg-[#ff1e27] whitespace-nowrap">
              Anuncie
            </a>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuPainelAberto(!menuPainelAberto)}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#e50914] hover:bg-white/10 whitespace-nowrap"
              >
                <span>Painel</span> <span className="text-xs text-[#e50914]">▼</span>
              </button>
              {menuPainelAberto && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/15 bg-[#13161f] p-2 shadow-2xl backdrop-blur-xl z-50" onMouseLeave={() => setMenuPainelAberto(false)}>
                  <Link href="/coordenador" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e50914]/15 text-[#e50914] text-base">🛡️</span>
                    <span className="font-black text-white">Coordenador</span>
                  </Link>
                  <Link href="/inscricao" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-base">⚽</span>
                    <span className="font-black text-white">Capitão</span>
                  </Link>
                  <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 text-base">⚖️</span>
                    <span className="font-black text-white">Moderador</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[580px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          <img src="/foto-pro-site-1.png" alt="Arena Vale" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> COBERTURA & TRANSMISSÃO OFICIAL
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight">
              <span className="block whitespace-nowrap">O PALCO DO</span>
              <span className="block whitespace-nowrap mt-1 sm:mt-2"><span className="text-[#e50914]">ESPORTE</span> É AQUI.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
              Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#aovivo" className="flex items-center gap-2 rounded-full bg-[#e50914] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105">
                <span>▶</span> TRANSMISSÕES
              </a>
              <Link href="/inscricao" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40">
                INSCREVER EQUIPE →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="aovivo" className="border-t border-white/5 bg-[#10131a] px-6 py-1
