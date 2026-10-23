'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Transmissao {
  id: string;
  titulo: string;
  descricao: string;
  youtube_id: string;
  ao_vivo: boolean;
}

export default function TVArenaPage() {
  const [transmissaoAtiva, setTransmissaoAtiva] = useState<Transmissao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function carregarTransmissao() {
      try {
        const { data, error } = await supabase
          .from('transmissoes')
          .select('*')
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setTransmissaoAtiva(data[0]);
        }
      } catch {
        // Mantém fallback caso a tabela ainda não exista no Supabase
      } finally {
        setCarregando(false);
      }
    }

    carregarTransmissao();
  }, [supabase]);

  // ID padrão do canal ou live oficial caso não haja registro na tabela
  const defaultYoutubeId = 'live_stream?channel=UC_TVArenaVale'; // Ou substitua pelo ID de um vídeo/live real de exemplo

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* CABEÇALHO SIMPLIFICADO */}
      <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-wider text-amber-400">
            ARENA VALE <span className="text-xs text-slate-400 font-normal uppercase ml-2">| TV Oficial</span>
          </Link>
          <Link href="/" className="text-xs text-slate-300 hover:text-amber-400 font-bold transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> Transmissão Oficial
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            {transmissaoAtiva ? transmissaoAtiva.titulo : 'TV Arena Vale Ao Vivo'}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {transmissaoAtiva ? transmissaoAtiva.descricao : 'Acompanhe os melhores momentos, coberturas completas e jogos decisivos da nossa região em alta definição.'}
          </p>
        </div>

        {/* PLAYER DO YOUTUBE RESPONSIVO */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-[#0a1120] shadow-2xl">
          <iframe
            className="w-full h-full absolute inset-0"
            src={`https://www.youtube.com/embed/${transmissaoAtiva?.youtube_id || 'live_stream?channel=UCPX_Exemplo'}`}
            title="TV Arena Vale Ao Vivo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* BOTÃO DE ACESSO AO CANAL */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-[#0a1120] border border-slate-800 gap-4">
          <div>
            <h3 className="font-bold text-white uppercase text-sm">Inscreva-se no Canal Oficial</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ative as notificações no YouTube para não perder nenhuma live de Futsal e Futebol 7.</p>
          </div>
          <a
            href="https://www.youtube.com/@TVArenaVale"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex-shrink-0"
          >
            Acessar o YouTube ↗
          </a>
        </div>

      </main>
    </div>
  );
}
