'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  youtubeId: string;
  titulo: string;
  formato: 'widescreen' | 'shorts';
}

interface NoticiaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tag: string;
}

const VIDEOS_INICIAIS: VideoItem[] = [
  {
    id: 'default-1',
    youtubeId: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem · TV Arena Vale',
    formato: 'widescreen'
  }
];

const NOTICIAS_INICIAIS: NoticiaItem[] = [
  {
    id: 'noticia-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional.',
    categoria: 'INSTITUCIONAL',
    tag: 'NOVIDADES'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva.',
    categoria: 'PROJETO VALE',
    tag: 'DESENVOLVIMENTO'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO DESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível das competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'GESTÃO'
  }
];

export default function PainelCoordenadorPage() {
  // Gestão de Vídeos
  const [novoLink, setNovoLink] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [formatoEscolhido, setFormatoEscolhido] = useState<'widescreen' | 'shorts'>('widescreen');
  const [listaVideos, setListaVideos] = useState<VideoItem[]>([]);

  // Gestão de Notícias
  const [novoTituloNoticia, setNovoTituloNoticia] = useState('');
  const [novaDescricaoNoticia, setNovaDescricaoNoticia] = useState('');
  const [novaCategoriaNoticia, setNovaCategoriaNoticia] = useState('INSTITUCIONAL');
  const [novaTagNoticia, setNovaTagNoticia] = useState('NOVIDADES');
  const [listaNoticias, setListaNoticias] = useState<NoticiaItem[]>([]);

  useEffect(() => {
    try {
      // Carregar vídeos
      const videosSalvos = localStorage.getItem('arenavale_videos');
      if (videosSalvos) {
        setListaVideos(JSON.parse(videosSalvos));
      } else {
        setListaVideos(VIDEOS_INICIAIS);
        localStorage.setItem('arenavale_videos', JSON.stringify(VIDEOS_INICIAIS));
      }

      // Carregar notícias
      const noticiasSalvas = localStorage.getItem('arenavale_noticias');
      if (noticiasSalvas) {
        setListaNoticias(JSON.parse(noticiasSalvas));
      } else {
        setListaNoticias(NOTICIAS_INICIAIS);
        localStorage.setItem('arenavale_noticias', JSON.stringify(NOTICIAS_INICIAIS));
      }
    } catch {
      setListaVideos(VIDEOS_INICIAIS);
      setListaNoticias(NOTICIAS_INICIAIS);
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
      alert('Insira um link válido do YouTube (ex: watch?v=, youtu.be/ ou shorts/)');
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
    alert('Vídeo publicado com sucesso! Já está visível na página inicial.');
  };

  const removerVideo = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este vídeo?')) {
      const novaLista = listaVideos.filter((v) => v.id !== id);
      setListaVideos(novaLista);
      localStorage.setItem('arenavale_videos', JSON.stringify(novaLista));
    }
  };

  const handleAdicionarNoticia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTituloNoticia.trim() || !novaDescricaoNoticia.trim()) {
      alert('Preencha o título e a descrição da notícia.');
      return;
    }

    const itemNoticia: NoticiaItem = {
      id: Date.now().toString(),
      titulo: novoTituloNoticia.trim().toUpperCase(),
      descricao: novaDescricaoNoticia.trim(),
      categoria: novaCategoriaNoticia.trim().toUpperCase() || 'GERAL',
      tag: novaTagNoticia.trim().toUpperCase() || 'DESTAQUE'
    };

    const novaLista = [itemNoticia, ...listaNoticias];
    setListaNoticias(novaLista);
    localStorage.setItem('arenavale_noticias', JSON.stringify(novaLista));

    setNovoTituloNoticia('');
    setNovaDescricaoNoticia('');
    alert('Notícia publicada com sucesso! Já está visível na página inicial.');
  };

  const removerNoticia = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta notícia?')) {
      const novaLista = listaNoticias.filter((n) => n.id !== id);
      setListaNoticias(novaLista);
      localStorage.setItem('arenavale_noticias', JSON.stringify(novaLista));
    }
  };

  return (<div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white"><header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0b0d12]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div className="flex items-center gap-4"><Link href="/" className="flex items-center gap-3 transition hover:opacity-90"><img src="/logo 02.png" alt="Arena Vale" className="h-10 w-auto object-contain" /><span className="text-xl font-black tracking-tight text-white">ARENA <span className="text-[#e50914]">VALE</span></span></Link><span className="hidden sm:inline-block rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">🛡️ Painel do Coordenador</span></div><div className="flex items-center gap-3"><Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] hover:bg-white/10 hover:text-white transition">← Ver Site Principal</Link></div></div></header><main className="mx-auto max-w-7xl px-6 py-10 space-y-12"><div><div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 mb-3">GESTÃO MULTIMÉDIA & CONTEÚDOS</div><h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">PAINEL DE CONTROLE DO COORDENADOR</h1><p className="mt-2 text-sm text-[#8a92a6] max-w-2xl">Gerencie as transmissões do YouTube e as publicações de notícias que aparecem em tempo real no portal da Arena Vale.</p></div>{/* MÓDULO 1: GESTÃO DE VÍDEOS */}<section className="rounded-3xl border border-amber-500/20 bg-[#13161f] p-6 sm:p-8 shadow-2xl space-y-6"><h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="text-amber-400">📹</span> Adicionar Vídeo / Transmissão (YouTube)</h2><form onSubmit={handleAdicionarVideo} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Título do Vídeo</label><input type="text" required placeholder="Ex: Final Regional 2026 · TV Arena Vale" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Link do YouTube (Live, Vídeo ou Shorts)</label><input type="url" required placeholder="https://www.youtube.com/watch?v=... ou /shorts/..." value={novoLink} onChange={(e) => setNovoLink(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none" /></div></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Enquadramento</label><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setFormatoEscolhido('widescreen')} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${formatoEscolhido === 'widescreen' ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20' : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'}`}>📺 16:9 Widescreen (Sem Sobras Laterais)</button><button type="button" onClick={() => setFormatoEscolhido('shorts')} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${formatoEscolhido === 'shorts' ? 'bg-[#e50914] text-white font-bold shadow-lg shadow-[#e50914]/20' : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'}`}>📱 9:16 Vertical Nativo (Shorts)</button></div></div><button type="submit" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/20 hover:brightness-110 transition cursor-pointer">+ Publicar Vídeo na Grelha</button></form><div className="pt-6 border-t border-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-[#8a92a6] mb-4">Vídeos Ativos ({listaVideos.length})</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listaVideos.map((video) => (<div key={video.id} className="flex flex-col rounded-2xl border border-white/10 bg-[#0b0d12] p-4 justify-between gap-3"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">{video.formato}</span><button type="button" onClick={() => removerVideo(video.id)} className="text-xs text-red-400 hover:text-red-300 font-bold">✕ Remover</button></div><p className="text-xs font-bold text-white truncate">{video.titulo}</p></div>))}</div></div></section>{/* MÓDULO 2: GESTÃO DE NOTÍCIAS & COBERTURA */}<section className="rounded-3xl border border-amber-500/20 bg-[#13161f] p-6 sm:p-8 shadow-2xl space-y-6"><h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="text-amber-400">📰</span> Adicionar Notícia / Conteúdo & Cobertura</h2><p className="text-xs text-[#8a92a6]">Publique notícias, comunicados ou artigos que ficarão visíveis na secção de Conteúdo da página inicial.</p><form onSubmit={handleAdicionarNoticia} className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2"><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Título da Notícia</label><input type="text" required placeholder="Ex: COPA VALE DE FUTSAL CONFIRMADA PARA NOVEMBRO" value={novoTituloNoticia} onChange={(e) => setNovoTituloNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none uppercase" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Categoria</label><input type="text" placeholder="Ex: INSTITUCIONAL / COMPETIÇÕES" value={novaCategoriaNoticia} onChange={(e) => setNovaCategoriaNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none uppercase" /></div></div><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2"><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Descrição / Resumo</label><textarea required rows={3} placeholder="Breve resumo da notícia que aparecerá no card do site..." value={novaDescricaoNoticia} onChange={(e) => setNovaDescricaoNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none resize-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Tag / Selo</label><input type="text" placeholder="Ex: NOVIDADES / OFICIAL" value={novaTagNoticia} onChange={(e) => setNovaTagNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none uppercase" /></div></div><button type="submit" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/20 hover:brightness-110 transition cursor-pointer">+ Publicar Notícia no Portal</button></form><div className="pt-6 border-t border-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-[#8a92a6] mb-4">Notícias Publicadas ({listaNoticias.length})</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listaNoticias.map((noticia) => (<div key={noticia.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b0d12] p-5 gap-3"><div><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-black uppercase text-[#e50914]">{noticia.categoria}</span><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[#cad0e0]">{noticia.tag}</span></div><h4 className="text-sm font-black uppercase text-white leading-snug">{noticia.titulo}</h4><p className="text-xs text-[#8a92a6] mt-2 line-clamp-2">{noticia.descricao}</p></div><div className="pt-3 border-t border-white/5 flex justify-end"><button type="button" onClick={() => removerNoticia(noticia.id)} className="text-xs text-red-400 hover:text-red-300 font-bold">✕ Remover</button></div></div>))}</div></div></section></main></div>);
}
