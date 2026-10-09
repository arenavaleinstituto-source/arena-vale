'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  // Controle do Modo Proprietário Invisível
  const [isProprietario, setIsProprietario] = useState(false);
  const [modalMasterAberto, setModalMasterAberto] = useState(false);
  const [senhaMestre, setSenhaMestre] = useState('');
  const [erroMestre, setErroMestre] = useState('');

  // Modais de Criação de Coordenador e Equipe
  const [modalNovoCoord, setModalNovoCoord] = useState(false);
  const [novoCoordNome, setNovoCoordNome] = useState('');
  const [novoCoordCargo, setNovoCoordCargo] = useState('COORDENADOR DE COMPETIÇÕES');
  const [novoCoordEmail, setNovoCoordEmail] = useState('');
  const [novoCoordTel, setNovoCoordTel] = useState('');

  const [modalEquipeAberto, setModalEquipeAberto] = useState(false);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [emailEquipe, setEmailEquipe] = useState('');
  const [papelEquipe, setPapelEquipe] = useState('CAPITAO');
  const [timeEquipe, setTimeEquipe] = useState('');

  // 1. LISTA DINÂMICA DE COORDENADORES (GERENCIADA PELO PROPRIETÁRIO)
  const [coordenadores, setCoordenadores] = useState([
    {
      id: 1,
      cargo: 'COORDENADOR GERAL',
      nome: 'Coordenação Arena Vale',
      email: 'arenavale2026@gmail.com',
      tel: '(47) 98844-4404',
      status: 'ATIVO'
    },
    {
      id: 2,
      cargo: 'COORD. COMPETIÇÕES',
      nome: 'Gestão de Campeonatos',
      email: 'competicoes@arenavale.com.br',
      tel: '(47) 98844-4404',
      status: 'ATIVO'
    },
    {
      id: 3,
      cargo: 'COORD. COMUNICAÇÃO',
      nome: 'Mídia & TV Arena Vale',
      email: 'imprensa@arenavale.com.br',
      tel: '(47) 98844-4404',
      status: 'ATIVO'
    }
  ]);

  // 2. LISTA DE MODERADORES E CAPITÃES
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Carlos Eduardo', papel: 'MODERADOR', equipe: 'Arena Vale Oficial', email: 'carlos@arenavale.com' },
    { id: 2, nome: 'Lucas Silveira', papel: 'CAPITAO', equipe: 'Fênix Club', email: 'lucas@fenix.com' },
    { id: 3, nome: 'Rodrigo Matos', papel: 'CAPITAO', equipe: 'Vale United', email: 'rodrigo@valeunited.com' }
  ]);

  // Função para validar a Chave Secreta do Proprietário (padrão: 2026)
  const handleAcessoProprietario = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaMestre === '2026' || senhaMestre === 'arenavale2026') {
      setIsProprietario(true);
      setModalMasterAberto(false);
      setSenhaMestre('');
      setErroMestre('');
    } else {
      setErroMestre('Chave Mestra incorreta.');
    }
  };

  // Proprietário adiciona Coordenador
  const handleSalvarNovoCoord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCoordNome || !novoCoordEmail) return;

    if (coordenadores.length >= 3) {
      alert('Limite máximo de 3 coordenadores atingido! Remova um para adicionar outro.');
      return;
    }

    setCoordenadores([
      ...coordenadores,
      {
        id: Date.now(),
        cargo: novoCoordCargo,
        nome: novoCoordNome,
        email: novoCoordEmail,
        tel: novoCoordTel || '(47) 98844-4404',
        status: 'ATIVO'
      }
    ]);

    setNovoCoordNome('');
    setNovoCoordEmail('');
    setNovoCoordTel('');
    setModalNovoCoord(false);
  };

  // Coordenadores/Proprietário adicionam Moderador ou Capitão
  const handleSalvarEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEquipe || !emailEquipe) return;

    setUsuarios([
      ...usuarios,
      {
        id: Date.now(),
        nome: nomeEquipe,
        email: emailEquipe,
        papel: papelEquipe,
        equipe: timeEquipe || 'Geral'
      }
    ]);

    setNomeEquipe('');
    setEmailEquipe('');
    setTimeEquipe('');
    setModalEquipeAberto(false);
  };

  const modulos = [
    {
      titulo: 'ATLETAS EM DESTAQUE',
      subtitulo: 'Aprovação editorial, fotos e perfil de novos talentos.',
      tag: 'EDITORIAL',
      link: '/coordenador/atletasdestaques',
      botao: 'Acessar Galeria →',
      destaque: true
    },
    {
      titulo: 'TRANSMISSÕES AO VIVO',
      subtitulo: 'Manutenção do link do YouTube, status e placares ao vivo.',
      tag: 'TV ARENA',
      link: '/#aovivo',
      botao: 'Configurar Jogos →',
      destaque: false
    },
    {
      titulo: 'SOLICITAÇÕES DE INSCRIÇÃO',
      subtitulo: 'Gestão de atletas recém-cadastrados no formulário.',
      tag: 'CADASTROS',
      link: '/inscricao',
      botao: 'Ver Solicitações →',
      destaque: false
    },
    {
      titulo: 'CAMPEONATOS & TABELAS',
      subtitulo: 'Atualização de fases, confrontos e datas de jogos.',
      tag: 'COMPETIÇÕES',
      link: '/#campeonatos',
      botao: 'Gerir Torneios →',
      destaque: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* O GATILHO INVISÍVEL: Clicar 2x ou clicar no logotipo abre a autenticação do Proprietário */}
            <button
              type="button"
              onClick={() => {
                if (isProprietario) {
                  setIsProprietario(false);
                } else {
                  setModalMasterAberto(true);
                }
              }}
              title="Acesso Seguro"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914]"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isProprietario ? (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300 animate-pulse">
                👑 MODO PROPRIETÁRIO ATIVO
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#e50914]/30 bg-[#e50914]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                ● GESTÃO DO COORDENADOR
              </span>
            )}
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

      {/* 2. ÁREA CENTRAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* Banner */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            {isProprietario ? 'ACESSO MASTER DO PROPRIETÁRIO' : 'SISTEMA DE GESTÃO DO COORDENADOR'}
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            CENTRAL DE CONTROLE <br />
            <span className="text-[#e50914]">ARENA VALE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            {isProprietario
              ? 'Você tem controle total sobre quem coordena a plataforma. Adicione novos coordenadores ou exclua o acesso a qualquer instante.'
              : 'Espaço dos coordenadores para atualização de conteúdos, tabelas de jogos, moderação de atletas e supervisão técnica.'}
          </p>
        </div>

        {/* SECÇÃO DOS 3 COORDENADORES (COM CONTROLE EXCLUSIVO DO PROPRIETÁRIO) */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
                ALTA GESTÃO DE CONTEÚDO (MÁXIMO 3)
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Coordenadores do Portal
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#8a92a6]">
                {coordenadores.length} / 3 Vagas Ocupadas
              </span>

              {/* Botão que só o PROPRIETÁRIO vê/pode usar */}
              {isProprietario && coordenadores.length < 3 && (
                <button
                  type="button"
                  onClick={() => setModalNovoCoord(true)}
                  className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-amber-400"
                >
                  + Add Coordenador
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {coordenadores.map((coord, idx) => (
              <div
                key={coord.id}
                className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                      COORDENADOR {idx + 1}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                  </div>

                  <h3 className="mt-4 text-base font-black uppercase tracking-tight text-white">
                    {coord.nome}
                  </h3>
                  <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">
                    {coord.cargo}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                    <p className="truncate">✉ {coord.email}</p>
                    <p>📱 {coord.tel}</p>
                  </div>
                </div>

                {/* BOTÃO DE EXCLUIR ACESSO DO COORDENADOR (EXCLUSIVO DO PROPRIETÁRIO) */}
                {isProprietario ? (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover definitivamente o acesso de ${coord.nome}?`)) {
                          setCoordenadores(coordenadores.filter((c) => c.id !== coord.id));
                        }
                      }}
                      className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      Excluir Acesso ✕
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-white/5 pt-3 text-[11px] text-[#555d6e] text-center">
                    Permissão de Manutenção Ativa
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECÇÃO DE MANUTENÇÃO DE CONTEÚDO (COORDENADORES E PROPRIETÁRIO OPERAM AQUI) */}
        <section className="mb-12">
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
              PAINEL OPERACIONAL
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
              Manutenção de Conteúdo do Site
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {modulos.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col justify-between rounded-[2rem] border p-8 shadow-xl transition hover:border-[#e50914]/50 ${
                  m.destaque ? 'border-[#e50914]/40 bg-[#161a24]' : 'border-white/10 bg-[#13161f]'
                }`}
              >
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                    {m.tag}
                  </span>
                  <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                    {m.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">
                    {m.subtitulo}
                  </p>
                </div>

                <div className="mt-8 border-t border-white/5 pt-5">
                  <Link
                    href={m.link}
                    className={`inline-flex items-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider transition ${
                      m.destaque
                        ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27]'
                        : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                    }`}
                  >
                    {m.botao}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODERADORES E CAPITÃES */}
        <section className="mb-12 rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
                EQUIPA TÉCNICA DE CAMPO
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Moderadores e Capitães
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setModalEquipeAberto(true)}
              className="rounded-full bg-[#e50914] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27]"
            >
              + Adicionar Equipe / Capitão
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8a92a6] uppercase tracking-wider">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4">Equipa</th>
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
      </main>

      {/* MODAL SECRETO DO PROPRIETÁRIO */}
      {modalMasterAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-[2.5rem] border border-amber-500/40 bg-[#13161f] p-8 shadow-2xl">
            <div className="text-center">
              <span className="text-2xl">👑</span>
              <h3 className="mt-2 text-xl font-black uppercase text-white">Chave do Proprietário</h3>
              <p className="mt-1 text-xs text-[#8a92a6]">Digite o PIN mestre para desbloquear a gestão de coordenadores.</p>
            </div>

            {erroMestre && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-center text-xs text-red-400">
                {erroMestre}
              </div>
            )}

            <form onSubmit={handleAcessoProprietario} className="mt-6 space-y-4">
              <input
                type="password"
                required
                value={senhaMestre}
                onChange={(e) => setSenhaMestre(e.target.value)}
                placeholder="PIN Mestre (ex: 2026)"
                className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-center text-sm text-white outline-none focus:border-amber-400"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalMasterAberto(false)}
                  className="w-1/2 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-[#8a92a6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-full bg-amber-500 py-2.5 text-xs font-black uppercase text-black hover:bg-amber-400"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO PROPRIETÁRIO: ADICIONAR COORDENADOR */}
      {modalNovoCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase text-white">Novo Coordenador</h3>
            <p className="text-xs text-[#8a92a6] mt-1">Conceda permissão de manutenção do site a um novo membro.</p>

            <form onSubmit={handleSalvarNovoCoord} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Função / Cargo</label>
                <input
                  type="text"
                  required
                  value={novoCoordCargo}
                  onChange={(e) => setNovoCoordCargo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoCoordNome}
                  onChange={(e) => setNovoCoordNome(e.target.value)}
                  placeholder="Nome do coordenador"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">E-mail</label>
                <input
                  type="email"
                  required
                  value={novoCoordEmail}
                  onChange={(e) => setNovoCoordEmail(e.target.value)}
                  placeholder="coordenador@arenavale.com"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Telefone</label>
                <input
                  type="text"
                  value={novoCoordTel}
                  onChange={(e) => setNovoCoordTel(e.target.value)}
                  placeholder="(47) 98844-4404"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoCoord(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-[#8a92a6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-black uppercase text-black hover:bg-amber-400"
                >
                  Confirmar Coordenador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COORDENADOR: ADICIONAR MODERADOR/CAPITÃO */}
      {modalEquipeAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase text-white">Credenciar Equipe</h3>

            <form onSubmit={handleSalvarEquipe} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Função</label>
                <select
                  value={papelEquipe}
                  onChange={(e) => setPapelEquipe(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2 text-xs text-white"
                >
                  <option value="CAPITAO">Capitão de Equipa</option>
                  <option value="MODERADOR">Moderador Editorial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Nome</label>
                <input
                  type="text"
                  required
                  value={nomeEquipe}
                  onChange={(e) => setNomeEquipe(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">E-mail</label>
                <input
                  type="email"
                  required
                  value={emailEquipe}
                  onChange={(e) => setEmailEquipe(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#cad0e0]">Time / Equipe</label>
                <input
                  type="text"
                  value={timeEquipe}
                  onChange={(e) => setTimeEquipe(e.target.value)}
                  placeholder="Ex: Fênix Club"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEquipeAberto(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-[#8a92a6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#e50914] px-6 py-2 text-xs font-black uppercase text-white hover:bg-[#ff1e27]"
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
