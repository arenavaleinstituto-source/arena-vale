'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';

interface NoticiaItem {
  id: number;
  titulo: string;
  categoria: string;
  conteudo: string;
  imagemCapa: string | null;
  data: string;
}

export default function NoticiasPage() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Comunicado Oficial');
  const [conteudo, setConteudo] = useState('');
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Lista local para visualização imediata no painel
  const [noticias, setNoticias] = useState<NoticiaItem[]>([
    {
      id: 1,
      titulo: 'Definidas as datas da semifinal da Copa Regional 2026',
      categoria: 'Campeonatos',
      conteudo: 'As partidas decisivas acontecerão no próximo final de semana com cobertura ao vivo.',
      imagemCapa: null,
      data: '22/10/2026',
    },
  ]);

  // Função para carregar imagem do computador e gerar prévia
  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagemPreview(url);
    }
  }

  // Remover a imagem selecionada
  function handleRemoverImagem() {
    setImagemPreview(null);
  }

  // Publicar Notícia
  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;

    const novaNoticia: NoticiaItem = {
      id: Date.now(),
      titulo,
      categoria,
      conteudo,
      imagemCapa: imagemPreview,
      data: new Date().toLocaleDateString('pt-BR'),
    };

    setNoticias((prev) => [novaNoticia, ...prev]);
    setSucesso(true);

    // Limpar formulário
    setTitulo('');
    setConteudo('');
    setImagemPreview(null);

    setTimeout(() => setSucesso(false), 4000);
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 max-w-4xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>

      <h1 className="text-2xl font-bold mt-4 uppercase">Publicar Notícias & Comunicados</h1>
      <p className="text-sm text-slate-400 mb-6">Lance notas oficiais, convocações de arbitragem e novidades do portal.</p>

      {/* FORMULÁRIO */}
      <form onSubmit={handlePost} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        {/* Título e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Título da Notícia</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Definidas as datas da semifinal da Copa Regional"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Comunicado Oficial">Comunicado Oficial</option>
              <option value="Arbitragem">Arbitragem</option>
              <option value="Campeonatos">Campeonatos</option>
              <option value="TV Arena Vale">TV Arena Vale</option>
            </select>
          </div>
        </div>

        {/* CAMPO DE CAPA DA NOTÍCIA */}
        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
            Imagem de Capa (Banner Destaque)
          </label>

          {imagemPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagemPreview}
                alt="Prévia da Capa"
                className="w-full h-56 object-cover"
