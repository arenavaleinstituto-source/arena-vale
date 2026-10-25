'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicNoticiasPage() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchNoticias = async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNoticias(data);
      }
      setLoading(false);
    };

    fetchNoticias();
  }, []);

  return (
    <div className="min-h-screen bg-[#070b13] font-sans text-white">
      {/* Cabeçalho Simples (depois faremos um menu global) */}
      <header className="bg-[#101726] border-b border-white/10 py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black text-[#d4af37] uppercase tracking-widest">
            Arena Vale <span className="text-white">News</span>
          </div>
          <Link href="/" className="text-sm font-bold uppercase text-[#8a92a6] hover:text-[#d4af37] transition">
            Voltar à Home
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto p-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider mb-4">
            Comunicados <span className="text-[#d4af37]">Oficiais</span>
          </h1>
          <p className="text-[#8a92a6] max-w-2xl mx-auto">
            Acompanhe as últimas novidades, convocações de arbitragem e resultados dos campeonatos da Arena Vale.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-[#d4af37] font-bold uppercase animate-pulse">A carregar notícias...</div>
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-20 bg-[#101726] rounded-2xl border border-white/10">
            <p className="text-[#8a92a6] font-bold">Ainda não há notícias publicadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {noticias.map((nota) => (
              <article key={nota.id} className="bg-[#101726] border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4af37]/50 transition group flex flex-col">
                {/* Imagem de Capa */}
                <div className="h-48 bg-[#070b13] relative overflow-hidden flex items-center justify-center border-b border-white/10">
                  {nota.imagem_url ? (
                    <img 
                      src={nota.imagem_url} 
                      alt={nota.titulo} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <span className="text-4xl opacity-20">📷</span>
                  )}
                  
                  {/* Selo (se existir) */}
                  {nota.selo && (
                    <div className="absolute top-4 left-4 bg-[#d4af37] text-[#070b13] text-[10px] font-black uppercase px-3 py-1 rounded shadow-lg">
                      {nota.selo}
                    </div>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                      {nota.categoria}
                    </span>
                    <span className="text-[#8a92a6] text-xs">
                      {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-[#d4af37] transition">
                    {nota.titulo}
                  </h2>
                  
                  <p className="text-[#8a92a6] text-sm line-clamp-3 mb-6 flex-grow">
                    {nota.conteudo}
                  </p>
                  
                  <button className="mt-auto text-xs font-bold uppercase tracking-wider text-white border border-white/20 hover:border-[#d4af37] hover:bg-[#d4af37]/10 w-full py-3 rounded-lg transition">
                    Ler Mais
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
