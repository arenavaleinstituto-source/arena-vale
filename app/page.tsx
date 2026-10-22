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
    imagem: '/foto-pro-site-1.png'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva do Vale.',
    categoria: 'PROJETO VALE',
    tag: 'DESTAQUE',
    imagem: '/foto-pro-site-1.png'
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
    { id: 'futsal', nome: 'Futsal', fase: 'Em Breve · Temporada 2026', descricao: 'Circuitos regionais de alto rendimento.', statusBadge: 'CIRCUITO 2026' },
    { id: 'fut7', nome: 'Futebol 7', fase: 'Em Breve · Temporada 2026', descricao: 'Torneios intermunicipais com transmissão.', statusBadge: 'PRÉ-TEMPORADA' }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <div id="topo" className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 py-3">
          <div className="flex items-center shrink-0">
            <Link href="/" title="Início" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
              <img src="/logo 02.png" alt="Arena Vale Oficial" className="relative h-12 w-auto object-contain rounded-xl mix-blend-lighten contrast-110 drop-shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-7 text-sm font-black uppercase tracking-[0.12em] text-[#b8c0d4]">
            <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
            <Link href="/tv" className="flex items-center gap-2 text-white hover:text-[#e50914] whitespace-nowrap transition"><span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse" /> TV Arena Vale</Link>
            <Link href="/agenda" className="hover:text-white whitespace-nowrap transition">Agenda</Link>
          </nav>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/login" className="inline-flex items-center gap-2.5 rounded-full border border-[#e50914]/50 bg-[#e50914]/10 px-6 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-[#ff4b52] transition hover:bg-[#e50914] hover:text-white">
              ACESSO RESTRITO 🔒
            </Link>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto max-w-7xl px-4 pt-6 pb-12">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#11141d] shadow-[0_25px_70px_rgba(0,0,0,0.75)] flex flex-col justify-end p-6 sm:p-14">
          <img src="/foto-pro-site-1.png" alt="Arena Vale" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent" />
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-white"><span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> COBERTURA & TRANSMISSÃO OFICIAL</div>
            <h1 className="mt-4 text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight"><span className="block">O PALCO DO</span><span className="block mt-1"><span className="text-[#e50914]">ESPORTE</span> É AQUI.</span></h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-lg text-[#cad0e0] leading-relaxed">Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3"><Link href="/tv" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-6 py-3.5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-xl hover:scale-105"><span>▶</span> TRANSMISSÕES</Link></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050609] px-6 py-10 text-center">
        <img src="/logo 02.png" alt="Arena Vale Oficial" className="h-12 w-auto object-contain mx-auto mb-4 mix-blend-lighten" />
        <p className="text-xs text-[#555d6e]">© 2026 Arena Vale · Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
