'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CampeonatoItem {
  id: number;
  nome: string;
  modalidade: string;
}

export default function CampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState<CampeonatoItem[]>([
    { id: 1, nome: 'Copa Regional Vale 2026', modalidade: 'Futebol Suíço' },
    { id: 2, nome: 'Circuito Futsal Arena', modalidade: 'Futsal' },
  ]);
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('Futebol Suíço');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const novo = {
      id: Date.now(),
      nome,
      modalidade,
    };

    setCampeonatos((prev) => [novo, ...prev]);
    setNome('');
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-6 max-w-5xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>
      
      <h1 className="text-2xl font-bold mt-4 uppercase">Gerir Campeonatos</h1>
      <p className="text-sm text-slate-400 mb-6">Cadastre copas e visualize os torneios ativos.</p>

      {/* Formulário de Criação */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-5 rounded-xl border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-300 block mb-1">Nome do Campeonato</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Copa Arena Vale 2026"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>
        <div className="w-full md:w-56">
          <label className="text-xs text-slate-300 block mb-1">Modalidade</label>
          <select
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
          >
            <option value="Futebol Suíço">Futebol Suíço</option>
            <option value="Futsal">Futsal</option>
            <option value="Futebol de Campo">Futebol de Campo</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-sm transition cursor-pointer"
        >
          Adicionar
        </button>
      </form>

      {/* Lista de Campeonatos */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase font-bold text-slate-400">Torneios Registrados</h2>
        {campeonatos.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Nenhum campeonato cadastrado ainda.</p>
        ) : (
          campeonatos.map((c) => (
            <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{c.nome}</span>
                <span className="text-xs text-slate-400 block">{c.modalidade}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded">
                Ativo
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
