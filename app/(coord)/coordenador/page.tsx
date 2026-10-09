'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const [isProprietario, setIsProprietario] = useState(false);
  const [modalMasterAberto, setModalMasterAberto] = useState(false);
  const [senhaMestre, setSenhaMestre] = useState('');
  const [erroMestre, setErroMestre] = useState('');

  const [modalNovoCoord, setModalNovoCoord] = useState(false);
  const [novoCoordNome, setNovoCoordNome] = useState('');
  const [novoCoordCargo, setNovoCoordCargo] = useState('COORDENADOR DE COMPETIÇÕES');
  const [novoCoordEmail, setNovoCoordEmail] = useState('');
  const [novoCoordTel, setNovoCoordTel] = useState('');

  // Coordenadores adicionados pelo Proprietário (máximo 3)
  const [coordenadores, setCoordenadores] = useState<Array<{ id: number; cargo: string; nome: string; email: string; tel: string }>>([
    { id: 1, cargo: 'COORDENADOR GERAL', nome: 'Coordenação Geral Arena Vale', email: 'arenavale2026@gmail.com', tel: '(47) 98844-4404' }
  ]);

  // VALIDAÇÃO DA SENHA DO PROPRIETÁRIO: VINIGUTO2020
  const handleAcessoProprietario = (e: React.FormEvent) => {
    e.preventDefault();
    const chave = senhaMestre.trim().toUpperCase();
    if (chave === 'VINIGUTO2020') {
      setIsProprietario(true);
      setModalMasterAberto(false);
      setSenhaMestre('');
      setErroMestre('');
    } else {
      setErroMestre('Senha de proprietário incorreta.');
    }
  };

  const handleSalvarNovoCoord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCoordNome || !novoCoordEmail) return;

    if (coordenadores.length >= 3) {
      alert('Limite de 3 coordenadores preenchido. Remova um para adicionar outro.');
      return;
    }

    setCoordenadores([
      ...coordenadores,
      {
        id: Date.now(),
        cargo: novoCoordCargo,
        nome: novoCoordNome,
        email: novoCoordEmail,
        tel: novoCoordTel || '(47) 98844-4404'
      }
    ]);

    setNovoCoordNome('');
    setNovoCoordEmail('');
    setNovoCoordTel('');
    setModalNovoCoord(false);
  };

  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Aprovação editorial, fotos e perfil de novos talentos.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Manutenção do link do YouTube, status e placares ao vivo.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar Jogos →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Gestão de atletas recém-cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Solicitações →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Atualização de fases, confrontos e datas de jogos.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Torneios →', destaque: false }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* BOTÃO SECRETO DO PROPRIETÁRIO: CLIQUE NO EMBLEMA AV */}
            <button
              type="button"
              onClick={() => {
                if (isProprietario) {
                  setIsProprietario(false);
                } else {
                  setModalMasterAberto(true);
                }
              }}
              title="Acesso Master"
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
                👑
