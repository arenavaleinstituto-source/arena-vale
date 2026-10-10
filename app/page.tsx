'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const listaJogos = [
  { status: 'AO VIVO', horario: 'HOJE · 19:30', time1: 'FÊNIX CLUB', time2: 'VALE UNITED' },
  { status: 'EM BREVE', horario: 'HOJE · 21:00', time1: 'ARENA FC', time2: 'BLUMENAU 7' },
  { status: 'AGENDADA', horario: 'AMANHÃ · 18:00', time1: 'ESTRELA AZUL', time2: 'LIONS SC' }
];

const noticias = [
  { titulo: 'LIGA REGIONAL DE FUTSAL', descricao: 'Confira a análise técnica da rodada e os melhores momentos.', categoria: 'GIRO DA ARENA', tag: 'ANÁLISE' },
  { titulo: 'SUPERCOPA VALE 2026', descricao: 'Grandes jogadas e os bastidores das semifinais eletrizantes.', categoria: 'PÓS-JOGO ARENA', tag: 'HIGHLIGHTS' },
  { titulo: 'FORMAÇÃO E NOVOS TALENTOS', descricao: 'Conheça os jovens que estão se destacando nas categorias de base.', categoria: 'ARENA BASE', tag: 'HISTÓRIAS' }
];

const campeonatos = [
  {
    id: 'futsal',
    nome: 'Futsal Regional',
    fase: 'Fase de Grupos',
    logo: '/campeonato-futsal.png',
    sigla: 'FR',
    patrocinadores: [
      { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
      { nome: 'Empresa Parceira', cota: 'Apoio Oficial' },
      { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
    ]
  },
  {
    id: 'volei',
    nome: 'Voleibol Vale Cup',
    fase: 'Oitavos de Final',
    logo: '/campeonato-volei.png',
    sigla: 'VC',
    patrocinadores: [
      { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
      { nome: 'Marca Regional', cota: 'Apoio Oficial' },
      { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
    ]
  },
  {
    id: 'basquete',
    nome: 'Basquetebol Open',
    fase: 'Classificatórias',
    logo: '/LOGO%20BASKETE.png',
    sigla: 'BO',
    patrocinadores: [
      { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
      { nome: 'Apoiador Local', cota: 'Apoio Oficial' },
      { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
    ]
  },
  {
    id: 'fut7',
    nome: 'Futebol 7 Intermunicipal',
    fase: 'Semifinais',
    logo: '/campeonato-fut7.png',
    sigla: 'F7',
    patrocinadores: [
      { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
      { nome: 'Parceiro Esportivo', cota: 'Apoio Oficial' },
      { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
    ]
  }
];

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(2);

  const ativo = campeonatos[campeonatoSelecionado];

  const cabecalho = (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center">
          <Link href="/proprietario" title="Acesso Seguro" className="flex items-center transition hover:opacity-90">
            <img
              src="/logo 02.png"
              alt="Arena Vale Sports"
              className="h-14 sm:h-16 md:h-20 w-auto max-w-[190px] sm:max-w-[240px] object-contain shrink-0"
            />
          </Link>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-sm font-black uppercase tracking-wider text-[#a0a8be]">
          <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
          <Link href="#aovivo" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shrink-0" /> Ao Vivo
          </Link>
          <Link href="#noticias" className="hover:text-white whitespace-nowrap transition">Notícias</Link>
          <Link href="#agenda" className="hover:text-white whitespace-nowrap transition">Agenda</Link>
          <Link href="#campeonatos" className="hover:text-white whitespace-nowrap transition">Campeonatos</Link>
          <Link href="/coordenador/atletasdestaques" className="hover:text-white whitespace-nowrap transition">Atletas Destaques</Link>
          <Link href="#projetosocial" className="hover:text-white whitespace-nowrap transition">Projeto Social</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] whitespace-nowrap">
            Anuncie
          </a>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuPainelAberto(!menuPainelAberto)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#a0a8be] transition hover:border-white/40 hover:text-white whitespace-nowrap"
            >
              <span>Painel</span> <span className="text-[10px]">▾</span>
            </button>
            {menuPainelAberto && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-[#13161f] p-2 shadow-2xl backdrop-blur-xl z-50" onMouseLeave={() => setMenuPainelAberto(false)}>
                <Link href="/coordenador" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e50914]/15 text-[#e50914]">🛡️</span>
                  <div><p className="font-black text-white">Coordenador</p><p className="text-[10px] text-[#8a92a6]">Gestão Operacional</p></div>
                </Link>
                <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">⚖️</span>
                  <div><p className="font-black text-white">Moderador</p><p className="text-[10px] text-[#8a92a6]">Torneios & Placares</p></div>
                </Link>
                <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">⚽</span>
                  <div><p className="font-black text-white">Capitão</p><p className="text-[10px] text-[#8a92a6]">Equipes & Elencos</p></div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const hero = (
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
            <span className="block whitespace-nowrap mt-1 sm:mt-2">
              <span className="text-[#e50914]">ESPORTE</span> É AQUI.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
            Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4
