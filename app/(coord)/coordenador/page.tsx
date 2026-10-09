'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('CAPITAO');
  const [equipe, setEquipe] = useState('');

  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Carlos Eduardo', papel: 'MODERADOR', equipe: 'Arena Vale Oficial', email: 'carlos@arenavale.com' },
    { id: 2, nome: 'Lucas Silveira', papel: 'CAPITAO', equipe: 'Fênix Club', email: 'lucas@fenix.com' },
    { id: 3, nome: 'Rodrigo Matos', papel: 'CAPITAO', equipe: 'Vale United', email: 'rodrigo@valeunited.com' }
  ]);

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    setUsuarios((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome,
        email,
        papel,
        equipe: equipe || 'Geral'
      }
    ]);

    setNome('');
    setEmail('');
    setEquipe('');
    setModalAberto(false);
  };

  const modulos = [
    {
      titulo: 'ATLETAS EM DESTAQUE',
      subtitulo: 'Gerenciamento de fotos, perfis e aprovação pública dos atletas.',
      tag: 'EDITORIAL',
      link: '/coordenador/atletasdestaques',
      botao: 'Acessar Galeria & Perfis →',
      destaque: true
    },
    {
      titulo: 'TRANSMISSÕES AO VIVO',
      subtitulo: 'Configuração do player, links do YouTube e placar da rodada.',
      tag: 'TV ARENA',
      link: '/#aovivo',
      botao: 'Configurar Transmissões →',
      destaque: false
    },
    {
      titulo: 'SOLICITAÇÕES DE INSCRIÇÃO',
      subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário oficial.',
      tag: 'CADASTROS',
      link: '/inscricao',
      botao: 'Ver Fluxo de Inscrição →',
      destaque: false
    },
    {
      titulo: 'CAMPEONATOS & TABELAS',
      subtitulo: 'Estruturação de torneios regionais, fases e premiações.',
      tag: 'COMPETIÇÕES',
      link: '/#campeonatos',
      botao: 'Gerir Campeonatos →',
      destaque: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between">
      {/* 1. CABEÇALHO DO PAINEL */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#e50914]/30 bg-[#e50914]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#e50914]">
              ● MODO GESTÃO ATIVO
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
              >
                Ver Site ↗
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* Banner de Boas-vindas */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
              PAINEL ADMINISTRATIVO
            </span>
            <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
              CENTRAL DE CONTROLE <br />
              <span className="text-[#e50914]">ARENA VALE</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed">
              Gerencie a cobertura desportiva, atletas, calendários e permissões de acesso da equipa técnica.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="rounded-full bg-[#e50914] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-105"
            >
              + Adicionar Moderador / Capitão
            </button>
          </div>
        </div>

        {/* SECÇÃO: GESTÃO DE MODERADORES E CAPITÃES */}
        <section className="mb-12 rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
                EQUIPA & PERMISSÕES
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Moderadores e Capitães Credenciados
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e50914] hover:border-[#e50914]"
            >
              + Novo Cadastro
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8a92a6] uppercase tracking-wider">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Cargo / Função</th>
                  <th className="py-3 px-4">Equipa Vinculada</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-bold text-white">{u.nome}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          u.papel === 'MODERADOR'
                            ? 'bg-[#e50914]/20 text-[#ff4d56]'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {u.papel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#cad0e0]">{u.equipe}</td>
                    <td className="py-4 px-4 text-[#8a92a6]">{u.email}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setUsuarios(usuarios.filter((item) => item.id !== u.id))}
                        className="text-xs text-[#8a92a6] hover:text-[#e50914]"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECÇÃO: MÓDULOS GERAIS */}
        <div className="grid gap-6 sm:grid-cols-2">
          {modulos.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-[2rem] border p-8 shadow-xl transition hover:border-[#e50914]/50 ${
                m.destaque
                  ? 'border-[#e50914]/40 bg-[#161a24]'
                  : 'border-white/10 bg-[#13161f]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                    {m.tag}
                  </span>
                  {m.destaque && (
                    <span className="rounded-full bg-[#e50914] px-2.5 py-0.5 text-[10px] font-black text-white">
                      PRINCIPAL
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                  {m.titulo}
                </h2>
                <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">
                  {m.subtitulo}
                </p>
              </div>

              <div className="mt-8 border-t border-white/5 pt-5">
                <Link
                  href={m.link}
                  className={`inline-flex items-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider transition ${
                    m.destaque
                      ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-105'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:border-white/30 hover:text-white'
                  }`}
                >
                  {m.botao}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL PARA NOVO CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase text-white">Novo Credenciamento</h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-sm font-bold text-[#8a92a6] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrar} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cad0e0]">
                  Tipo de Acesso
                </label>
                <select
                  value={papel}
                  onChange={(e) => setPapel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
                >
                  <option value="CAPITAO">Capitão de Equipa</option>
                  <option value="MODERADOR">Moderador Editorial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cad0e0]">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Pedro Henrique"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cad0e0]">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cad0e0]">
                  Equipa Vinculada
                </label>
                <input
                  type="text"
                  value={equipe}
                  onChange={(e) => setEquipe(e.target.value)}
                  placeholder="Ex: Fênix Club"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-[#8a92a6] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#ff1e27]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>© 2026 Arena Vale · Sistema de Gestão Interna</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Galeria de Atletas</Link>
            <Link href="/login" className="hover:text-white">Sair</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
