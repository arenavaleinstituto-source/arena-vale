import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campeonatos | Arena Vale Sports',
  description: 'Conheça todas as modalidades e circuitos oficiais gerenciados pela Arena Vale.',
};

export default function CampeonatosPage() {
  const modalidades = [
    {
      id: 'futsal',
      nome: 'Futsal',
      tituloOficial: 'Circuito Arena Vale de Futsal 2026',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra.',
      statusBadge: 'CIRCUITO 2026',
    },
    {
      id: 'fut7',
      nome: 'Futebol 7',
      tituloOficial: 'Copa Arena Vale de Futebol 7',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Disputado em campos society, o futebol 7 é ideal para quem busca um futebol mais dinâmico, com espaços reduzidos e jogadas rápidas.',
      statusBadge: 'PRÉ-TEMPORADA',
    },
    {
      id: 'basquete',
      nome: 'Basquetebol',
      tituloOficial: 'Liga Arena Vale de Basquete',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'A liga de basquete valoriza o preparo físico e técnico dos atletas, com jogos disputados em quadras cobertas.',
      statusBadge: 'EM PLANEAMENTO',
    },
    {
      id: 'volei',
      nome: 'Voleibol',
      tituloOficial: 'Torneio Arena Vale de Vôlei',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O vôlei reúne equipes masculinas e femininas em um torneio disputado em sistema de melhor de 3 ou 5 sets.',
      statusBadge: 'PROJETOS ABERTOS',
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* CABEÇALHO */}
      <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-wider text-amber-400">
            ARENA VALE <span className="text-xs text-slate-400 font-normal uppercase ml-2">| Campeonatos</span>
          </Link>
          <Link href="/" className="text-xs text-slate-300 hover:text-amber-400 font-bold transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            Temporada 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            Campeonatos & Competições
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto uppercase">
            Conheça todas as modalidades e circuitos oficiais gerenciados pela Arena Vale na região.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {modalidades.map((m) => (
            <div key={m.id} className="bg-[#0a1120] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {m.statusBadge}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{m.fase}</span>
                </div>
                <h3 className="text-xl font-black uppercase text-white">{m.tituloOficial}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.descricao}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://wa.me/5547988444404?text=Olá,%20quero%20saber%20mais%20sobre%20as%20inscrições%20nos%20campeonatos!"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition shadow"
                >
                  Inscrever Equipe ↗
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
