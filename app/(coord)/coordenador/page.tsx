'use client';

import React from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const coordenadores = [
    { cargo: 'COORDENADOR GERAL', nome: 'Coordenação Arena Vale', email: 'arenavale2026@gmail.com', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMPETIÇÕES', nome: 'Gestão de Campeonatos', email: 'competicoes@arenavale.com.br', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMUNICAÇÃO', nome: 'Mídia & TV Arena Vale', email: 'imprensa@arenavale.com.br', tel: '(47) 98844-4404' }
  ];

  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Aprovação editorial, fotos e perfil de novos talentos.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Manutenção do player, YouTube e placares ao vivo.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar Jogos →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Solicitações →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Estruturação de torneios regionais, fases e datas.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Torneios →', destaque: false }
  ];

  const abrirProprietario = () => {
    const senha = window.prompt('Digite a senha de Proprietário:');
    if (senha && senha.trim().toUpperCase() === 'VINIGUTO2020') {
      const acao = window.prompt('Painel do Proprietário:\n1 - Adicionar Coordenador\n2 - Excluir Coordenador');
      if (acao === '1') {
        const nome = window.prompt('Nome do novo coordenador:');
        if (nome) alert('Coordenador "' + nome + '" adicionado com sucesso!');
      } else if (acao === '2') {
        const num = window.prompt('Número do coordenador a remover (1, 2 ou 3):');
        if (num) alert('Acesso do coordenador ' + num + ' revogado!');
      }
    } else if (senha) {
      alert('Senha incorreta! Digite VINIGUTO2020');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={abrirProprietario}
              title="Acesso Master"
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
              onClick={abrirProprietario}
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
                3 / 3 Ocupadas
              </span>
              <button
                type="button"
                onClick={abrirProprietario}
                className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25"
              >
                Gerenciar Vagas ⚙
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {coordenadores.map((coord, idx) => (
              <div
                key={idx}
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
              </div>
            ))}
          </div>
        </section>

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
