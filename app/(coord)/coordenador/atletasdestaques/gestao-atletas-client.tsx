'use client';

import React, { useState } from 'react';

interface Atleta {
  id: number;
  nome: string;
  modalidade: string;
  posicao: string;
  cidade: string;
  idade: number;
  destaque: boolean;
  status: 'APROVADO' | 'PENDENTE';
}

export default function GestaoAtletasClient() {
  const [atletas, setAtletas] = useState<Atleta[]>([
    {
      id: 1,
      nome: 'Gabriel Mendes',
      modalidade: 'Futsal',
      posicao: 'Ala / Fixo',
      cidade: 'Blumenau',
      idade: 19,
      destaque: true,
      status: 'APROVADO'
    },
    {
      id: 2,
      nome: 'Lucas Silveira',
      modalidade: 'Basquetebol',
      posicao: 'Armador',
      cidade: 'Gaspar',
      idade: 21,
      destaque: true,
      status: 'APROVADO'
    },
    {
      id: 3,
      nome: 'Matheus Rocha',
      modalidade: 'Voleibol',
      posicao: 'Ponteiro',
      cidade: 'Indaial',
      idade: 18,
      destaque: false,
      status: 'PENDENTE'
    },
    {
      id: 4,
      nome: 'Felipe Antunes',
      modalidade: 'Futebol 7',
      posicao: 'Meio-Campo',
      cidade: 'Brusque',
      idade: 22,
      destaque: false,
      status: 'PENDENTE'
    }
  ]);

  const [filtroModalidade, setFiltroModalidade] = useState<string>('TODAS');
  const [pesquisa, setPesquisa] = useState<string>('');

  const [novoNome, setNovoNome] = useState('');
  const [novaModalidade, setNovaModalidade] = useState('Futsal');
  const [novaPosicao, setNovaPosicao] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [novaIdade, setNovaIdade] = useState('');

  const alternarDestaque = (id: number) => {
    setAtletas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, destaque: !a.destaque } : a))
    );
  };

  const alternarStatus = (id: number) => {
    setAtletas((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'APROVADO' ? 'PENDENTE' : 'APROVADO' }
          : a
      )
    );
  };

  const removerAtleta = (id: number) => {
    if (confirm('Tem a certeza de que deseja remover este atleta da base?')) {
      setAtletas((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const adicionarAtleta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novaPosicao.trim() || !novaCidade.trim()) return;

    const novo: Atleta = {
      id: Date.now(),
      nome: novoNome.trim(),
      modalidade: novaModalidade,
      posicao: novaPosicao.trim(),
      cidade: novaCidade.trim(),
      idade: Number(novaIdade) || 18,
      destaque: false,
      status: 'APROVADO'
    };

    setAtletas([novo, ...atletas]);
    setNovoNome('');
    setNovaPosicao('');
    setNovaCidade('');
    setNovaIdade('');
    alert('Atleta cadastrado com sucesso!');
  };

  const atletasFiltrados = atletas.filter((a) => {
    const matchModalidade =
      filtroModalidade === 'TODAS' || a.modalidade === filtroModalidade;
    const matchPesquisa =
      a.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      a.cidade.toLowerCase().includes(pesquisa.toLowerCase());
    return matchModalidade && matchPesquisa;
  });

  return (
    <div className="space-y-10">
      <div className="rounded-[2.5rem] border border-white/10 bg-[#161a24] p-6 sm:p-8 shadow-xl">
        <span className="text-xs font-black uppercase tracking-widest text-[#e50914]">
          NOVO REGISTO EDITORIAL
        </span>
        <h2 className="mt-2 text-xl font-black uppercase text-white">
          Registar Atleta em Destaque
        </h2>
        <p className="mt-1 text-xs text-[#8a92a6]">
          Adicione um atleta diretamente à galeria com estatísticas e dados de homologação.
        </p>

        <form onSubmit={adicionarAtleta} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Gabriel Mendes"
              className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
              Modalidade
            </label>
            <select
              value={novaModalidade}
              onChange={(e) => setNovaModalidade(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            >
              <option value="Futsal">Futsal</option>
              <option value="Voleibol">Voleibol</option>
              <option value="Basquetebol">Basquetebol</option>
              <option value="Futebol 7">Futebol 7</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
              Posição
            </label>
            <input
              type="text"
              required
              value={novaPosicao}
              onChange={(e) => setNovaPosicao(e.target.value)}
              placeholder="Ex: Ala / Pivô"
              className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
              Cidade / Clube
            </label>
            <input
              type="text"
              required
              value={novaCidade}
              onChange={(e) => setNovaCidade(e.target.value)}
              placeholder="Ex: Blumenau"
              className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
              Idade
            </label>
            <input
              type="number"
              required
              value={novaIdade}
              onChange={(e) => setNovaIdade(e.target.value)}
              placeholder="Ex: 19"
              className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase text-white hover:bg-[#ff1e27] transition shadow-lg shadow-[#e50914]/20"
            >
              + Adicionar à Galeria
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          {['TODAS', 'Futsal', 'Voleibol', 'Basquetebol', 'Futebol 7'].map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setFiltroModalidade(mod)}
              className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                filtroModalidade === mod
                  ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                  : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar por nome ou cidade..."
          className="rounded-full border border-white/15 bg-[#0b0d12] px-4 py-1.5 text-xs text-white outline-none focus:border-[#e50914] w-64"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {atletasFiltrados.map((atleta) => (
          <div
            key={atleta.id}
            className={`flex flex-col justify-between rounded-[2rem] border p-6 shadow-xl transition ${
              atleta.destaque
                ? 'border-[#e50914]/50 bg-gradient-to-b from-[#1c1417] to-[#13161f]'
                : 'border-white/10 bg-[#13161f]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                  {atleta.modalidade}
                </span>
                <span
                  className={`text-[10px] font-black ${
                    atleta.status === 'APROVADO' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  ● {atleta.status}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white">
                {atleta.nome}
              </h3>
              <p className="text-xs font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">
                {atleta.posicao} · {atleta.idade} anos
              </p>
              <p className="mt-2 text-xs text-[#8a92a6]">
                📍 {atleta.cidade}
              </p>
            </div>

            <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alternarDestaque(atleta.id)}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-black uppercase tracking-wider transition ${
                    atleta.destaque
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  {atleta.destaque ? '★ Em Destaque na Home' : '☆ Destacar na Home'}
                </button>

                <button
                  type="button"
                  onClick={() => alternarStatus(atleta.id)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#cad0e0] hover:text-white transition"
                >
                  {atleta.status === 'APROVADO' ? 'Pausar' : 'Aprovar'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => removerAtleta(atleta.id)}
                className="w-full text-center text-[11px] font-bold text-red-400/70 hover:text-red-400 transition pt-1"
              >
                Remover Atleta ✕
              </button>
            </div>
          </div>
        ))}

        {atletasFiltrados.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-[#8a92a6]">
            Nenhum atleta encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
