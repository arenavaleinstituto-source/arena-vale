'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface NoticiaItem {
  id: string;
  titulo: string;
  categoria: string;
  tag: string;
  conteudo: string;
  imagemCapa: string | null;
  data: string;
}

const BUCKET_CAPAS = 'noticias-capas';

export default function NoticiasPage() {
  const supabase = createClient();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Comunicado Oficial');
  const [tag, setTag] = useState('NOVO');
  const [conteudo, setConteudo] = useState('');
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [noticias, setNoticias] = useState<NoticiaItem[]>([]);

  async function carregarNoticias() {
    setCarregando(true);
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, categoria, tag, descricao, imagem_url, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNoticias(
        data.map((n: any) => ({
          id: n.id,
          titulo: n.titulo,
          categoria: n.categoria,
          tag: n.tag,
          conteudo: n.descricao,
          imagemCapa: n.imagem_url,
          data: new Date(n.created_at).toLocaleDateString('pt-BR'),
        }))
      );
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregarNoticias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoImagem(file);
      const url = URL.createObjectURL(file);
      setImagemPreview(url);
    }
  }

  function handleRemoverImagem() {
    setArquivoImagem(null);
    setImagemPreview(null);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;

    setEnviando(true);
    setErro(null);

    try {
      let imagemUrl: string | null = null;

      if (arquivoImagem) {
        const caminho = `${Date.now()}-${arquivoImagem.name}`;
        const { error: erroUpload } = await supabase.storage
          .from(BUCKET_CAPAS)
          .upload(caminho, arquivoImagem);

        if (erroUpload) {
          throw new Error(
            'Não consegui enviar a imagem. Confirme se o bucket "noticias-capas" existe no Storage do Supabase e está marcado como público.'
          );
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET_CAPAS).getPublicUrl(caminho);
        imagemUrl = publicUrlData.publicUrl;
      }

      const { error: erroInsert } = await supabase.from('noticias').insert({
        titulo,
        descricao: conteudo,
        categoria,
        tag,
        imagem_url: imagemUrl,
        ativo: true,
      });

      if (erroInsert) {
        throw new Error('Não consegui salvar a notícia no banco de dados.');
      }

      setSucesso(true);
      setTitulo('');
      setConteudo('');
      setTag('NOVO');
      handleRemoverImagem();
      await carregarNoticias();

      setTimeout(() => setSucesso(false), 4000);
    } catch (err: any) {
      setErro(err.message || 'Algo deu errado ao publicar a notícia.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 max-w-4xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>

      <h1 className="text-2xl font-bold mt-4 uppercase">Publicar Notícias & Comunicados</h1>
      <p className="text-sm text-slate-400 mb-6">Lance notas oficiais, convocações de arbitragem e novidades do portal. Tudo que você publicar aqui aparece direto no site, pra todo mundo.</p>

      <form onSubmit={handlePost} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
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

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Selo (tag pequena ao lado da categoria)</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value.toUpperCase())}
            placeholder="Ex: NOVO, OFICIAL, URGENTE"
            maxLength={20}
            className="w-full md:w-64 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
            Imagem de Capa (Banner Destaque)
          </label>

          {imagemPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagemPreview}
                alt="Prévia da Capa"
                className="w-full h-56 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoverImagem}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-xs text-white font-semibold rounded-lg border border-slate-600 transition shadow"
              >
                Trocar Foto
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <span className="text-2xl mb-1">📷</span>
                <p className="text-xs text-slate-300 font-medium">
                  <span className="text-amber-400 underline">Clique para enviar a imagem</span> ou arraste o ficheiro aqui
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Formatos suportados: PNG, JPG ou WEBP (Recomendado 16:9)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Conteúdo do Comunicado</label>
          <textarea
            rows={5}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva os detalhes da notícia, escalas ou notas oficiais..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        {sucesso && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs font-semibold">
            ✓ Notícia publicada com sucesso! Já está salva no banco e visível no site.
          </div>
        )}

        {erro && (
          <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-lg text-red-400 text-xs font-semibold">
            ⚠ {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-sm transition cursor-pointer"
        >
          {enviando ? 'Publicando...' : 'Publicar Notícia'}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
          Publicações Recentes
        </h2>

        {carregando && (
          <p className="text-xs text-slate-500">Carregando notícias já publicadas...</p>
        )}

        {!carregando && noticias.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma notícia publicada ainda.</p>
        )}

        {noticias.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-start"
          >
            {item.imagemCapa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imagemCapa}
                alt={item.titulo}
                className="w-full md:w-36 h-24 object-cover rounded-lg border border-slate-800 flex-shrink-0"
              />
            ) : (
              <div className="w-full md:w-36 h-24 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs flex-shrink-0">
                Sem Capa
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-400/10 text-amber-300 rounded border border-amber-400/20">
                  {item.categoria}
                </span>
                <span className="text-[10px] text-slate-500">{item.data}</span>
              </div>
              <h3 className="font-bold text-white text-base mt-1.5">{item.titulo}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.conteudo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
