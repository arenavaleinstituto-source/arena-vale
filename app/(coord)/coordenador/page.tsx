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

  const handleAcessoProprietario = () => {
    const senha = window.prompt('Digite a senha de Proprietário:');
    if (senha && senha.trim().toUpperCase() === 'VINIGUTO2020') {
      const acao = window.prompt('Escolha uma opção:\n1 - Adicionar Coordenador\n2 - Excluir Coordenador');
      if (acao === '1') {
        const nome = window.prompt('Nome do novo coordenador:');
        if (nome) alert('Coordenador "' + nome + '" adicionado com sucesso!');
      } else if (acao === '2') {
        const num = window.prompt('Digite o número do coordenador a remover (1, 2 ou 3):');
        if (num) alert('Coordenador ' + num + ' removido!');
      }
    } else if (senha) {
      alert('Senha incorreta! Digite VINIGUTO2020');
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
              onClick={handleAcessoProprietario}
              title="Acesso Master Proprietário"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-amber-400"
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
            {/* BOTÃO PROPRIETÁRIO VISÍVEL */}
            <button
              type="button"
              onClick={handleAcessoProprietario}
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
              className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/
