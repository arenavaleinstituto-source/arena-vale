'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [isProprietario, setIsProprietario] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [msgErro, setMsgErro] = useState('');

  // Formulário do novo coordenador
  const [nomeNovo, setNomeNovo] = useState('');
  const [cargoNovo, setCargoNovo] = useState('COORDENADOR DE COMPETIÇÕES');
  const [emailNovo, setEmailNovo] = useState('');
  const [passNovo, setPassNovo] = useState('');

  const [coordenadores, setCoordenadores] = useState([
    { id: 1, cargo: 'COORDENADOR GERAL', nome: 'Coordenação Arena Vale', email: 'arenavale2026@gmail.com', tel: '(47) 98844-4404' },
    { id: 2, cargo: 'COORD. COMPETIÇÕES', nome: 'Gestão de Campeonatos', email: 'competicoes@arenavale.com.br', tel: '(47) 98844-4404' },
    { id: 3, cargo: 'COORD. COMUNICAÇÃO', nome: 'Mídia & TV Arena Vale', email: 'imprensa@arenavale.com.br', tel: '(47) 98844-4404' }
  ]);

  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Aprovação editorial, fotos e perfil de novos talentos.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Manutenção do player, YouTube e placares ao vivo.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar Jogos →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Solicitações →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Estruturação de torneios regionais, fases e datas.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Torneios →', destaque: false }
  ];

  const handleValidarProprietario = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput.trim().toUpperCase() === 'VINIGUTO2020') {
      setIsProprietario(true);
      setMsgErro('');
      setSenhaInput('');
    } else {
      setMsgErro('Senha incorreta! Digite VINIGUTO2020');
    }
  };

  const handleCadastrarCoordenador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovo || !emailNovo || !passNovo) return;

    if (coordenadores.length >= 3) {
      alert('Limite de 3 coordenadores preenchido! Remova um para adicionar outro.');
      return;
    }

    setCoordenadores([
      ...coordenadores,
      {
        id: Date.now(),
        cargo: cargoNovo,
        nome: nomeNovo,
        email: emailNovo,
        tel: '(47) 98844-4404'
      }
    ]);

    alert('Coordenador ' + nomeNovo + ' credenciado com sucesso!');
    setNomeNovo('');
    setEmailNovo('');
    setPassNovo('');
    setModalAberto(false);
  };

  const removerCoordenador = (id: number) => {
    if (confirm('Deseja realmente revogar o acesso deste coordenador?')) {
      setCoordenadores(coordenadores.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              title="Acesso Proprietário"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-[#161922] shadow-inner transition hover:border-amber-400"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
            >
              👑 Proprietário
            </button>
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
      </header>

      {/* 2. ÁREA CENTRAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        <div className="rounded-[2.5rem] border border-white/10 bg-[#161a24] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            PAINEL ADMINISTRATIVO
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            CENTRAL DE CONTROLE <br />
            <span className="text-[#e50914]">ARENA VALE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Gestão executiva da coordenação geral, atletas, equipas, transmissões e tabelas da temporada.
          </p>
        </div>

        {/* 3 COORDENADORES */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
                ALTA GESTÃO (3 VAGAS)
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Coordenadores Oficiais
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#8a92a6]">
                {coordenadores.length} / 3 Ocupadas
              </span>
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25"
              >
                Gerenciar Acessos ⚙
              </button>
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

                {isProprietario && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => removerCoordenador(coord.id)}
                      className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
                    >
                      Excluir Acesso ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MÓDULOS DE MANUTENÇÃO */}
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
      </main>

      {/* MODAL PROPRIETÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-amber-500/30 bg-[#13161f] p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                👑 Painel do Proprietário
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-sm font-bold text-[#8a92a6] hover:text-white"
              >
                ✕
              </button>
            </div>

            {!isProprietario ? (
              <form onSubmit={handleValidarProprietario} className="mt-6 space-y-4">
                <p className="text-xs text-[#8a92a6]">Digite a senha mestre para desbloquear o gerenciamento:</p>
                {msgErro && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-center text-xs text-red-400">
                    {msgErro}
                  </div>
                )}
                <input
                  type="password"
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="Senha Mestre (ex: VINIGUTO2020)"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-center text-sm uppercase text-white outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-amber-500 py-3 text-xs font-black uppercase text-black hover:bg-amber-400 transition"
                >
                  Desbloquear Acesso
                </button>
              </form>
            ) : (
              <form onSubmit={handleCadastrarCoordenador} className="mt-6 space-y-4">
                <p className="text-xs text-amber-300 font-bold">● Acesso autenticado. Adicione o novo coordenador:</p>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Nome do Coordenador</label>
                  <input
                    type="text"
                    required
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Cargo</label>
                  <input
                    type="text"
                    required
                    value={cargoNovo}
                    onChange={(e) => setCargoNovo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">E-mail de Acesso</label>
                  <input
                    type="email"
                    required
                    value={emailNovo}
                    onChange={(e) => setEmailNovo(e.target.value)}
                    placeholder="coordenador@arenavale.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    value={passNovo}
                    onChange={(e) => setPassNovo(e.target.value)}
                    placeholder="Crie a senha do coordenador"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 rounded-full bg-amber-500 py-3 text-xs font-black uppercase text-black hover:bg-amber-400 transition"
                >
                  Salvar e Credenciar
                </button>
              </form>
            )}
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
