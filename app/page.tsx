'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NoticiaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tag: string;
  imagem?: string;
}

interface AtletaItem {
  id: string;
  nome: string;
  modalidade: string;
  equipe: string;
  destaque: string;
  imagem?: string;
}

const NOTICIAS_PADRAO: NoticiaItem[] = [
  {
    id: 'noticia-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional com câmaras IA.',
    categoria: 'BROADCAST',
    tag: 'AO VIVO',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva do Vale.',
    categoria: 'PROJETO VALE',
    tag: 'DESTAQUE',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO DESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível técnico de todas as competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'OFICIAL',
    imagem: '/fundo-arena.jpg'
  }
];

const ATLETAS_PADRAO: AtletaItem[] = [
  {
    id: 'atleta-1',
    nome: 'MATHEUS SILVA',
    modalidade: 'FUTSAL ADULTO',
    equipe: 'VALE FC',
    destaque: 'Artilheiro da Temporada · 18 Golos',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'atleta-2',
    nome: 'GABRIEL SOUZA',
    modalidade: 'FUTEBOL 7',
    equipe: 'ATLÉTICO VALE',
    destaque: 'Melhor Guarda-Redes do Circuito',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'atleta-3',
    nome: 'LUCAS OLIVEIRA',
    modalidade: 'BASQUETEBOL',
    equipe: 'VALE HOOPS',
    destaque: 'MVP da Etapa Regional',
    imagem: '/fundo-arena.jpg'
  }
];

