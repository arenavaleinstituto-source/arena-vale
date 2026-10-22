'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TvArenaValePage() {
  const [urlTransmissao, setUrlTransmissao] = useState('');
  const [aoVivo, setAoVivo] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('Transmissão atualizada com sucesso!');
    setTimeout(() => setMensagem(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-6 max-w-4xl mx-auto">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>
      
      <h1 className="text-2xl font-bold mt-4 uppercase">Atualizar TV Arena Vale</h1>
      <p className="text-sm text-slate-400 mb-6">Gerencie o link de streaming ao vivo transmitido no site.</p>

      <form onSubmit={handleSalvar} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <div>
          <label className="text-xs text-slate-300 block mb-1">URL da Transmissão (YouTube / Twitch / Embed)</label>
          <input
            type="text"
            value={urlTransmissao}
            onChange={(e) => setUrlTransmissao(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="aovivo"
            checked={aoVivo}
            onChange={(e) => setAoVivo(e.target.checked)}
            className="w-4 h-4 rounded text-amber-400 focus:ring-0"
          />
          <label htmlFor="aovivo" className="text-sm text-slate-200">
            Marcar sinal como <strong>AO VIVO</strong> no portal principal
          </label>
        </div>

        {mensagem && <p className="text-xs text-emerald-400 font-medium">{mensagem}</p>}

        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          Salvar Transmissão
        </button>
      </form>
    </div>
  );
}
