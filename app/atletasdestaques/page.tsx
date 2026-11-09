// Galeria oficial de atletas em destaque — SERVER COMPONENT
import React from 'react';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/server';
import GaleriaDestaques from '@/components/GaleriaDestaques';
import {
  buscarDestaques,
  comFallbackDestaques,
} from '@/lib/content';

/**
 * GALERIA OFICIAL DE ATLETAS EM DESTAQUE — /atletasdestaques
 *
 * Server Component: os destaques são buscados no banco no servidor e a
 * página já chega ao HTML com os atletas. Só o filtro por modalidade é
 * interativo (component/GaleriaDestaques.tsx).
 *
 * ANTES, esta página:
 *   • lia `localStorage.getItem("arenavale_atletas")` — uma chave que
 *     NENHUM código do projeto escreve. O painel publica no Supabase e a
 *     Home lê do Supabase; a galeria lia do localStorage. Resultado: os
 *     atletas publicados NUNCA apareciam aqui — ela mostrava sempre os
 *     3 atletas fictícios do fallback, com avatares de placeholder;
 *   • tinha o filtro "VOLEIBOL" (digitado errado), que não filtrava
 *     nada, e sem botão para a modalidade Vôlei;
 *   • mostrava apenas um spinner no HTML inicial, sem nenhum atleta.
 */
export const revalidate = 60;

export const metadata = {
  title: 'Atletas em Destaque | Arena Vale',
  description:
    'Os talentos, artilheiros e protagonistas das competições do ecossistema Arena Vale.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AtletasDestaquesPage() {
  const supabase = createPublicClient();
  const { destaques: linhas } = await buscarDestaques(supabase);
  const atletas = comFallbackDestaques(linhas);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-clip">
      {/* CABEÇALHO */}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-12 flex-grow space-y-10">
        <div className="text-center sm:text-left border-b border-white/10 pb-8">
          <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff2a35] mb-3">
            GALERIA OFICIAL · 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Atletas em Destaque
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-2 uppercase max-w-2xl">
            Os talentos, artilheiros e protagonistas das competições do ecossistema Arena Vale.
          </p>
        </div>

        <GaleriaDestaques destaques={atletas} />
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#0b0b0c] py-6 text-center text-xs text-[#71717a]">
        © 2026 Arena Vale · Todos os direitos reservados.
      </footer>
    </div>
  );
}
