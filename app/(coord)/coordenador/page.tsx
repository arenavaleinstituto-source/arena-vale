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

  const acaoProprietarioLogo = () => {
    const chave = window.prompt('Autenticação de Proprietário:');
    if (chave && chave.trim().toUpperCase() === 'VINIGUTO2020') {
      const opcao = window.prompt('PAINEL DO PROPRIETÁRIO:\n\n1 - Adicionar Coordenador (Nome, Cargo, E-mail, Senha)\n2 - Revogar Acesso de Coordenador\n\nDigite 1 ou 2:');
      if (opcao === '1') {
        const nome = window.prompt('Nome completo do Coordenador:');
        if (!nome) return;
        const cargo = window.prompt('Cargo (ex: Coordenador de Competições):') || 'COORDENADOR';
        const email = window.prompt('E-mail oficial de acesso:');
        if (!email) return;
        const pass = window.prompt('Defina a senha de acesso:');
        if (!pass) return;
        alert('Coordenador ' + nome + ' credenciado com sucesso!\nE-mail: ' + email);
      } else if (opcao === '2') {
        const num = window.prompt('Número do coordenador a revogar (1, 2 ou 3):');
        if (num) alert('Acesso do coordenador ' + num + ' revogado com sucesso!');
      }
    } else if (chave) {
      alert('Chave incorreta! Acesso negado.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO LIMPO COM GATILHO NO EMBLEMA [AV] */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* O GATILHO ESTÁ AQUI NA IMAGEM/
