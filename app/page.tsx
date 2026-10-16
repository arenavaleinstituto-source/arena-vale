'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  youtubeId: string;
  titulo: string;
  formato: 'widescreen' | 'shorts';
}

interface NoticiaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tag: string;
  imagem?: string;
}

interface JogoItem {
  id: string;
  dataHora: string;
  equipeA: string;
  equipeB: string;
  modalidade: string;
  local: string;
  status: string;
}

interface AtletaItem {
  id: string;
  nome: string;
  modalidade: string;
  equipe: string;
  destaque: string;
  imagem?: string;
}

const VIDEOS_PADRAO: VideoItem[] = [
  {
    id: 'default-1',
    youtubeId: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem · TV Arena Vale',
    formato: 'widescreen'
  }
];

const NOTICIAS_PADRAO: NoticiaItem[] = [
  {
    id: 'noticia-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional com câmaras IA.',
    categoria: 'BROADCAST',
    tag: 'AO VIVO',
    imagem: '/foto-pro-site-1.png'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva do Vale.',
    categoria: 'PROJETO VALE',
    tag: 'DESTAQUE',
    imagem: '/foto-pro-site-1.png'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO DESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível técnico de todas as competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'OFICIAL',
    imagem: '/foto-pro-site-1.png'
  }
];

const JOGOS_PADRAO: JogoItem[] = [
  {
    id: 'jogo-1',
    dataHora: 'SÁBADO · 19:30',
    equipeA: 'EQUIPE AZUL',
    equipeB: 'EQUIPE BRANCA',
    modalidade: 'FUTSAL REGIONAL',
    local: 'ARENA MULTIUSO',
    status: 'TRANSMISSÃO AO VIVO'
  }
];

const ATLETAS_PADRAO: AtletaItem[] = [
  {
    id: 'atleta-1',
    nome: 'MATHEUS SILVA',
    modalidade: 'FUTSAL ADULTO',
    equipe: 'VALE FC',
    destaque: 'Artilheiro da Temporada · 18 Golos',
    imagem: '/foto-pro-site-1.png'
  },
  {
    id: 'atleta-2',
    nome: 'GABRIEL SOUZA',
    modalidade: 'FUTEBOL 7',
    equipe: 'ATLÉTICO VALE',
    destaque: 'Melhor Guarda-Redes do Circuito',
    imagem: '/foto-pro-site-1.png'
  },
  {
    id: 'atleta-3',
    nome: 'LUCAS OLIVEIRA',
    modalidade: 'BASQUETEBOL',
    equipe: 'VALE HOOPS',
    destaque: 'MVP da Etapa Regional',
    imagem: '/foto-pro-site-1.png'
  }
];

