'use client';

import React from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Aprovação editorial, fotos e perfil de novos talentos.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Manutenção do player, YouTube e placares ao vivo.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar Jogos →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Solicitações →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Estruturação de torneios regionais, fases e datas.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Torneios →', destaque: false }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* GATILHO DISCRETO NO LOGO [AV] PARA O PROPRIETÁRIO */}
            <button
              type="button"
              onClick={() => {
                const dialog = document.getElementById('dialog-proprietario') as HTMLDialogElement | null;
                if (dialog) dialog.showModal();
              }}
              title="Arena Vale"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914] cursor-pointer"
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
        {/* Banner do Painel */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#161a24] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            PAINEL DO COORDENADOR
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            CENTRAL DE CONTROLE <br />
            <span className="text-[#e50914]">ARENA VALE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Área operacional exclusiva para manutenção editorial, moderação de inscritos, acompanhamento de partidas e tabelas de competições.
          </p>
        </div>

        {/* MÓDULOS DE OPERAÇÃO DO SITE */}
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

      {/* 3. MODAL EXCLUSIVO DO PROPRIETÁRIO */}
      <dialog
        id="dialog-proprietario"
        className="backdrop:bg-black/85 rounded-[2.5rem] border border-white/15 bg-[#13161f] p-8 text-white max-w-md w-full shadow-2xl m-auto"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-black uppercase tracking-wider text-white">
            Credenciamento de Coordenador
          </h3>
          <button
            type="button"
            onClick={() => {
              const dialog = document.getElementById('dialog-proprietario') as HTMLDialogElement | null;
              if (dialog) dialog.close();
            }}
            className="text-sm font-bold text-[#8a92a6] hover:text-white"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const chave = (form.elements.namedItem('chave') as HTMLInputElement).value;
            const nome = (form.elements.namedItem('nome') as HTMLInputElement).value;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;

            if (chave.trim().toUpperCase() === 'VINIGUTO2020') {
              alert('Coordenador "' + nome + '" (' + email + ') credenciado com sucesso!');
              form.reset();
              const dialog = document.getElementById('dialog-proprietario') as HTMLDialogElement | null;
              if (dialog) dialog.close();
            } else {
              alert('Chave Mestra incorreta!');
            }
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="block text-[11px] font-bold uppercase text-amber-400">Chave Mestra (Proprietário)</label>
            <input
              name="chave"
              type="password"
              required
              placeholder="Digite VINIGUTO2020"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0d12] px-3.5 py-2 text-xs uppercase text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Nome do Coordenador</label>
            <input
              name="nome"
              type="text"
              required
              placeholder="Nome completo"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Cargo</label>
            <input
              name="cargo"
              type="text"
              defaultValue="COORDENADOR DE COMPETIÇÕES"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">E-mail de Acesso</label>
            <input
              name="email"
              type="email"
              required
              placeholder="coordenador@arenavale.com"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#cad0e0]">Senha de Acesso</label>
            <input
              name="senhaCoord"
              type="password"
              required
              placeholder="Defina a senha do coordenador"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-3.5 py-2 text-xs text-white outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                const dialog = document.getElementById('dialog-proprietario') as HTMLDialogElement | null;
                if (dialog) dialog.close();
              }}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-[#8a92a6]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#e50914] px-6 py-2 text-xs font-black uppercase text-white hover:bg-[#ff1e27] transition"
            >
              Salvar e Credenciar
            </button>
          </div>
        </form>
      </dialog>

      {/* 4. RODAPÉ */}
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
