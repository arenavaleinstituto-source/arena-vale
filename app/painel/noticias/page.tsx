'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function NoticiasPage() {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    setSucesso(true);
    setTitulo('');
    setConteudo('');
    setTimeout(() => setSucesso(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-6 max-w-4xl mx-auto">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>
      
      <h1 className="text-2xl font-bold mt-4 uppercase">Publicar Notícias & Comunicados</h1>
      <p className="text-sm text-slate-400 mb-6">Lance notas oficiais, convocações de arbitragem e atualizações.</p>

      <form onSubmit={handlePost} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <div>
          <label className="text-xs text-slate-300 block mb-1">Título da Notícia</label>
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
          <label className="text-xs text-slate-300 block mb-1">Conteúdo do Comunicado</label>
          <textarea
            rows={5}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva os detalhes da notícia..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        {sucesso && <p className="text-xs text-emerald-400 font-medium">Notícia publicada com sucesso!</p>}

        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          Publicar Notícia
        </button>
      </form>
    </div>
  );
}
