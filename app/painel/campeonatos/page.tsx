'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';

interface Torneio {
  id: number;
  nome: string;
  modalidade: string;
  imagemCapa: string | null;
  status: string;
}

export default function CampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState<Torneio[]>([
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

  const handleImagem = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const item: Torneio = {
      id: Date.now(),
      nome,
      modalidade,
      imagemCapa: imagemPreview,
      status: 'Ativo',
    };

    setCampeonatos([item, ...campeonatos]);
    setNome('');
    setImagemPreview(null);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 max-w-5xl mx-auto font-sans">
      <Link href="/painel" className="text-xs text-amber-400 font-semibold hover:underline">
        ← Voltar ao Centro de Comando
      </Link>

      <h1 className="text-2xl font-bold mt-4 uppercase">Gerir Campeonatos</h1>
      <p className="text-sm text-slate-400 mb-6">Cadastre copas, adicione a capa/escudo e acompanhe os torneios registados.</p>

      <form onSubmit={handleSalvar} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 mb-8 shadow-xl">
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
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">
            Identidade Visual do Torneio (Logótipo ou Capa)
          </label>

          {imagemPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-52 flex items-center justify-center p-3">
              <img
                src={imagemPreview}
                alt="Pré-visualização do Torneio"
                className="max-h-44 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImagemPreview(null)}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-xs text-white font-semibold rounded-lg border border-slate-600 transition shadow"
              >
                Trocar Imagem
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition">
              <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center px-4">
                <span className="text-2xl mb-1">🛡️</span>
                <p className="text-xs text-slate-300 font-medium">
                  <span className="text-amber-400 underline">Clique para carregar o escudo ou banner</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG ou WEBP</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagem}
                className="hidden"
              />
            </label>
          )}
        </div>

        {sucesso && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs font-semibold">
            ✓ Campeonato adicionado com sucesso!
          </div>
        )}

        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-sm transition cursor-pointer"
        >
          Adicionar Campeonato
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
          Torneios Registrados
        </h2>

        {campeonatos.map((c) => (
          <div
            key={c.id}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {c.imagemCapa ? (
                <img
                  src={c.imagemCapa}
                  alt={c.nome}
                  className="w-14 h-14 object-contain rounded-lg bg-slate-950 border border-slate-800 p-1 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  🏆
                </div>
              )}

              <div>
                <span className="font-bold text-white text-base block">{c.nome}</span>
                <span className="text-xs text-slate-400 block mt-0.5">{c.modalidade}</span>
              </div>
            </div>

            <span className="text-xs px-3 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-semibold rounded-md">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
