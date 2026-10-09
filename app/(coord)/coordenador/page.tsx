'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  const [secretoAtivo, setSecretoAtivo] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erro, setErro] = useState('');

  // Formulário de credenciamento
  const [nomeNovo, setNomeNovo] = useState('');
  const [cargoNovo, setCargoNovo] = useState('COORDENADOR DE COMPETIÇÕES');
  const [emailNovo, setEmailNovo] = useState('');
  const [senhaNovo, setSenhaNovo] = useState('');

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

  const handleValidarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput.trim().toUpperCase() === 'VINIGUTO2020') {
      setAutenticado(true);
      setErro('');
      setSenhaInput('');
    } else {
      setErro('Chave incorreta.');
    }
  };

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovo || !emailNovo || !senhaNovo) return;

    if (coordenadores.length >= 3) {
      alert('Limite de 3 coordenadores preenchido. Remova um para adicionar outro.');
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

    setNomeNovo('');
    setEmailNovo('');
    setSenhaNovo('');
    alert('Novo coordenador cadastrado com sucesso!');
  };

  const removerCoordenador = (id: number) => {
    if (confirm('Deseja revogar o acesso deste coordenador?')) {
      setCoordenadores(coordenadores.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO LIMPO (SEM NENHUM BOTÃO DE PROPRIETÁRIO) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* O GATILHO INVISÍVEL: Clicar no ícone AV abre o acesso restrito */}
            <button
              type="button"
              onClick={() => setSecretoAtivo(!secretoAtivo)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-[#161922] shadow-inner transition hover:border-[#e50914]"
              title="Arena Vale"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text
