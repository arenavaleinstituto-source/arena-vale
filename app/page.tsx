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
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-
