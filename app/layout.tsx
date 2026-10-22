import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b13] flex flex-col font-sans">
      
      {/* DESTAQUE PRINCIPAL (HERO) */}
      <section className="relative w-full max-w-7xl mx-auto mt-6 px-4">
        <div className="relative bg-[#0a1120] rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
          
          {/* IMAGEM DE FUNDO (Simulação baseada no layout original) */}
          <div 
            className="absolute inset-0 opacity-40 bg-cover bg-center" 
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1120] via-[#0a1120]/90 to-transparent"></div>

          <div className="relative p-8 md:p-16 lg:p-24 max-w-2xl">
            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-6">
              Cobertura & Transmissão Oficial
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
              O Palco do <span className="text-amber-400">Esporte</span> é Aqui.
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-10 max-w-lg">
              Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/tv" 
                className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#070b13] font-black uppercase text-xs tracking-wider rounded-full transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
              >
                ▶ Transmissões
              </Link>
              <Link 
                href="/campeonatos" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-slate-800 border border-slate-600 text-white font-bold uppercase text-xs tracking-wider rounded-full transition flex items-center justify-center gap-2"
              >
                Ver Campeonatos →
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* ESPAÇO PARA FUTUROS CONTEÚDOS (Notícias, Atletas Destaque, etc) */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
         <p className="text-slate-600 text-sm font-medium uppercase tracking-widest">
           Mais conteúdos da Arena Vale em breve
         </p>
      </section>

    </main>
  );
}
