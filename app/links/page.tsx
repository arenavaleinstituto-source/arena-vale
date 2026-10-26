import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Canais Oficiais | Arena Vale Sports',
  robots: {
    index: true,
    follow: true,
  },
};

export default function LinksPage() {
  const linksOficiais = [
    {
      nome: '🌐 Site Oficial Arena Vale',
      url: 'https://arena-vale.vercel.app',
      destaque: true,
    },
    {
      nome: '📺 TV Arena Vale (Transmissões & Jogos)',
      url: '/tv',
      destaque: false,
    },
    {
      nome: '🎥 Canal Oficial no YouTube (@TVArenaVale)',
      url: 'https://www.youtube.com/@TVArenaVale',
      destaque: false,
      externo: true,
    },
    {
      nome: '🏆 Campeonatos & Inscrições Abertas',
      url: '/campeonatos',
      destaque: false,
    },
    {
      nome: '⭐ Atletas em Destaque',
      url: '/atletasdestaques',
      destaque: false,
    },
    {
      nome: '🤝 Seja um Patrocinador / Cota Master',
      url: '/patrocinio',
      destaque: false,
    },
    {
      nome: '💬 Fale Conosco via WhatsApp',
      url: 'https://wa.me/5547988444404?text=Olá,%20vim%20através%20dos%20links%20da%20Arena%20Vale!',
      destaque: true,
      externo: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans px-6 py-12 overflow-x-hidden">

      {/* CONTEÚDO CENTRALIZADO */}
      <main className="mx-auto max-w-md w-full flex flex-col items-center space-y-8 my-auto">

        {/* LOGOTIPO / AVATAR */}
        <div className="text-center space-y-4">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-b from-[#e50914] to-transparent shadow-2xl shadow-[#e50914]/30">
            <img
              src="/logo.png"
              alt="Arena Vale Sports"
              className="h-24 w-auto object-contain rounded-xl bg-[#07080c] p-2"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-3">Arena Vale Sports</h1>
            <p className="text-xs text-[#8a92a6] uppercase tracking-widest mt-1">O Palco do Esporte é Aqui · 2026</p>
          </div>
        </div>

        {/* LISTA DE BOTÕES (LINKTREE) */}
        <div className="w-full space-y-4">
          {linksOficiais.map((item, index) => {
            const isExternal = item.url.startsWith('http');

            const content = (
              <div className={`w-full rounded-2xl p-4 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center shadow-xl ${
                item.destaque
                  ? 'bg-[#e50914] text-white hover:bg-red-600 shadow-[#e50914]/30 hover:scale-[1.02]'
                  : 'border border-white/15 bg-[#11141d] text-[#cad0e0] hover:border-[#e50914]/60 hover:text-white hover:bg-[#181d2a] hover:scale-[1.02]'
              }`}>
                {item.nome}
              </div>
            );

            if (isExternal) {
              return (
                <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  {content}
                </a>
              );
            }

            return (
              <Link key={index} href={item.url} className="block w-full">
                {content}
              </Link>
            );
          })}
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="mt-12 text-center text-[10px] text-[#555d6e] uppercase tracking-wider">
        © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**.
      </footer>
    </div>
  );
}