export default function HomePage() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(0);

  const [noticiasPublicas, setNoticiasPublicas] = useState<NoticiaItem[]>(NOTICIAS_PADRAO);
  const [atletasPublicos, setAtletasPublicos] = useState<AtletaItem[]>(ATLETAS_PADRAO);

  useEffect(() => {
    try {
      const n = localStorage.getItem('arenavale_noticias');
      if (n) setNoticiasPublicas(JSON.parse(n));

      const a = localStorage.getItem('arenavale_atletas');
      if (a) setAtletasPublicos(JSON.parse(a));
    } catch {
      // Fallback
    }
  }, []);

  const modalidades = [
    {
      id: 'futsal',
      nome: 'Futsal',
      tituloOficial: 'Circuito Arena Vale de Futsal 2026',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra. O Circuito Arena Vale organiza a temporada em fase de grupos seguida de mata-mata, com transmissão ao vivo das principais partidas pela TV Arena Vale.',
      statusBadge: 'CIRCUITO 2026',
      detalhes: [
        'Categorias: Sub-15, Sub-20, Livre (adulto) e Master (35+)',
        'Formato: fase de grupos + mata-mata eliminatório',
        'Duração da partida: 2 tempos de 20 minutos (base) ou 25 minutos (Livre/Master)',
        'Local: ginásios parceiros da região do Vale'
      ]
    },
    {
      id: 'fut7',
      nome: 'Futebol 7',
      tituloOficial: 'Copa Arena Vale de Futebol 7',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Disputado em campos society, o futebol 7 é ideal para quem busca um futebol mais dinâmico, com espaços reduzidos e jogadas rápidas. A Copa reúne times amadores e semiprofissionais em uma disputa equilibrada ao longo da temporada.',
      statusBadge: 'PRÉ-TEMPORADA',
      detalhes: [
        'Categorias: Livre (adulto) e Sub-17',
        'Formato: fase de grupos + mata-mata eliminatório',
        'Duração da partida: 2 tempos de 25 minutos',
        'Local: campos society parceiros'
      ]
    },
    {
      id: 'basquete',
      nome: 'Basquetebol',
      tituloOficial: 'Liga Arena Vale de Basquete',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'A liga de basquete valoriza o preparo físico e técnico dos atletas, com jogos disputados em quadras cobertas e cronometragem oficial. É uma das modalidades com maior crescimento de público nas transmissões da Arena Vale.',
      statusBadge: 'EM PLANEAMENTO',
      detalhes: [
        'Categorias: Sub-17 e Livre (adulto)',
        'Formato: pontos corridos (turno único) + fase final com os 4 melhores',
        'Duração da partida: 4 quartos de 10 minutos',
        'Local: ginásios parceiros da região do Vale'
      ]
    },
    {
      id: 'volei',
      nome: 'Voleibol',
      tituloOficial: 'Torneio Arena Vale de Vôlei',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O vôlei reúne equipes masculinas e femininas em um torneio disputado em sistema de melhor de 3 ou 5 sets, com arbitragem oficial e cobertura completa das principais partidas.',
      statusBadge: 'PROJETOS ABERTOS',
      detalhes: [
        'Categorias: Masculino e Feminino, Livre (adulto)',
        'Formato: fase de grupos + mata-mata (melhor de 3 sets) + final (melhor de 5 sets)',
        'Local: ginásios parceiros da região do Vale'
      ]
    }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <>
      <div id="topo" className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
            
            {/* LOGOTIPO CLICÁVEL (DIRETO PARA /login) */}
            <div className="flex items-center shrink-0">
              <Link href="/login" title="Portal do Proprietário (Admin)" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400/30 via-white/10 to-transparent opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />
                <img src="/logo 02.png" alt="Portal do Proprietário" className="relative h-12 sm:h-16 md:h-[80px] w-auto object-contain rounded-xl mix-blend-lighten contrast-110 drop-shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
              </Link>
            </div>

            <nav className="hidden xl:flex items-center gap-7 2xl:gap-9 text-sm font-black uppercase tracking-[0.12em] text-[#b8c0d4]">
              <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
              <Link href="/tv" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition"><span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shadow-[0_0_8px_#e50914] shrink-0" /> TV Arena Vale</Link>
              <Link href="#noticias" className="hover:text-white whitespace-nowrap transition">Notícias</Link>
              <Link href="/agenda" className="hover:text-white whitespace-nowrap transition">Agenda</Link>
              <Link href="#campeonatos" className="hover:text-white whitespace-nowrap transition">Campeonatos</Link>
              <Link href="/atletasdestaques" className="hover:text-white whitespace-nowrap transition">Atletas Destaque</Link>
              <Link href="#projetosocial" className="hover:text-white whitespace-nowrap transition">Projeto Social</Link>
            </nav>

            <div className="hidden xl:flex items-center gap-4 shrink-0">
              <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-7 py-3 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-[#e50914]/30 transition hover:scale-105 hover:shadow-[#e50914]/50 whitespace-nowrap">Anuncie</a>
              
              {/* MENU DROPDOWN DE ACESSO AOS PORTAIS (BOTÃO: PORTAIS) */}
              <div className="relative">
                <button type="button" onClick={() => setMenuPainelAberto(!menuPainelAberto)} className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/50 bg-amber-500/10 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-amber-300 transition hover:bg-amber-500/20 whitespace-nowrap shadow-lg"><span>🔒 PORTAIS</span> <span className="text-[10px]">▼</span></button>
                {menuPainelAberto && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/15 bg-[#0e1118]/98 p-3 shadow-2xl backdrop-blur-2xl z-50 space-y-2" onMouseLeave={() => setMenuPainelAberto(false)}>
                    
                    {/* Coordenador - OURO */}
                    <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/60 bg-[#07080c] p-1 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                        <img src="/logo 02.png" alt="Coordenador" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.85] saturate-[3.5] hue-rotate-[-15deg]" />
                      </div>
                      <div><span className="font-black text-amber-400 group-hover:underline transition text-xs uppercase block">Coordenador</span><span className="text-[9px] text-[#8a92a6]">Ouro</span></div>
                    </Link>

                    {/* Moderador - PRATA */}
                    <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300/60 bg-[#07080c] p-1 shadow-[0_0_10px_rgba(203,213,225,0.3)]">
                        <img src="/logo 02.png" alt="Moderador" className="h-full w-full object-contain mix-blend-lighten filter grayscale brightness-125" />
                      </div>
                      <div><span className="font-black text-slate-200 group-hover:underline transition text-xs uppercase block">Moderador</span><span className="text-[9px] text-[#8a92a6]">Prata</span></div>
                    </Link>

                    {/* Capitão - BRONZE */}
                    <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-700/60 bg-[#07080c] p-1 shadow-[0_0_10px_rgba(180,83,9,0.3)]">
                        <img src="/logo 02.png" alt="Capitão" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.9] saturate-[2] hue-rotate-[10deg] brightness-90" />
                      </div>
                      <div><span className="font-black text-amber-600 group-hover:underline transition text-xs uppercase block">Capitão</span><span className="text-[9px] text-[#8a92a6]">Bronze</span></div>
                    </Link>

                  </div>
                )}
              </div>

            </div>
            <div className="flex xl:hidden items-center gap-2.5">
              <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 whitespace-nowrap">Anuncie</a>
              <button type="button" onClick={() => setMenuMobileAberto(true)} aria-label="Abrir Menu" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white active:scale-95 transition-transform"><div className="flex flex-col gap-1.5 w-5 pointer-events-none"><span className="h-0.5 w-full bg-white rounded-full"></span><span className="h-0.5 w-full bg-[#e50914] rounded-full"></span><span className="h-0.5 w-full bg-white rounded-full"></span></div></button>
            </div>
          </div>
        </header>

        {menuMobileAberto && (
          <div className="xl:hidden fixed inset-0 z-[9999] bg-[#07080c]/98 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <img src="/logo 02.png" alt="Arena Vale" className="h-14 w-auto object-contain rounded-lg mix-blend-lighten" />
                <button type="button" onClick={() => setMenuMobileAberto(false)} aria-label="Fechar Menu" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white text-2xl font-bold active:scale-95 transition-transform">✕</button>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Navegação Oficial</p>
              <nav className="flex flex-col gap-3 text-lg font-black uppercase tracking-wide">
                <Link href="#inicio" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-white border-b border-white/5">Início</Link>
                <Link href="/tv" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-white border-b border-white/5 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse" /> TV Arena Vale</Link>
                <Link href="/agenda" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Agenda</Link>
                <Link href="/patrocinio" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-amber-400 border-b border-white/5">Seja Patrocinador</Link>
                <Link href="#campeonatos" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Campeonatos</Link>
              </nav>
            </div>
            <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Portais de Acesso:</p>
              <Link href="/login" onClick={() => setMenuMobileAberto(false)} className="block text-center w-full rounded-xl border border-amber-400/50 bg-[#07080c] py-3 text-xs font-black uppercase text-amber-400">Coordenador (Ouro)</Link>
              <Link href="/login" onClick={() => setMenuMobileAberto(false)} className="block text-center w-full rounded-xl border border-slate-300/50 bg-[#07080c] py-3 text-xs font-black uppercase text-slate-200">Moderador (Prata)</Link>
              <Link href="/login" onClick={() => setMenuMobileAberto(false)} className="block text-center w-full rounded-xl border border-amber-700/50 bg-[#07080c] py-3 text-xs font-black uppercase text-amber-600">Capitão (Bronze)</Link>
            </div>
          </div>
        )}

        <section id="inicio" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
          <div className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-[#11141d] shadow-[0_25px_70px_rgba(0,0,0,0.75)] flex flex-col justify-end p-6 sm:p-14">
            <img src="/fundo-arena.jpg" alt="Arena Vale" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/95 via-[#07080c]/45 to-transparent" />
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-3.5 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> COBERTURA & TRANSMISSÃO OFICIAL</div>
              <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight"><span className="block whitespace-nowrap">O PALCO DO</span><span className="block whitespace-nowrap mt-1 sm:mt-2"><span className="text-[#e50914]">ESPORTE</span> É AQUI.</span></h1>
              <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-xl text-[#cad0e0] leading-relaxed">Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.</p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4"><Link href="/tv" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-[#e50914]/30 transition hover:scale-105"><span>▶</span> TRANSMISSÕES</Link><a href="#campeonatos" className="rounded-full border border-white/20 bg-white/5 px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40">VER CAMPEONATOS →</a></div>
            </div>
          </div>
        </section>

        {/* SECÇÃO TV ARENA VALE */}
        <section className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">TV ARENA VALE · BROADCAST</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">SINAL AO VIVO & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">VÍDEOS</span></h2>
              </div>
              <a href="https://www.youtube.com/@TVArenaVale" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-[#e50914]/60 bg-[#e50914]/10 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#e50914] transition shadow-lg shadow-[#e50914]/15"><span>▶</span> Canal YouTube ↗</a>
            </div>
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3"><span className="inline-flex items-center gap-2 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white"><span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-ping" /> SINAL AO VIVO</span></div>
              <div className="relative mx-auto max-w-4xl aspect-video overflow-hidden rounded-3xl border border-white/10 bg-[#07080c] shadow-2xl flex flex-col items-center justify-center p-6 text-center group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/50 to-transparent" />
                <div className="relative z-10 flex flex-col items-center max-w-md">
                  <img src="/logo 02.png" alt="TV Arena Vale" className="h-24 sm:h-32 w-auto object-contain mb-4 mix-blend-lighten group-hover:scale-105 transition-transform duration-300" />
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">TRANSMISSAO AO VIVO</h3>
                  <a href="https://www.youtube.com/@TVArenaVale" target="_blank" rel="noreferrer" className="mt-5 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-7 py-3 text-xs font-black uppercase tracking-wider text-white hover:scale-105 transition shadow-lg shadow-[#e50914]/30">ASSISTIR A TRANSMISSAO ↗</a>
                </div>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-white/5">
               <Link href="/tv" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white hover:bg-white/10 transition shadow-lg">
                  ACESSE O CATÁLOGO COMPLETO DA TV ARENA VALE ↗
               </Link>
            </div>
          </div>
        </section>

        {/* SECÇÃO APP */}
        <section id="app" className="border-t border-white/5 bg-gradient-to-br from-[#12151f] via-[#0b0d14] to-[#07080c] px-4 sm:px-6 py-20 text-center">
          <div className="mx-auto max-w-5xl flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-4">NOVIDADE NA ÁREA · APLICATIVO OFICIAL</span>
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-white leading-tight">BAIXE O APLICATIVO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#e50914]">ARENA VALE</span></h2>
            <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl mx-auto uppercase">Tudo o que você precisa para gerir equipes, acompanhar campeonatos e solicitar serviços diretamente na palma da sua mão.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="https://wa.me/5547988444404?text=Olá,%20quero%20saber%20mais%20sobre%20o%20aplicativo%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-4 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-amber-500/20 hover:scale-105 transition">INSTALAR O APP ↗</a>
            </div>
          </div>
        </section>

        {/* SECÇÃO NOTICIAS */}
        <section id="noticias" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 overflow-hidden">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-2"><span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" /><span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">AGORA NA ARENA · BROADCAST</span></div>
              <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">CONTEÚDO & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">COBERTURA</span></h2>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-end"><span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">EDIÇÃO 2026</span><span className="h-2 w-2 rounded-full bg-[#e50914]" /></div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {noticiasPublicas.map((h, index) => (
              <article key={h.id} className="group relative min-h-[430px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70">
                <img src={h.imagem || '/fundo-arena.jpg'} alt={h.titulo} className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:opacity-55 group-hover:mix-blend-normal" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/15 via-transparent to-black/80 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                <span className="pointer-events-none select-none absolute -right-3 top-10 text-7xl font-black italic uppercase tracking-tighter text-white/[0.04] transition-transform duration-500 group-hover:-translate-x-3">{h.categoria}</span>
                <div className="relative z-10 p-6 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block -skew-x-12 bg-[#e50914] px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]"><span className="inline-block skew-x-12">{h.categoria}</span></span>
                    <span className="inline-block -skew-x-12 border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#cad0e0]"><span className="inline-block skew-x-12">{h.tag}</span></span>
                  </div>
                  <span className="text-4xl font-black italic leading-none text-transparent select-none" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}>0{index + 1}</span>
                </div>
                <div className="relative z-10 p-6 pt-0 mt-auto">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1 w-8 bg-[#e50914] transition-all duration-300 group-hover:w-14" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">ARENA PRESS</span>
                  </div>
                  <h3 className="text-2xl sm:text-[26px] font-black italic uppercase leading-[1.08] tracking-tight text-white drop-shadow-md group-hover:text-[#ff2a35] transition-colors">{h.titulo}</h3>
                  <p className="mt-3 text-xs sm:text-sm text-[#b8c0d4] leading-relaxed line-clamp-3 font-medium">{h.descricao}</p>
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <a href="#campeonatos" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-[#e50914] transition"><span>EXPLORAR COBERTURA</span><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] group-hover:bg-[#e50914] group-hover:text-white group-hover:translate-x-1 transition-all">↗</span></a>
                    <img src="/logo 02.png" alt="AV" className="h-10 w-auto object-contain opacity-80 mix-blend-lighten group-hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
              </article>
            ))}
          </div>
        </section>

        {/* SECÇÃO AGENDA */}
        <section className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div className="relative">
                <div className="inline-flex items-center gap-2 mb-2"><span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" /><span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">CALENDÁRIO DESPORTIVO</span></div>
                <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">AGENDA DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">JOGOS</span></h2>
              </div>
              <Link href="/agenda" className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">Ver Agenda Completa ↗</Link>
            </div>
            
            <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#12151f] via-[#0b0d14] to-[#07080c] p-10 sm:p-16 shadow-2xl text-center flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />
               <div className="h-20 w-20 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(229,9,20,0.3)]">📅</div>
               <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">CONFIRA O CALENDÁRIO COMPLETO DE CONFRONTOS</h3>
               <p className="mt-4 text-sm sm:text-base text-[#8a92a6] max-w-2xl uppercase">Acesse a nossa agenda oficial para conferir datas, horários, equipas e locais de todas as partidas de Futsal, Futebol 7, Basquetebol e Voleibol.</p>
               <Link href="/agenda" className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-10 py-4 text-sm font-black uppercase tracking-[0.15em] text-white hover:scale-105 transition shadow-lg shadow-[#e50914]/30">
                  VER AGENDA COMPLETA ↗
               </Link>
            </div>
          </div>
        </section>

        {/* SECÇÃO CAMPEONATOS E MODALIDADES */}
        <section id="campeonatos" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">COMPETIÇÕES OFICIAIS</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">CAMPEONATOS DA TEMPORADA 2026</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {modalidades.map((c, index) => (
              <button key={c.id} type="button" onClick={() => setCampeonatoSelecionado(index)} className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition ${campeonatoSelecionado === index ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30' : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'}`}>{c.nome}</button>
            ))}
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-[#11141d] p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full md:w-auto text-center sm:text-left">
                <div className="flex h-36 w-36 sm:h-44 sm:w-44 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-[#07080c] p-4 shadow-2xl">
                  <img src="/logo 02.png" alt="Modalidade Arena Vale" className="h-full w-full object-contain mix-blend-lighten" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="self-center sm:self-start rounded-full bg-[#e50914]/15 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#e50914]">{ativo.statusBadge}</span>
                  <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white leading-tight">{ativo.tituloOficial}</h3>
                  <p className="text-sm text-emerald-400 font-bold mt-2">{ativo.fase}</p>
                  <p className="mt-3 text-xs sm:text-sm text-[#8a92a6] max-w-2xl leading-relaxed">{ativo.descricao}</p>
                </div>
              </div>
              <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full border border-[#e50914]/40 bg-[#e50914]/15 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#ff1e27] hover:bg-[#e50914] hover:text-white transition shadow-lg shadow-[#e50914]/25 shrink-0">Inscrever Equipe ↗</a>
            </div>
          </div>
        </section>

        {/* RODAPÉ */}
        <footer className="border-t border-white/10 bg-[#050609] px-6 py-14">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">
            <img src="/logo 02.png" alt="Arena Vale Oficial" className="h-16 sm:h-20 w-auto object-contain mb-6 mix-blend-lighten drop-shadow-[0_0_20px_rgba(229,9,20,0.25)]" />
            <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#555d6e]">
              <span>© 2026 Arena Vale · Mídia Desportiva & Eventos. Todos os direitos reservados.</span>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-4">
                <Link href="/patrocinio" className="hover:text-white transition underline underline-offset-4 decoration-amber-400/40 text-amber-400 font-bold">Seja Patrocinador</Link>
                <Link href="/privacidade" className="hover:text-white transition underline underline-offset-4 decoration-white/20">Política de Privacidade</Link>
                <Link href="/termos" className="hover:text-white transition underline underline-offset-4 decoration-white/20">Termos de Uso</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
