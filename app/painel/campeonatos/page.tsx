'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';

interface CampeonatoItem {
  id: number;
  nome: string;
  modalidade: string;
  imagemCapa: string | null;
  status: string;
}

export default function CampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState<CampeonatoItem[]>([
    {
      id: 1,
      nome: 'Copa Regional Vale 2026',
      modalidade: 'Futebol Suíço',
      imagemCapa: null,
      status: 'Ativo',
    },
    {
      id: 2,
      nome: 'Circuito Futsal Arena',
      modalidade: 'Futsal',
      imagemCapa: null,
      status: 'Ativo',
    },
  ]);

  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('Futebol Suíço');
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Manipular upload de imagem e criar URL de pré-visualização local
  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagemPreview(url);
    }
  }

  // Remover a imagem selecionada
  function handleRemoverImagem() {
    setImagemPreview(null);
  }

  // Submissão do formulário
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const novoTorneio: CampeonatoItem = {
      id: Date.now(),
      nome,
      modalidade,
      imagemCapa: imagemPreview,
      status: 'Ativo',
    };

    setCampeonatos((prev) => [novoTorneio, ...prev]);
    setNome('');
    setImagemPreview(null);
    setSucesso(true);

    setTimeout(() => setSucesso(false), 4000);
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 max-w-5xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>

      <h1 className="text-2xl font-bold mt-4 uppercase">Gerir Campeonatos</h1>
      <p className="text-sm text-slate-400 mb-6">Cadastre copas, adicione a identidade visual e acompanhe os torneios registados.</p>

      {/* FORMULÁRIO DE CRIAÇÃO */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Nome do Campeonato</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Copa Arena Vale 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Modalidade</label>
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
