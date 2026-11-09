'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  buscarNoticias,
  mapearNoticias,
  CATEGORIAS_NOTICIA,
  TAGS_NOTICIA,
  CATEGORIA_PADRAO,
  TAG_PADRAO,
  formatarDataBR,
  imagemNoticia,
  type Noticia,
} from '@/lib/content';

/**
 * PAINEL — Publicar Notícias & Comunicados
 *
 * Usa o mesmo padrão editorial do site público:
 *   • o vocabulário vem de `lib/content/vocabulario` (categorias e selos
 *     idênticos aos do mural /noticias — antes o painel oferecia 4
 *     categorias que não existiam em lugar nenhum do site);
 *   • a listagem usa `buscarNoticias` (mesma ordenação da Home e do mural);
 *   • cada item pode ser despublicado (`ativo = false`), reordenado
 *     (`ordem`) e excluído — antes só existia "publicar", sem como
 *     retirar um comunicado equivocado do ar.
 */
const BUCKET_CAPAS = 'noticias-capas';

export default function NoticiasPage() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<string>(CATEGORIA_PADRAO);
  const [tag, setTag] = useState<string>(TAG_PADRAO);
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  async function carregarNoticias() {
    setCarregando(true);
    try {
      const supabase = createClient();
      const { noticias: linhas, erro: erroLeitura } = await buscarNoticias(supabase, {
        incluirInativos: true,
        ordem: 'ordem',
      });
      if (erroLeitura) {
        setErro(erroLeitura);
        setNoticias([]);
      } else {
        setNoticias(linhas);
      }
    } catch (err: any) {
      setErro(err?.message || 'Erro ao carregar os comunicados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarNoticias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  }

  function handleRemoverImagem() {
    setArquivoImagem(null);
    setImagemPreview(null);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    setEnviando(true);
    setErro(null);

    try {
      const supabase = createClient();
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
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        tag,
        ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 1,
        ativo,
        imagem_url: imagemUrl,
      });

      if (erroInsert) {
        throw new Error(erroInsert.message || 'Não consegui salvar o comunicado no banco de dados.');
      }

      setSucesso(true);
      setTitulo('');
      setDescricao('');
      setCategoria(CATEGORIA_PADRAO);
      setTag(TAG_PADRAO);
      setOrdem((atual) => atual + 1);
      setAtivo(true);
      handleRemoverImagem();
      await carregarNoticias();

      setTimeout(() => setSucesso(false), 4000);
    } catch (err: any) {
      setErro(err.message || 'Algo deu errado ao publicar o comunicado.');
    } finally {
      setEnviando(false);
    }
  }

  /** Despublica (ou republica) um comunicado — `ativo` controla a exibição. */
  async function handleAlternarAtivo(id: string, proximo: boolean) {
    try {
      const supabase = createClient();
      const { error: erroUpdate } = await supabase
        .from('noticias')
        .update({ ativo: proximo })
        .eq('id', id);

      if (erroUpdate) throw erroUpdate;

      setNoticias((lista) =>
        lista.map((n) => (n.id === id ? { ...n, ativo: proximo } : n))
      );
    } catch (err: any) {
      setErro(err.message || 'Não consegui alterar a situação do comunicado.');
    }
  }

  /** Salva a nova ordem (posição) de um comunicado. */
  async function handleSalvarOrdem(id: string, novaOrdem: number) {
    try {
      const supabase = createClient();
      const { error: erroUpdate } = await supabase
        .from('noticias')
        .update({ ordem: Number.isFinite(novaOrdem) ? novaOrdem : 999 })
        .eq('id', id);

      if (erroUpdate) throw erroUpdate;

      setNoticias((lista) =>
        lista
          .map((n) => (n.id === id ? { ...n, ordem: novaOrdem } : n))
          .sort((a, b) => a.ordem - b.ordem)
      );
    } catch (err: any) {
      setErro(err.message || 'Não consegui reordenar o comunicado.');
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Remover definitivamente este comunicado? Esta ação não pode ser desfeita.')) return;

    try {
      const supabase = createClient();
      const { error: erroDelete } = await supabase.from('noticias').delete().eq('id', id);

      if (erroDelete) throw erroDelete;

      setNoticias((lista) => lista.filter((n) => n.id !== id));
    } catch (err: any) {
      setErro(err.message || 'Não consegui excluir o comunicado.');
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 max-w-4xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>

      <h1 className="text-2xl font-bold mt-4 uppercase">Publicar Notícias & Comunicados</h1>
      <p className="text-sm text-slate-400 mb-6">
        Lance notas oficiais, convocações de arbitragem e novidades do portal. Tudo que você publicar
        aqui aparece no mural de comunicados e na Home, no mesmo formato.
      </p>

      <form
        onSubmit={handlePost}
        className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
              Título do Comunicado
            </label>
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
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {CATEGORIAS_NOTICIA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
              Selo (tag pequena ao lado da categoria)
            </label>
            <input
              type="text"
              list="tags-noticia"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              placeholder="Ex: NOVO, OFICIAL, URGENTE"
              maxLength={20}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
            <datalist id="tags-noticia">
              {TAGS_NOTICIA.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
              Posição no mural
            </label>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value))}
              min={1}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">Menor número aparece primeiro.</p>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-white/15 bg-slate-950 text-amber-400 focus:ring-0"
            />
            <label htmlFor="ativo" className="text-xs text-slate-300 font-semibold uppercase">
              Publicar no site
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
            Imagem de Capa (Banner Destaque)
          </label>

          {imagemPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagemPreview} alt="Prévia da Capa" className="w-full h-56 object-cover" />
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
                  <span className="text-amber-400 underline">Clique para enviar a imagem</span> ou
                  arraste o ficheiro aqui
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Formatos suportados: PNG, JPG ou WEBP (Recomendado 16:9)
                </p>
              </div>
              <input type="file" accept="image/*" onChange={handleImagemChange} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
            Conteúdo do Comunicado
          </label>
          <textarea
            rows={5}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Escreva os detalhes da notícia, escalas ou notas oficiais..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        {sucesso && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs font-semibold">
            ✓ Comunicado publicado com sucesso! Já está salvo no banco e visível no site.
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
          {enviando ? 'Publicando...' : 'Publicar Comunicado'}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
          Publicações Recentes
        </h2>

        {carregando && (
          <p className="text-xs text-slate-500">Carregando comunicados já publicados...</p>
        )}

        {!carregando && noticias.length === 0 && (
          <p className="text-xs text-slate-500">Nenhum comunicado publicado ainda.</p>
        )}

        {noticias.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagemNoticia(item)}
              alt={item.titulo}
              className="w-full md:w-36 h-24 object-cover rounded-lg border border-slate-800 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-400/10 text-amber-300 rounded border border-amber-400/20">
                  {item.categoria}
                </span>
                {item.tag && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {item.tag}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">{formatarDataBR(item.created_at)}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    item.ativo
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {item.ativo ? 'No ar' : 'Despublicado'}
                </span>
              </div>

              <h3 className="font-bold text-white text-base mt-1.5">{item.titulo}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.descricao}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                  Posição
                  <input
                    type="number"
                    defaultValue={item.ordem}
                    min={1}
                    onBlur={(e) => handleSalvarOrdem(item.id, Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleAlternarAtivo(item.id, !item.ativo)}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase transition hover:bg-amber-500/20"
                >
                  {item.ativo ? 'Despublicar' : 'Publicar'}
                </button>

                <button
                  type="button"
                  onClick={() => handleExcluir(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase transition hover:bg-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
