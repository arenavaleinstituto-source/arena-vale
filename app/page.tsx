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
    imagem: '/CAPA.png'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva do Vale.',
    categoria: 'PROJETO VALE',
    tag: 'DESTAQUE',
    imagem: '/CAPA.png'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO DESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível técnico de todas as competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'OFICIAL',
    imagem: '/CAPA.png'
  }
];

const ATLETAS_PADRAO: AtletaItem[] = [
  {
    id: 'atleta-1',
    nome: 'MATHEUS SILVA',
    modalidade: 'FUTSAL ADULTO',
    equipe: 'VALE FC',
    destaque: 'Artilheiro da Temporada · 18 Golos',
    imagem: '/CAPA.png'
  },
  {
    id: 'atleta-2',
    nome: 'GABRIEL SOUZA',
    modalidade: 'FUTEBOL 7',
    equipe: 'ATLÉTICO VALE',
    destaque: 'Melhor Guarda-Redes do Circuito',
    imagem: '/CAPA.png'
  },
  {
    id: 'atleta-3',
    nome: 'LUCAS OLIVEIRA',
    modalidade: 'BASQUETEBOL',
    equipe: 'VALE HOOPS',
    destaque: 'MVP da Etapa Regional',
    imagem: '/CAPA.png'
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
    { id: 'futsal', nome: 'Futsal', fase: 'Em Breve · Temporada 2026', descricao: 'Circuitos regionais de alto rendimento e categorias de base no Vale.', statusBadge: 'CIRCUITO 2026' },
    { id: 'basquete', nome: 'Basquetebol', fase: 'Em Breve · Temporada 2026', descricao: 'Competições abertas, clínicas desportivas e etapas regionais oficiais.', statusBadge: 'EM PLANEAMENTO' },
    { id: 'fut7', nome: 'Futebol 7', fase: 'Em Breve · Temporada 2026', descricao: 'Torneios intermunicipais com transmissão ao vivo e cobertura multimédia completa.', statusBadge: 'PRÉ-TEMPORADA' },
    { id: 'volei', nome: 'Voleibol', fase: 'Em Breve · Temporada 2026', descricao: 'Circuito regional e integração comunitária através do desporto.', statusBadge: 'PROJETOS ABERTOS' }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <div id="topo" className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center shrink-0">
            <Link href="/" title="Início" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e50914]/30 via-white/10 to-transparent opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />
              <img src="/logo 02.png" alt="Arena Vale Oficial" className="relative h-12 sm:h-16 md:h-[80px] w-auto object-contain rounded-xl mix-blend-lighten contrast-110 drop-shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
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
            <div className="relative">
              <button type="button" onClick={() => setMenuPainelAberto(!menuPainelAberto)} className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-[#e50914] hover:bg-white/[0.08] whitespace-nowrap"><span>Painel</span> <span className="text-[10px] text-[#e50914]">▼</span></button>
              {menuPainelAberto && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/15 bg-[#0e1118]/95 p-2 shadow-2xl backdrop-blur-2xl z-50" onMouseLeave={() => setMenuPainelAberto(false)}>
                  <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-[#07080c] p-1 shadow-md shadow-amber-500/20 group-hover:border-amber-300"><img src="/logo 02.png" alt="Acesso" className="h-full w-full object-contain mix-blend-lighten filter sepia-[0.85] saturate-[3.5] hue-rotate-[-15deg] brightness-110" /></div>
                    <div className="flex flex-col"><span className="font-black text-white group-hover:text-amber-300 transition text-xs uppercase tracking-wider">Acessar Portal</span><span className="text-[10px] text-amber-400/80 font-medium">Gestão & Inscrições</span></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex xl:hidden items-center gap-2.5">
            <a href="https://wa.me/5547988444404" target="_
