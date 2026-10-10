'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface UsuarioAcesso {
  id: number;
  nome: string;
  email: string;
  papel: 'COORDENADOR' | 'MODERADOR' | 'CAPITAO';
  detalhe?: string;
}

export default function PainelProprietarioPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'coordenadores' | 'moderadores' | 'capitaes'>('coordenadores');

  const [coordenadores, setCoordenadores] = useState<UsuarioAcesso[]>([
    { id: 2, nome: 'Gestão de Campeonatos', email: 'competicoes@arenavale.com.br', papel: 'COORDENADOR', detalhe: 'COORD. COMPETIÇÕES' },
    { id: 3, nome: 'Mídia & TV Arena Vale', email: 'imprensa@arenavale.com.br', papel: 'COORDENADOR', detalhe: 'COORD. COMUNICAÇÃO' }
  ]);

  const [moderadores, setModeradores] = useState<UsuarioAcesso[]>([
    { id: 101, nome: 'Árbitro & Mesa 01', email: 'mesa1@arenavale.com.br', papel: 'MODERADOR', detalhe: 'Torneio Vale do Itajaí' }
  ]);

  const [capitaes, setCapitaes] = useState<UsuarioAcesso[]>([
    { id: 201, nome: 'Capitão Carlos', email: 'carlos.capitao@arenavale.com.br', papel: 'CAPITAO', detalhe: 'Equipe Futsal Principal' }
  ]);

  const [nomeNovo, setNomeNovo] = useState('');
  const [emailNovo, setEmailNovo] = useState('');
  const [senhaNovo, setSenhaNovo] = useState('');
  const [detalheNovo, setDetalheNovo] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      emailLogin.trim().toLowerCase() === 'pmmiranda2017@gmail.com' &&
      senhaLogin.trim().toUpperCase() === 'VINIGUTO2020'
    ) {
      setAutenticado(true);
      setErroLogin('');
    } else {
      setErroLogin('Credenciais inválidas. Verifique o e-mail e a senha mestra.');
    }
  };

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovo.trim() || !emailNovo.trim() || !senhaNovo.trim()) return;

    if (abaAtiva === 'coordenadores') {
      if (coordenadores.length >= 2) {
        alert('Limite atingido: O proprietário ocupa a Vaga 1 e já existem 2 Coordenadores ativos.');
        return;
      }
      setCoordenadores([
        ...coordenadores,
        {
          id: Date.now(),
          nome: nomeNovo.trim(),
          email: emailNovo.trim(),
          papel: 'COORDENADOR',
          detalhe: detalheNovo.trim() || 'COORDENADOR DE ÁREA'
        }
      ]);
    } else if (abaAtiva === 'moderadores') {
      setModeradores([
        ...moderadores,
        {
          id: Date.now(),
          nome: nomeNovo.trim(),
          email: emailNovo.trim(),
          papel: 'MODERADOR',
          detalhe: detalheNovo.trim() || 'Torneios Gerais'
        }
      ]);
    } else if (abaAtiva === 'capitaes') {
      setCapitaes([
        ...capitaes,
        {
          id: Date.now(),
          nome: nomeNovo.trim(),
          email: emailNovo.trim(),
          papel: 'CAPITAO',
          detalhe: detalheNovo.trim() || 'Equipe Geral'
        }
      ]);
    }

    setNomeNovo('');
    setEmailNovo('');
    setSenhaNovo('');
    setDetalheNovo('');
    alert('Utilizador cadastrado com sucesso!');
  };

  const handleRemover = (id: number, papel: 'COORDENADOR' | 'MODERADOR' | 'CAPITAO') => {
    if (!confirm('Deseja realmente revogar o acesso deste utilizador?')) return;
    if (papel === 'COORDENADOR') setCoordenadores(coordenadores.filter((c) => c.id !== id));
    if (papel === 'MODERADOR') setModeradores(moderadores.filter((m) => m.id !== id));
    if (papel === 'CAPITAO') setCapitaes(capitaes.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/coordenador"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914]"
              title="Voltar ao Painel Geral"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </Link>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/coordenador"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
            >
              Painel do Coordenador ↗
            </Link>
            {autenticado && (
              <button
                type="button"
                onClick={() => setAutenticado(false)}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
              >
                Bloquear Sessão
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {!autenticado ? (
          <div className="mx-auto max-w-md rounded-[2.5rem] border border-amber-500/30 bg-[#13161f] p-8 shadow-2xl">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="inline-block rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                👑 ALTA ADMINISTRAÇÃO
              </span>
              <h1 className="mt-3 text-2xl font-black uppercase text-white">
                Acesso do Proprietário
              </h1>
              <p className="mt-1 text-xs text-[#8a92a6]">
                Identifique-se para gerir os acessos de coordenadores, moderadores e capitães.
              </p>
            </div>

            {erroLogin && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                {erroLogin}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
                  E-mail do Proprietário
                </label>
                <input
                  type="email"
                  required
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="Insira o seu e-mail institucional"
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
                  Palavra-passe Mestra
                </label>
                <input
                  type="password"
                  required
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-full bg-amber-500 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                Acessar Gestão Master
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-[#1a1712] via-[#13161f] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                PORTAL ADMINISTRATIVO MASTER
              </span>
              <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
                GESTÃO DE NÍVEIS & ACESSOS <br />
                <span className="text-amber-400">ARENA VALE</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
                Controlo mestre sobre os Coordenadores Gerais da plataforma, Moderadores de competições e Capitães responsáveis pelos plantéis.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setAbaAtiva('coordenadores')}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                  abaAtiva === 'coordenadores'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                }`}
              >
                Coordenação Geral ({1 + coordenadores.length}/3)
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('moderadores')}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                  abaAtiva === 'moderadores'
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                    : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                }`}
              >
                Moderadores de Torneio ({moderadores.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('capitaes')}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                  abaAtiva === 'capitaes'
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                    : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                }`}
              >
                Capitães de Equipa ({capitaes.length})
              </button>
            </div>

            <div className="rounded-[2.5rem] border border-white/15 bg-[#13161f] p-6 sm:p-8 shadow-xl mb-10">
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider mb-2">
                Credenciar Novo {abaAtiva === 'coordenadores' ? 'Coordenador' : abaAtiva === 'moderadores' ? 'Moderador' : 'Capitão'}
              </h2>
              <p className="text-xs text-[#8a92a6] mb-6">
                Defina o nome, credenciais de login e função específica no sistema da Arena Vale.
              </p>

              <form onSubmit={handleCadastrar} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">
                    {abaAtiva === 'coordenadores' ? 'Cargo / Setor' : abaAtiva === 'moderadores' ? 'Torneio Atribuído' : 'Nome da Equipa'}
                  </label>
                  <input
                    type="text"
                    required
                    value={detalheNovo}
                    onChange={(e) => setDetalheNovo(e.target.value)}
                    placeholder={abaAtiva === 'coordenadores' ? 'Ex: Coord. Arbitragem' : abaAtiva === 'moderadores' ? 'Ex: Copa Vale Principal' : 'Ex: Blumenau Futsal'}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">E-mail de Login</label>
                  <input
                    type="email"
                    required
                    value={emailNovo}
                    onChange={(e) => setEmailNovo(e.target.value)}
                    placeholder="utilizador@arenavale.com"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1">Palavra-passe Inicial</label>
                  <input
                    type="password"
                    required
                    value={senhaNovo}
                    onChange={(e) => setSenhaNovo(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase text-white hover:bg-[#ff1e27] transition shadow-lg shadow-[#e50914]/20"
                  >
                    + Salvar e Conceder Acesso
                  </button>
                </div>
              </form>
            </div>

            {abaAtiva === 'coordenadores' && (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#cad0e0]">
                  Vagas de Coordenação Geral (Máximo de 3 membros)
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[2rem] border border-amber-500/40 bg-gradient-to-br from-[#1a1712] to-[#13161f] p-6 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                        VAGA 1 · MASTER
                      </span>
                      <span className="text-[10px] font-black text-amber-400">👑 PROPRIETÁRIO</span>
                    </div>
                    <h4 className="mt-4 text-base font-black uppercase text-white">Proprietário Arena Vale</h4>
                    <p className="text-[11px] font-bold text-amber-400 mt-0.5 uppercase tracking-wider">DIREÇÃO EXECUTIVA</p>
                    <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                      <p className="truncate">✉ pmmiranda2017@gmail.com</p>
                      <p>🔒 Acesso Master Permanente</p>
                    </div>
                  </div>

                  {coordenadores.map((coord, idx) => (
                    <div
                      key={coord.id}
                      className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#e50914]">
                            VAGA {idx + 2} · COORDENAÇÃO
                          </span>
                          <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                        </div>
                        <h4 className="mt-4 text-base font-black uppercase text-white">{coord.nome}</h4>
                        <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">{coord.detalhe}</p>
                        <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                          <p className="truncate">✉ {coord.email}</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemover(coord.id, 'COORDENADOR')}
                          className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
                        >
                          Revogar Acesso ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {coordenadores.length < 2 && (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-xs text-[#8a92a6]">
                      <span>Vaga de Coordenador Livre</span>
                      <span className="text-[11px] mt-1 text-[#e50914]">Utilize o formulário acima para preencher</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {abaAtiva === 'moderadores' && (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#cad0e0]">
                  Moderadores Oficiais de Competições
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {moderadores.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-400">
                            MODERADOR
                          </span>
                          <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                        </div>
                        <h4 className="mt-4 text-base font-black uppercase text-white">{mod.nome}</h4>
                        <p className="text-[11px] font-bold text-blue-400 mt-0.5 uppercase tracking-wider">{mod.detalhe}</p>
                        <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                          <p className="truncate">✉ {mod.email}</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemover(mod.id, 'MODERADOR')}
                          className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
                        >
                          Revogar Acesso ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {abaAtiva === 'capitaes' && (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#cad0e0]">
                  Capitães de Equipas & Plantéis
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {capitaes.map((cap) => (
                    <div
                      key={cap.id}
                      className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400">
                            CAPITÃO
                          </span>
                          <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                        </div>
                        <h4 className="mt-4 text-base font-black uppercase text-white">{cap.nome}</h4>
                        <p className="text-[11px] font-bold text-amber-400 mt-0.5 uppercase tracking-wider">{cap.detalhe}</p>
                        <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                          <p className="truncate">✉ {cap.email}</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemover(cap.id, 'CAPITAO')}
                          className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
                        >
                          Revogar Acesso ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>© 2026 Arena Vale · Sistema de Gestão Interna</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador" className="hover:text-white">Painel Geral</Link>
            <Link href="/login" className="hover:text-white">Sair</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
