// Leitura de comunicado — SERVER COMPONENT
import React from 'react';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/server';
import {
  buscarNoticias,
  comFallback,
  formatarDataExtensoBR,
  imagemNoticia,
  mapearNoticia,
  NOTICIAS_PADRAO,
} from '@/lib/content';

/**
 * LEITURA DE COMUNICADO — /noticias/[id]
 *
 * Rota nova. Antes, o CTA "LER COMUNICADO" do mural era um <button> sem
 * onClick: o usuário clicava e nada acontecia. Não existia lugar nenhum
 * no site onde se lê um comunicado inteiro.
 *
 * Server Component: o texto do comunicado fica no HTML inicial
 * (indexável e compartilhável por WhatsApp, que mostra a prévia do link).
 */
export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('noticias')
    .select('titulo, descricao, imagem_url')
    .eq('id', params.id)
    .eq('ativo', true)
    .maybeSingle();

  if (!data) {
    return { title: 'Notícia não encontrada | ARENA VALE' };
  }

  return {
    title: `${data.titulo} | Arena Vale`,
    description: String(data.descricao || '').slice(0, 160),
    openGraph: {
      title: String(data.titulo),
      description: String(data.descricao || '').slice(0, 160),
      images: data.imagem_url ? [data.imagem_url] : ['/fundo-arena.jpg'],
      locale: 'pt_BR',
      type: 'article',
    },
  };
}

export default async function ComunicadoDetalhePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = createPublicClient();

  // 1) Busca direta pelo id.
  const { data: linha } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', params.id)
    .eq('ativo', true)
    .maybeSingle();

  let noticia = linha ? mapearNoticia(linha) : null;

  // 2) Se o id for de um item de fallback, usa o fallback.
  if (!noticia) {
    const fallback = NOTICIAS_PADRAO.find((n) => n.id === params.id);
    if (fallback) noticia = fallback;
  }

  if (!noticia) {
    const { noticias } = await buscarNoticias(supabase, { ordem: 'recentes' });
    noticia = noticias.find((n) => n.id === params.id) ?? null;
  }

  if (!noticia) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-6 px-6 font-sans text-center">
        <p className="text-6xl font-black text-[#e50914] tracking-widest">404</p>
        <h1 className="text-xl font-black uppercase tracking-wider">Comunicado não encontrado</h1>
        <p className="text-sm text-gray-400 max-w-md">
          Esta notícia pode ter sido despublicada pelo painel. Veja todas as notícias.
        </p>
        <Link
          href="/noticias"
          className="rounded-full bg-[#e50914] px-7 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#ff1e27] transition"
        >
          VER TODAS AS NOTÍCIAS
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#e50914] selection:text-white font-sans flex flex-col">
      {/* CABEÇALHO */}

      {/* COMUNICADO */}
      <main className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-14 flex-grow">
        <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl">
          <div className="relative h-64 sm:h-80 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagemNoticia(noticia)}
              alt={noticia.titulo}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-45 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="inline-block -skew-x-12 bg-[#e50914] px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                  <span className="inline-block skew-x-12">{noticia.categoria}</span>
                </span>
                {noticia.tag && (
                  <span className="inline-block -skew-x-12 border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#d4d4d8]">
                    <span className="inline-block skew-x-12">{noticia.tag}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black italic uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg">
                {noticia.titulo}
              </h1>

              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#e50914]">
                ARENA PRESS · {formatarDataExtensoBR(noticia.created_at)}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-1 w-10 bg-[#e50914]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                NOTÍCIA
              </span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-[#d5dbea] whitespace-pre-line">
              {noticia.descricao}
            </p>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <Link
                href="/noticias"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition"
              >
                ← VOLTAR AO MURAL
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#ff1e27] transition"
              >
                IR PARA A HOME
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050505] px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-500">
          © 2026 Arena Vale · Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
