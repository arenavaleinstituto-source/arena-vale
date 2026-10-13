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

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
              <img src="/logo 02.png" alt="Arena Vale" className="h-10 w-auto object-contain" />
              <span className="text-xl font-black tracking-tight text-white">ARENA
