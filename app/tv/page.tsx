import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'TV Arena Vale | Transmissões e Jogos ao Vivo',
  description: 'Acompanhe os melhores momentos, coberturas completas e jogos decisivos da nossa região em alta definição.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TvPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-sm font-black uppercase tracking-widest text-white">ARENA VALE</span>
            <span className="text-[10px] font-bold text-[#8a92a6] uppercase tracking-wider">| TV Oficial</span>
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-12 space-y-12">
        
        {/* HERO / TÍTULO */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f]">
            ● Transmissão Oficial
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            TV Arena Vale Ao Vivo
          </h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] uppercase tracking-wide leading-relaxed">
            Acompanhe os melhores momentos, coberturas completas e jogos decisivos da nossa região em alta definição.
          </p>
        </div>

        {/* REPRODUTOR DE VÍDEO / YOUTUBE EMBED */}
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="aspect-video w-full rounded-2xl bg-[#07080c] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <iframe 
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/live_stream?channel=UC_TVArenaVale" 
              title="TV Arena Vale ao Vivo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Inscreva-se no Canal Oficial</h2>
              <p className="text-[11px] text-[#8a92a6] uppercase mt-1">Ative as notificações no YouTube para não perder nenhuma live de Futsal e Futebol 7.</p>
            </div>
            <a 
              href="https://www.youtube.com/@TVArenaVale" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
            >
              Acessar o YouTube ↗
            </a>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados.
      </footer>
    </div>
  );
}
