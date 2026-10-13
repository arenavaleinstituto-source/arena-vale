'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  youtubeId: string;
  titulo: string;
  formato: 'widescreen' | 'shorts';
}

const VIDEOS_INICIAIS: VideoItem[] = [
  {
    id: 'default-1',
    youtubeId: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem · TV Arena Vale',
    formato: 'widescreen'
  }
];

export default function PainelCoordenadorPage() {
  const [novoLink, setNovoLink] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [formatoEscolhido, setFormatoEscolhido] = useState<'widescreen' | 'shorts'>('widescreen');
  const [listaVideos, setListaVideos] = useState<VideoItem[]>([]);

  // Carrega do localStorage ao abrir a página
  useEffect(() => {
    try {
      const salvos = localStorage.getItem('arenavale_videos');
      if (salvos) {
        setListaVideos(JSON.parse(salvos));
      } else {
        setListaVideos(VIDEOS_INICIAIS);
        localStorage.setItem('arenavale_videos', JSON.stringify(VIDEOS_INICIAIS));
      }
    } catch {
      setListaVideos(VIDEOS_INICIAIS);
    }
  }, []);

  const extrairIdYoutube = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAdicionarVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extrairIdYoutube(novoLink);

    if (!id) {
      alert('Introduza um link válido do YouTube (ex: watch?v=, youtu.be/ ou shorts/)');
      return;
    }

    const item: VideoItem = {
      id: Date.now().toString(),
      youtubeId: id,
      titulo: novoTitulo.trim() || 'Nova Transmissão · TV Arena Vale',
      formato: formatoEscolhido
    };

    const novaLista = [item, ...listaVideos];
    setListaVideos(novaLista);
    localStorage.setItem('arenavale_videos', JSON.stringify(novaLista));

    setNovoLink('');
    setNovoTitulo('');
    alert('Vídeo publicado com sucesso! Já está visível na página principal.');
  };

  const removerVideo = (id: string) => {
    if (confirm('Tem a certeza que deseja remover este vídeo?')) {
      const novaLista = listaVideos.filter((v) => v.id !== id);
      setListaVideos(novaLista);
      localStorage.setItem('arenavale_videos', JSON.stringify(novaLista));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
              <img src="/logo 02.png" alt="Arena Vale" className="h-10 w-auto object-contain" />
              <span className="text-xl font-black tracking-tight text-white">ARENA <span className="text-[#e50914]">VALE</span></span>
            </Link>
            <span className="hidden sm:inline-block rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
              🛡️ Painel do Coordenador
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] hover:bg-white/10 hover:text-white transition">
              ← Ver Site Principal
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 mb-3">
            GESTÃO DE TRANSMISSÕES E VÍDEOS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Painel de Controlo do Coordenador
          </h1>
          <p className="mt-2 text-sm text-[#8a92a6] max-w-2xl">
            Adicione vídeos ou transmissões do YouTube. Eles serão publicados imediatamente na página inicial do site.
          </p>
        </div>

        <section className="rounded-3xl border border-amber-500/20 bg-[#13161f] p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2 mb-2">
            <span className="text-amber-400">📹</span> Adicionar Vídeo / Transmissão
          </h2>
          <p className="text-xs text-[#8a92a6] mb-6">
            Cole o link do YouTube (vídeo longo, live ou shorts).
          </p>

          <form onSubmit={handleAdicionarVideo} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">
                  Título do Vídeo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Final Regional 2026 · TV Arena Vale"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">
                  Link do YouTube (Live, Vídeo ou Shorts)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... ou /shorts/..."
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">
                Enquadramento
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setFormatoEscolhido('widescreen')}
                  className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                    formatoEscolhido === 'widescreen'
                      ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                  }`}
                >
                  📺 16:9 Widescreen (Sem Sobras Laterais)
                </button>
                <button
                  type="button"
                  onClick={() => setFormatoEscolhido('shorts')}
                  className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                    formatoEscolhido === 'shorts'
                      ? 'bg-[#e50914] text-white font-bold shadow-lg shadow-[#e50914]/20'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                  }`}
                >
                  📱 9:16 Vertical Nativo (Shorts)
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
            >
              + Publicar Vídeo na Grelha
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Vídeos Publicados na Plataforma ({listaVideos.length})
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listaVideos.map((video) => (
              <div key={video.id} className="flex flex-col rounded-2xl border border-white/10 bg-[#13161f] overflow-hidden shadow-xl">
                <div className={`relative ${video.formato === 'shorts' ? 'aspect-[9/16] max-h-96' : 'aspect-video'} w-full overflow-hidden bg-black flex items-center justify-center`}>
                  <iframe
                    className={`${video.formato === 'widescreen' ? 'h-[140%] w-[140%] max-w-none' : 'h-full w-full'}`}
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&controls=1`}
                    title={video.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="rounded bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                      {video.formato === 'widescreen' ? '16:9 Widescreen' : '9:16 Shorts'}
                    </span>
                    <h3 className="mt-2 text-sm font-black uppercase leading-snug text-white">
                      {video.titulo}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#8a92a6] hover:text-white transition"
                    >
                      Abrir no YouTube ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => removerVideo(video.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
