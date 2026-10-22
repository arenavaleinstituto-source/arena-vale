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

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaItem[]>([
    {
      id: '1',
      titulo: 'Abertura do Circuito 2026',
      descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional com câmaras IA.',
      categoria: 'BROADCAST',
      tag: 'AO VIVO',
      imagem: '/fundo-arena.jpg'
    },
    {
      id: '2',
      titulo: 'Incentivo ao Desporto Regional',
      descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva do Vale.',
      categoria: 'PROJETO VALE',
      tag: 'DESTAQUE',
      imagem: '/fundo-arena.jpg'
    }
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arenavale_noticias');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setNoticias(parsed);
      }
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-6 py-12 flex-grow space-y-10">
        <div className="text-center sm:text-left border-b border-white/10 pb-8">
          <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff2a35] mb-3">IMPRENSA & COBERTURA</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">Notícias & Atualizações</h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] mt-2 uppercase max-w-2xl">Acompanhe todos os comunicados, coberturas e novidades oficiais do ecossistema Arena Vale.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((n, index) => (
            <article key={n.id || index} className="group relative rounded-[2rem] border border-white/10 bg-[#11141d] p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#e50914]/60">
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#11141d]/80 to-transparent opacity-90" />
              <img src={n.imagem || '/fundo-arena.jpg'} alt={n.titulo} className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity group-hover:scale-105 transition duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="rounded-full bg-[#e50914] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">{n.categoria}</span>
                  <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#cad0e0]">{n.tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight leading-snug">{n.titulo}</h3>
                <p className="text-xs text-[#b8c0d4] mt-3 leading-relaxed">{n.descricao}</p>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Arena Press Oficial</span>
                <Link href="/" className="text-xs font-black uppercase text-[#e50914] hover:underline">Ler Mais ↗</Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**. Todos os direitos reservados.
      </footer>
    </div>
  );
}
