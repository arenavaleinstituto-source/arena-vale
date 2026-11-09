'use client';

import React from 'react';
import Link from 'next/link';

export default function PatrocinioPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#d4d4d8] selection:bg-[#e50914] selection:text-white font-sans">
      {/* CABEÇALHO */}

      {/* CONTEÚDO DE PATROCÍNIO */}
      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        
        {/* APRESENTAÇÃO */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff3b44]">OPORTUNIDADE COMERCIAL EXCLUSIVA</span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            Por que patrocinar a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] via-[#e50914] to-[#e50914]">Arena Vale</span>
          </h1>
          <p className="text-sm sm:text-base text-[#d4d4d8] leading-relaxed uppercase pt-2">
            A Arena Vale conecta sua marca a um público engajado e apaixonado por esporte na região do Vale. Visibilidade garantida em transmissões ao vivo em alta definição, placares eletrônicos, redes sociais oficiais e backdrops de campo — em futsal, futebol 7, basquete e vôlei, o ano inteiro.
          </p>
        </div>

        {/* DETALHE DAS COTAS */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Cota Master */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#e50914]/60 bg-gradient-to-b from-[#e50914]/15 via-[#141417] to-[#0b0b0c] p-8 shadow-2xl relative overflow-hidden group hover:border-[#e50914] transition">
            <div className="absolute top-0 right-0 bg-[#e50914] text-black text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl tracking-wider">DESTAQUE</div>
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Master</h3>
              <p className="text-xs font-bold text-[#ff3b44] uppercase tracking-widest mb-6">Exposição Principal em TV e Campo</p>
              <p className="text-xs sm:text-sm text-[#c3c3cb] leading-relaxed mb-6 uppercase">
                A cota de maior visibilidade da Arena Vale. Sua marca aparece como patrocinadora oficial em todas as transmissões ao vivo da temporada, com presença fixa no placar eletrônico e em todo material de campo (backdrop, faixas).
              </p>
              <ul className="space-y-2.5 text-xs text-[#d4d4d8] mb-8">
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Logo em destaque na abertura e no intervalo de todas as transmissões</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Presença fixa no placar eletrônico durante os jogos</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Backdrop de campo em todos os jogos da temporada</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Menção nas redes sociais oficiais a cada rodada</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Selo de &quot;Patrocinador Master&quot; no site</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Master%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full bg-[#e50914] py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-[#e50914] transition shadow-lg shadow-[#e50914]/20">Garantir Cota Master ↗</a>
          </div>

          {/* Cota Apoio Regional */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.05] via-[#141417] to-[#0b0b0c] p-8 shadow-2xl relative overflow-hidden group hover:border-[#e50914] transition">
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Apoio Regional</h3>
              <p className="text-xs font-bold text-[#e50914] uppercase tracking-widest mb-6">Cota de Transmissão Ao Vivo</p>
              <p className="text-xs sm:text-sm text-[#c3c3cb] leading-relaxed mb-6 uppercase">
                Ideal para marcas regionais que querem presença constante nas transmissões, com um investimento mais acessível que a Cota Master.
              </p>
              <ul className="space-y-2.5 text-xs text-[#d4d4d8] mb-8">
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Logo exibida durante as transmissões ao vivo (inserção periódica)</li>
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Menção no início e encerramento de cada transmissão</li>
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Presença no site, na seção de parceiros</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Apoio%20Regional%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full border border-white/20 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/40 transition">Garantir Apoio Regional ↗</a>
          </div>

          {/* Cota Institucional */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#e50914]/40 bg-gradient-to-b from-[#e50914]/10 via-[#141417] to-[#0b0b0c] p-8 shadow-2xl relative overflow-hidden group hover:border-[#ff3b44] transition">
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Institucional</h3>
              <p className="text-xs font-bold text-[#ff3b44] uppercase tracking-widest mb-6">Parceiros de Apoio ao Esporte</p>
              <p className="text-xs sm:text-sm text-[#c3c3cb] leading-relaxed mb-6 uppercase">
                Para entidades, federações e parceiros de apoio ao esporte regional. Reconhecimento como parceiro institucional oficial da Arena Vale.
              </p>
              <ul className="space-y-2.5 text-xs text-[#d4d4d8] mb-8">
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Logo fixa na seção de parceiros do site</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Associação ao Projeto Social Arena Vale</li>
                <li className="flex items-start gap-2"><span className="text-[#ff3b44] font-bold">✓</span> Menção em releases e materiais institucionais</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Institucional%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full border border-[#e50914]/40 bg-[#e50914]/15 py-3 text-xs font-black uppercase tracking-widest text-[#ff3b44] hover:bg-[#e50914] hover:text-black transition">Garantir Cota Institucional ↗</a>
          </div>

        </div>

        {/* COMO FECHAR UMA COTA */}
        <div className="rounded-3xl border border-white/10 bg-[#0e1118] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xl space-y-6">
          <h3 className="text-xl sm:text-2xl font-black uppercase text-white">Como fechar uma cota</h3>
          <p className="text-xs sm:text-sm text-[#a1a1aa] uppercase leading-relaxed max-w-2xl mx-auto">
            Todo interesse em patrocínio é direcionado para contato direto via WhatsApp, onde a equipe Arena Vale apresenta valores atualizados e disponibilidade de cada cota por temporada.
          </p>
          <a href="https://wa.me/5547988444404?text=Olá,%20quero%20conversar%20sobre%20patrocínio%20na%20Arena%20Vale!" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#e50914] px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:scale-105 transition shadow-lg shadow-[#e50914]/30">
            💬 WhatsApp Patrocínios: (47) 98844-4404 ↗
          </a>
        </div>

      </main>
    </div>
  );
}
