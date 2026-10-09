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

    setUsuarios([
      ...usuarios,
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
          <Link href="/" className="group flex items-center gap-3
          
