import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'TV Arena Vale | Transmissões e Jogos ao Vivo',
  description:
    'Acompanhe os melhores momentos, coberturas completas e jogos decisivos da nossa região em alta definição.',
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * IDs REAIS do canal no YouTube.
 *
 * A página usava o placeholder `UC_TVArenaVale` no embed
 * `live_stream?channel=...` — um ID de canal que não existe. O iframe
 * ficava com "vídeo indisponível" para sempre.
 *
 * O canal oficial é @TVArenaVale → UCBTQ97bWA6VqK2a6qv80dIg.
 */
const CANAL_YOUTUBE_ID = 'UCBTQ97bWA6VqK2a6qv80dIg';
const CANAL_YOUTUBE_URL = 'https://www.youtube.com/@TVArenaVale';

/** Vídeos publicados no canal (confirmados via oEmbed). */
const VIDEOS_RECENTES = [
  {
    id: 'Bi0NP0sp2CM',
    titulo: 'Cruzeiro Itaipava X Trevo',
    categoria: 'JOGO COMPLETO',
  },
  {
    id: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem',
    categoria: 'RESENHA',
  },
];

export default function TvPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-clip">
      {/* CABEÇALHO */}

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
            Acompanhe os melhores momentos, coberturas completas e jogos decisivos da nossa região em
            alta definição.
          </p>
        </div>

        {/* REPRODUTOR DE VÍDEO / YOUTUBE EMBED */}
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="aspect-video w-full rounded-2xl bg-[#07080c] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/live_stream?channel=${CANAL_YOUTUBE_ID}&rel=0&modestbranding=1`}
              title="TV Arena Vale ao vivo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Inscreva-se no Canal Oficial
              </h2>
              <p className="text-[11px] text-[#8a92a6] uppercase mt-1">
                Ative as notificações no YouTube para não perder nenhuma live de Futsal e Futebol 7.
              </p>
            </div>
            <a
              href={CANAL_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
            >
              Acessar o YouTube ↗
            </a>
          </div>
        </div>

        {/* CATÁLOGO RECENTE — conteúdo sempre reproduzível */}
        <section>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white">
              Últimas transmissões
            </h2>
            <a
              href={CANAL_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-wider text-[#e50914] hover:text-[#ff2a35] transition"
            >
              Ver canal completo ↗
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {VIDEOS_RECENTES.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl transition hover:-translate-y-1 hover:border-[#e50914]/60"
              >
                <div className="aspect-video w-full bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                    title={video.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">
                      {video.categoria}
                    </span>
                    <h3 className="text-sm font-black uppercase text-white mt-1 group-hover:text-[#e50914] transition">
                      {video.titulo}
                    </h3>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#e50914] group-hover:bg-[#e50914] group-hover:text-white transition">
                    ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-8 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Todos os direitos reservados.
      </footer>
    </div>
  );
}
