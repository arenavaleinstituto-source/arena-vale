// Mural de comunicados oficiais — SERVER COMPONENT
import React from 'react';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/server';
import CartaoComunicado from '@/components/CartaoComunicado';
import { buscarNoticias, comFallback } from '@/lib/content';

/**
 * MURAL DE COMUNICADOS OFICIAIS — /noticias
 *
 * Server Component de propósito: os comunicados são o conteúdo mais
 * indexável do site (eram renderizados só no cliente, ou seja, o Google
 * não via texto nenhum). Agora o HTML inicial já traz título, selo,
 * descrição e data.
 *
 * O padrão editorial é o mesmo da Home e do painel:
 *   • `buscarNoticias` → só `ativo = true`, ordenadas por `ordem`;
 *   • `mapearNoticia`  → aceita `descricao`/`tag` e os aliases legados
 *     `conteudo`/`selo` (as colunas antigas que faziam esta página
 *     mostrar cards SEM texto e SEM selo);
 *   • `CartaoComunicado` → mesmo cartão, mesma CTA e mesma data da Home.
 *
 * Revalida a cada 60 segundos: um comunicado novo publicado no painel
 * aparece aqui sem precisar de novo deploy.
 */
export const revalidate = 60;

export const metadata = {
  title: 'Notícias | Arena Vale',
  description:
    'Mural oficial de comunicados da Arena Vale: inscrições, convocações de arbitragem, coberturas e novidades do portal.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PublicNoticiasPage() {
  const supabase = createPublicClient();
  const { noticias: linhas } = await buscarNoticias(supabase, { ordem: 'ordem' });
  const noticias = comFallback(linhas);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#e50914] selection:text-white font-sans flex flex-col">
      {/* CABEÇALHO */}

      {/* TÍTULO DO MURAL */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
              <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">
                ARENA VALE · PORTAL
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">
                NOTÍCIAS
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-end">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              TEMPORADA 2026
            </span>
            <span className="h-2 w-2 rounded-full bg-[#e50914]" />
          </div>
        </div>
      </section>

      {/* GRELHA DE COMUNICADOS */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 flex-grow">
        {noticias.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-16 text-center shadow-2xl">
            <p className="text-gray-400 font-bold uppercase tracking-wider">
              Ainda não há comunicados publicados.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {noticias.map((noticia, indice) => (
                <CartaoComunicado key={noticia.id} noticia={noticia} indice={indice} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                {noticias.length}{' '}
                {noticias.length === 1 ? 'comunicado publicado' : 'comunicados publicados'}
              </p>
            </div>
          </>
        )}
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
