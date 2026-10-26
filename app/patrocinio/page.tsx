'use client';

import React from 'react';
import Link from 'next/link';

export default function PatrocinioPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-[#cad0e0] selection:bg-[#e50914] selection:text-white font-sans">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO DE PATROCÍNIO */}
      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        
        {/* APRESENTAÇÃO */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300">OPORTUNIDADE COMERCIAL EXCLUSIVA</span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tight text-white leading-tight">
            Por que patrocinar a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-[#e50914]">Arena Vale</span>
          </h1>
          <p className="text-sm sm:text-base text-[#cad0e0] leading-relaxed uppercase pt-2">
            A Arena Vale conecta sua marca a um público engajado e apaixonado por esporte na região do Vale. Visibilidade garantida em transmissões ao vivo em alta definição, placares eletrônicos, redes sociais oficiais e backdrops de campo — em futsal, futebol 7, basquete e vôlei, o ano inteiro.
          </p>
        </div>

        {/* DETALHE DAS COTAS */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Cota Master */}
          <div className="flex flex-col justify-between rounded-3xl border border-amber-400/60 bg-gradient-to-b from-amber-500/15 via-[#0c0f17] to-[#07080c] p-8 shadow-2xl relative overflow-hidden group hover:border-amber-300 transition">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl tracking-wider">DESTAQUE</div>
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Master</h3>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">Exposição Principal em TV e Campo</p>
              <p className="text-xs sm:text-sm text-[#b8c0d4] leading-relaxed mb-6 uppercase">
                A cota de maior visibilidade da Arena Vale. Sua marca aparece como patrocinadora oficial em todas as transmissões ao vivo da temporada, com presença fixa no placar eletrônico e em todo material de campo (backdrop, faixas).
              </p>
              <ul className="space-y-2.5 text-xs text-[#cad0e0] mb-8">
                <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">✓</span> Logo em destaque na abertura e no intervalo de todas as transmissões</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">✓</span> Presença fixa no placar eletrônico durante os jogos</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">✓</span> Backdrop de campo em todos os jogos da temporada</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">✓</span> Menção nas redes sociais oficiais a cada rodada</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">✓</span> Selo de &quot;Patrocinador Master&quot; no site</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Master%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full bg-amber-400 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-300 transition shadow-lg shadow-amber-500/20">Garantir Cota Master ↗</a>
          </div>

          {/* Cota Apoio Regional */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.05] via-[#0c0f17] to-[#07080c] p-8 shadow-2xl relative overflow-hidden group hover:border-[#e50914] transition">
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Apoio Regional</h3>
              <p className="text-xs font-bold text-[#e50914] uppercase tracking-widest mb-6">Cota de Transmissão Ao Vivo</p>
              <p className="text-xs sm:text-sm text-[#b8c0d4] leading-relaxed mb-6 uppercase">
                Ideal para marcas regionais que querem presença constante nas transmissões, com um investimento mais acessível que a Cota Master.
              </p>
              <ul className="space-y-2.5 text-xs text-[#cad0e0] mb-8">
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Logo exibida durante as transmissões ao vivo (inserção periódica)</li>
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Menção no início e encerramento de cada transmissão</li>
                <li className="flex items-start gap-2"><span className="text-[#e50914] font-bold">✓</span> Presença no site, na seção de parceiros</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Apoio%20Regional%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full border border-white/20 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/40 transition">Garantir Apoio Regional ↗</a>
          </div>

          {/* Cota Institucional */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-[#0c0f17] to-[#07080c] p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-400 transition">
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider mb-2">Cota Institucional</h3>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Parceiros de Apoio ao Desporto</p>
              <p className="text-xs sm:text-sm text-[#b8c0d4] leading-relaxed mb-6 uppercase">
                Para entidades, federações e parceiros de apoio ao esporte regional. Reconhecimento como parceiro institucional oficial da Arena Vale.
              </p>
              <ul className="space-y-2.5 text-xs text-[#cad0e0] mb-8">
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Logo fixa na seção de parceiros do site</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Associação ao Projeto Social Arena Vale</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Menção em releases e materiais institucionais</li>
              </ul>
            </div>
            <a href="https://wa.me/5547988444404?text=Olá,%20tenho%20interesse%20na%20Cota%20Institucional%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="w-full text-center rounded-full border border-emerald-500/40 bg-emerald-500/15 py-3 text-xs font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500 hover:text-black transition">Garantir Cota Institucional ↗</a>
          </div>

        </div>

        {/* COMO FECHAR UMA COTA */}
        <div className="rounded-3xl border border-white/10 bg-[#0e1118] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xl space-y-6">
          <h3 className="text-xl sm:text-2xl font-black uppercase text-white">Como fechar uma cota</h3>
          <p className="text-xs sm:text-sm text-[#8a92a6] uppercase leading-relaxed max-w-2xl mx-auto">
            Todo interesse em patrocínio é direcionado para contato direto via WhatsApp, onde a equipe Arena Vale apresenta valores atualizados e disponibilidade de cada cota por temporada.
          </p>
          <a href="https://wa.me/5547988444404?text=Olá,%20quero%20conversar%20sobre%20patrocínio%20na%20Arena%20Vale!" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:scale-105 transition shadow-lg shadow-emerald-600/30">
            💬 WhatsApp Patrocínios: (47) 98844-4404 ↗
          </a>
        </div>

      </main>
    </div>
  );
}
