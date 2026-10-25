import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projeto Social | Arena Vale Sports',
  description: 'O esporte como ferramenta de transformação social e integração no Vale.',
};

export default function ProjetoSocialPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* CABEÇALHO */}
      <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-wider text-amber-400">
            ARENA VALE <span className="text-xs text-slate-400 font-normal uppercase ml-2">| Projeto Social</span>
          </Link>
          <Link href="/" className="text-xs text-slate-300 hover:text-amber-400 font-bold transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            Impacto & Inclusão Comunitária
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            Projeto Social Arena Vale
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto uppercase">
            O esporte como ferramenta de transformação social, apoio à formação de jovens talentos e integração comunitária no Vale.
          </p>
        </div>

        <div className="bg-[#0a1120] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase text-amber-400">Iniciativas e Apoio Direto</h2>
          <p className="text-sm text-slate-300 leading-relaxed uppercase">
            Desenvolvemos ações contínuas em parceria com entidades locais para levar o esporte a crianças e jovens em situação de vulnerabilidade, promovendo disciplina, saúde e cidadania através do futebol, futsal e outras modalidades.
          </p>
          <div className="pt-4">
            <a
              href="https://wa.me/5547988444404?text=Olá,%20quero%20apoiar%20o%20Projeto%20Social%20da%20Arena%20Vale!"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition shadow-lg"
            >
              Apoiar o Projeto Social ↗
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}
