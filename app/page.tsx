import React from 'react';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import LiveSection from '@/components/LiveSection';
import HighlightsSection from '@/components/HighlightsSection';
import TournamentsSection from '@/components/TournamentsSection';
import SponsorsSection from '@/components/SponsorsSection';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Arena Vale Sports | O Esporte do Vale ao Vivo & em Destaque',
  description: 'Plataforma oficial de torneios regionais, cobertura ao vivo, súmulas digitais e galeria de atletas em destaque da Arena Vale.'
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      {/* 1. BARRA DE NAVEGAÇÃO OFICIAL */}
      <Nav />

      {/* 2. HERO BANNER PRINCIPAL COM OS ATLETAS */}
      <Hero />

      {/* 3. TRANSMISSÕES AO VIVO & TV ARENA */}
      <LiveSection />

      {/* 4. GALERIA DE ATLETAS EM DESTAQUE */}
      <HighlightsSection />

      {/* 5. TABELAS & CAMPEONATOS REGIONAIS */}
      <TournamentsSection />

      {/* 6. APOIADORES & PATROCINADORES OFICIAIS */}
      <SponsorsSection />

      {/* 7. RODAPÉ INSTITUCIONAL */}
      <Footer />
    </main>
  );
}
