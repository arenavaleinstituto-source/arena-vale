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
      const acao = window.prompt(
        'PAINEL DO PROPRIETÁRIO:\n\n1 - Registar Novo Coordenador (E-mail + Senha)\n2 - Excluir Acesso de Coordenador\n\nDigite 1 ou 2:'
      );

      if (acao === '1') {
        const nome = window.prompt('Nome completo do Coordenador:');
        if (!nome) return;

        const cargo = window.prompt('Cargo (ex: Coordenador de Competições, Editorial, etc.):') || 'COORDENADOR DE ÁREA';
        const email = window.prompt('E-mail oficial de acesso do Coordenador:');
        if (!email) return;

        const senhaCoord = window.prompt('Defina a senha de acesso para este Coordenador:');
        if (!senhaCoord) return;

        alert(
          '✅ COORDENADOR CREDENCIADO COM SUCESSO!\n\n' +
          '• Nome: ' + nome + '\n' +