export default function HomePage() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(0);

  const [videosPublicos, setVideosPublicos] = useState<VideoItem[]>(VIDEOS_PADRAO);
  const [noticiasPublicas, setNoticiasPublicas] = useState<NoticiaItem[]>(NOTICIAS_PADRAO);
  const [jogosPublicos, setJogosPublicos] = useState<JogoItem[]>(JOGOS_PADRAO);
  const [atletasPublicos, setAtletasPublicos] = useState<AtletaItem[]>(ATLETAS_PADRAO);

  useEffect(() => {
    try {
      const v = localStorage.getItem('arenavale_videos');
      if (v) setVideosPublicos(JSON.parse(v));

      const n = localStorage.getItem('arenavale_noticias');
      if (n) setNoticiasPublicas(JSON.parse(n));

      const j = localStorage.getItem('arenavale_agenda');
      if (j) setJogosPublicos(JSON.parse(j));

      const a = localStorage.getItem('arenavale_atletas');
      if (a) setAtletasPublicos(JSON.parse(a));
    } catch {
      // Fallback
    }
  }, []);

  const modalidades = [
    { id: 'futsal', nome: 'Futsal', fase: 'Em Breve · Temporada 2026', descricao: 'Circuitos regionais de alto rendimento e categorias de base no Vale.', statusBadge: 'CIRCUITO 2026' },
    { id: 'basquete', nome: 'Basquetebol', fase: 'Em Breve · Temporada 2026', descricao: 'Competições abertas, clínicas desportivas e etapas regionais oficiais.', statusBadge: 'EM PLANEAMENTO' },
    { id: 'fut7', nome: 'Futebol 7', fase: 'Em Breve · Temporada 2026', descricao: 'Torneios intermunicipais com transmissão ao vivo e cobertura multimédia completa.', statusBadge: 'PRÉ-TEMPORADA' },
    { id: 'volei', nome: 'Voleibol', fase: 'Em Breve · Temporada 2026', descricao: 'Circuito regional e integração comunitária através do desporto.', statusBadge: 'PROJETOS ABERTOS' }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <div id="topo" className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-5">
          <div className="flex items-center shrink-0">
            <Link href="/proprietario" title="Painel Exclusivo" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e50914]/30 via-white/10 to-transparent opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />
              {/* LOGO AMPLIADA EM 3X */}
              <img src="/logo 02.png" alt="Arena Vale Oficial" className="relative h-16 sm:h-24 md:h-[110px] w-auto object-contain rounded-xl mix-blend-lighten contrast-110 drop-shadow-[0_0_25px_rgba(229,9,20,0.35)]" />
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-7 2xl:gap-9 text-sm font-black uppercase tracking-[0.12em] text-[#b8c0d4]">
            <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
            <Link href="#aovivo" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shadow-[0_0_8px_#e50914] shrink-0" /> YouTube / Ao Vivo
            </Link>
            <Link href="#noticias" className="hover:text-white whitespace-nowrap transition">Notícias</Link>
            <Link href="#agenda" className="hover:text-white whitespace-nowrap transition">Agenda</Link>
            <Link href="#campeonatos" className="hover:text-white whitespace-nowrap transition">Campeonatos</Link>
            <Link href="/atletasdestaques" className="hover:text-white whitespace-nowrap transition">Atletas Destaque</Link>
            <Link href="#projetosocial" className="hover:text-white whitespace-nowrap transition">Projeto Social</Link>
          </nav>
          <div className="hidden xl:flex items-center gap-4 shrink-0">
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-7 py-3 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-[#e50914]/30 transition hover:scale-105 hover:shadow-[#e50914]/50 whitespace-nowrap">Anuncie</a>
            <div className="relative">
              <button type="button" onClick={() => setMenuPainelAberto(!menuPainelAberto)} className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-[#e50914] hover:bg-white/[0.08] whitespace-nowrap">
                <span>Painel</span> <span className="text-[10px] text-[#e50914]">▼</span>
              </button>
              {menuPainelAberto && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/15 bg-[#0e1118]/95 p-2 shadow-2xl backdrop-blur-2xl z-50" onMouseLeave={() => setMenuPainelAberto(false)}>
                  <Link href="/coordenador" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-[#07080c] p-1 shadow-md shadow-amber-500/20 group-hover:border-amber-300">
                      <img src="/logo 02.png" alt="Coordenador" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.85] saturate-[3.5] hue-rotate-[-15deg] brightness-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white group-hover:text-amber-300 transition text-xs uppercase tracking-wider">Coordenador</span>
                      <span className="text-[10px] text-amber-400/80 font-medium">Gestão Ouro</span>
                    </div>
                  </Link>
                  <Link href="/inscricao" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300/40 bg-[#07080c] p-1 shadow-md shadow-slate-300/15 group-hover:border-slate-100">
                      <img src="/logo 02.png" alt="Capitão" className="h-full w-full object-contain mix-blend-lighten filter grayscale contrast-125 brightness-125" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white group-hover:text-slate-200 transition text-xs uppercase tracking-wider">Capitão</span>
                      <span className="text-[10px] text-slate-400 font-medium">Acesso Prata</span>
                    </div>
                  </Link>
                  <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cd7f32]/50 bg-[#07080c] p-1 shadow-md shadow-[#cd7f32]/20 group-hover:border-[#e08e45]">
                      <img src="/logo 02.png" alt="Moderador" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.9] saturate-[2.5] hue-rotate-[-30deg] contrast-125" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white group-hover:text-[#e08e45] transition text-xs uppercase tracking-wider">Moderador</span>
                      <span className="text-[10px] text-[#cd7f32] font-medium">Acesso Bronze</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex xl:hidden items-center gap-2.5">
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 whitespace-nowrap">Anuncie</a>
            <button type="button" onClick={() => setMenuMobileAberto(true)} aria-label="Abrir Menu" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white active:scale-95 transition-transform">
              <div className="flex flex-col gap-1.5 w-5 pointer-events-none">
                <span className="h-0.5 w-full bg-white rounded-full"></span>
                <span className="h-0.5 w-full bg-[#e50914] rounded-full"></span>
                <span className="h-0.5 w-full bg-white rounded-full"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {menuMobileAberto && (
        <div className="xl:hidden fixed inset-0 z-[9999] bg-[#07080c]/98 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <img src="/logo 02.png" alt="Arena Vale" className="h-16 w-auto object-contain rounded-lg mix-blend-lighten" />
              <button type="button" onClick={() => setMenuMobileAberto(false)} aria-label="Fechar Menu" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white text-2xl font-bold active:scale-95 transition-transform">✕</button>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Navegação Oficial</p>
            <nav className="flex flex-col gap-3 text-lg font-black uppercase tracking-wide">
              <Link href="#inicio" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-white border-b border-white/5">Início</Link>
              <Link href="#aovivo" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-white border-b border-white/5 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse" /> YouTube / Ao Vivo</Link>
              <Link href="#noticias" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Notícias</Link>
              <Link href="#agenda" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Agenda</Link>
              <Link href="#campeonatos" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Campeonatos</Link>
              <Link href="/atletasdestaques" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Atletas Destaque</Link>
              <Link href="#projetosocial" onClick={() => setMenuMobileAberto(false)} className="py-2.5 text-[#cad0e0] border-b border-white/5">Projeto Social</Link>
            </nav>
          </div>
          <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#8a92a6]">Área Restrita (Painel)</p>
            <div className="grid grid-cols-3 gap-2.5">
              <Link href="/coordenador" onClick={() => setMenuMobileAberto(false)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-400/30 bg-amber-500/10 text-center text-xs font-bold text-white">
                <div className="h-9 w-12 mb-1.5 flex items-center justify-center rounded bg-[#07080c] p-1"><img src="/logo 02.png" alt="Coord" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.85] saturate-[3.5] hue-rotate-[-15deg]" /></div>
                <span className="text-amber-300 font-black">Coord</span>
              </Link>
              <Link href="/inscricao" onClick={() => setMenuMobileAberto(false)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-300/30 bg-slate-200/10 text-center text-xs font-bold text-white">
                <div className="h-9 w-12 mb-1.5 flex items-center justify-center rounded bg-[#07080c] p-1"><img src="/logo 02.png" alt="Capitão" className="h-full w-full object-contain mix-blend-lighten filter grayscale contrast-125 brightness-125" /></div>
                <span className="text-slate-200 font-black">Capitão</span>
              </Link>
              <Link href="/login" onClick={() => setMenuMobileAberto(false)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#cd7f32]/40 bg-[#cd7f32]/10 text-center text-xs font-bold text-white">
                <div className="h-9 w-12 mb-1.5 flex items-center justify-center rounded bg-[#07080c] p-1"><img src="/logo 02.png" alt="Mod" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.9] saturate-[2.5] hue-rotate-[-30deg]" /></div>
                <span className="text-[#e08e45] font-black">Mod</span>
              </Link>
            </div>
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="block text-center w-full rounded-full bg-[#e50914] py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 mt-2">Falar no WhatsApp Oficial ↗</a>
          </div>
        </div>
      )}

      <section id="inicio" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
        <div className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-[#11141d] shadow-[0_25px_70px_rgba(0,0,0,0.75)] flex flex-col justify-end p-6 sm:p-14">
          <img src="/foto-pro-site-1.png" alt="Arena Vale" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/95 via-[#07080c]/45 to-transparent" />
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-3.5 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> COBERTURA & TRANSMISSÃO OFICIAL
            </div>
            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight">
              <span className="block whitespace-nowrap">O PALCO DO</span>
              <span className="block whitespace-nowrap mt-1 sm:mt-2"><span className="text-[#e50914]">ESPORTE</span> É AQUI.</span>
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-xl text-[#cad0e0] leading-relaxed">Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.</p>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <a href="#aovivo" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-[#e50914]/30 transition hover:scale-105"><span>▶</span> TRANSMISSÕES</a>
              <a href="#campeonatos" className="rounded-full border border-white/20 bg-white/5 px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40">VER CAMPEONATOS →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="aovivo" className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">TV ARENA VALE · BROADCAST</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">VÍDEOS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">TRANSMISSÕES</span></h2>
            </div>
            <a href="https://www.youtube.com/@TVArenaVale" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-[#e50914]/60 bg-[#e50914]/10 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#e50914] transition shadow-lg shadow-[#e50914]/15"><span>▶</span> Canal YouTube ↗</a>
          </div>
          <div className="mb-12">
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
          <div className="border-t border-white/5 pt-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-wider text-white">DESTAQUES DA SEMANA</h3>
              <span className="text-xs font-black uppercase tracking-widest text-[#8a92a6]">16:9 CINEMA</span>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videosPublicos.map((v) => (
                <div key={v.id} className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70">
                  <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-white/30 z-10 transition-colors group-hover:border-[#e50914]" />
                  <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-white/30 z-10 transition-colors group-hover:border-[#e50914]" />
                  <div className={`relative ${v.formato === 'shorts' ? 'aspect-[9/16] max-h-96' : 'aspect-video'} w-full overflow-hidden bg-black flex items-center justify-center`}>
                    <iframe className={`${v.formato === 'widescreen' ? 'h-[140%] w-[140%] max-w-none' : 'h-full w-full'}`} src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=0&controls=1&modestbranding=1&rel=0`} title={v.titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1 bg-gradient-to-t from-[#07080c] to-[#0c0f17]">
                    <div>
                      <span className="inline-block -skew-x-12 bg-[#e50914] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white mb-2"><span className="inline-block skew-x-12">{v.formato === 'shorts' ? 'SHORTS 9:16' : 'WIDESCREEN 16:9'}</span></span>
                      <h4 className="text-lg font-black italic uppercase text-white leading-snug group-hover:text-[#ff2a35] transition-colors">{v.titulo}</h4>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#8a92a6] font-mono">ID: {v.youtubeId}</span>
                      <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noreferrer" className="font-black uppercase tracking-wider text-white hover:text-[#e50914] transition">Ver no YouTube ↗</a>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="noticias" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 overflow-hidden">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-2"><span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" /><span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">AGORA NA ARENA · BROADCAST</span></div>
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">CONTEÚDO & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">COBERTURA</span></h2>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-end">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8a92a6]">EDIÇÃO 2026</span>
            <span className="h-2 w-2 rounded-full bg-[#e50914]" />
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {noticiasPublicas.map((h, index) => (
            <article key={h.id} className="group relative min-h-[430px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70">
              <img src={h.imagem || '/foto-pro-site-1.png'} alt={h.titulo} className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:opacity-55 group-hover:mix-blend-normal" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/15 via-transparent to-black/80 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <span className="pointer-events-none select-none absolute -right-3 top-10 text-7xl font-black italic uppercase tracking-tighter text-white/[0.04] transition-transform duration-500 group-hover:-translate-x-3">{h.categoria}</span>
              <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
              <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
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
                  <img src="/logo 02.png" alt="AV" className="h-8 w-auto object-contain opacity-70 mix-blend-lighten group-hover:opacity-100 transition" />
                </div>
              </div>
              <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
            </article>
          ))}
        </div>
      </section>

      <section id="agenda" className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-2"><span className="h-3 w-1.5 bg-[#e50914] -skew-x-1
