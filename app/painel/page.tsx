'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsuarioItem {
  email: string;
  senha: string;
  cargo: string;
}

export default function PainelGeralPage() {
  const [utilizadorLogado, setUtilizadorLogado] = useState<{ email: string; perfil: string } | null>(null);
  
  // Listas de gestão do Proprietário
  const [coordenadores, setCoordenadores] = useState<UsuarioItem[]>([
    { email: 'lpostjen@gmail.com', senha: 'arenaanera', cargo: 'Coordenador (Ouro)' },
    { email: 'iigoranjo@gmail.com', senha: 'Aren@123', cargo: 'Coordenador (Ouro)' }
  ]);

  const [moderadores, setModeradores] = useState<UsuarioItem[]>([]);
  const [capitaes, setCapitaes] = useState<UsuarioItem[]>([]);

  // Inputs para novos registos pelo Proprietário
  const [novoCoordEmail, setNovoCoordEmail] = useState('');
  const [novoCoordSenha, setNovoCoordSenha] = useState('');

  const [novoModEmail, setNovoModEmail] = useState('');
  const [novoModSenha, setNovoModSenha] = useState('');

  const [novoCapEmail, setNovoCapEmail] = useState('');
  const [novoCapSenha, setNovoCapSenha] = useState('');

  // Estados para Coordenador (Notícias e Campeonatos)
  const [noticias, setNoticias] = useState([
    { id: '1', titulo: 'Abertura do Circuito 2026', status: 'Publicado' }
  ]);
  const [novaNoticia, setNovaNoticia] = useState('');

  // Estados para Moderador (Adicionar Capitães próprios)
  const [capitaesModerador, setCapitaesModerador] = useState([
    { nome: 'Carlos Equipa A', equipe: 'Vale FC' }
  ]);
  const [nomeCapitao, setNomeCapitao] = useState('');
  const [nomeEquipe, setNomeEquipe] = useState('');

  // Estados para Capitão (Atletas)
  const [atletas, setAtletas] = useState([
    { nome: 'Matheus Silva', dorsal: '10' }
  ]);
  const [nomeAtleta, setNomeAtleta] = useState('');
  const [dorsalAtleta, setDorsalAtleta] = useState('');

  useEffect(() => {
    const emailSalvo = localStorage.getItem('arenavale_user_email') || 'pmmiranda2017@gmail.com';
    
    let perfil = 'Capitão';
    if (emailSalvo === 'pmmiranda2017@gmail.com') perfil = 'Proprietário';
    else if (emailSalvo === 'lpostjen@gmail.com' || emailSalvo === 'iigoranjo@gmail.com') perfil = 'Coordenador';
    else if (emailSalvo.includes('moderador')) perfil = 'Moderador';

    setUtilizadorLogado({ email: emailSalvo, perfil });

    try {
      const savedCoords = localStorage.getItem('cfg6_coordenadores');
      if (savedCoords) setCoordenadores(JSON.parse(savedCoords));

      const savedMods = localStorage.getItem('cfg6_moderadores');
      if (savedMods) setModeradores(JSON.parse(savedMods));

      const savedCaps = localStorage.getItem('cfg6_capitaes');
      if (savedCaps) setCapitaes(JSON.parse(savedCaps));
    } catch {
      // Fallback
    }
  }, []);

  const adicionarCoordenador = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoCoordEmail && novoCoordSenha) {
      const atualizados = [...coordenadores, { email: novoCoordEmail, senha: novoCoordSenha, cargo: 'Coordenador (Ouro)' }];
      setCoordenadores(atualizados);
      localStorage.setItem('cfg6_coordenadores', JSON.stringify(atualizados));
      setNovoCoordEmail('');
      setNovoCoordSenha('');
    }
  };

  const removerCoordenador = (email: string) => {
    const atualizados = coordenadores.filter(c => c.email !== email);
    setCoordenadores(atualizados);
    localStorage.setItem('cfg6_coordenadores', JSON.stringify(atualizados));
  };

  const adicionarModerador = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoModEmail && novoModSenha) {
      const atualizados = [...moderadores, { email: novoModEmail, senha: novoModSenha, cargo: 'Moderador (Prata)' }];
      setModeradores(atualizados);
      localStorage.setItem('cfg6_moderadores', JSON.stringify(atualizados));
      setNovoModEmail('');
      setNovoModSenha('');
    }
  };

  const removerModerador = (email: string) => {
    const atualizados = moderadores.filter(m => m.email !== email);
    setModeradores(atualizados);
    localStorage.setItem('cfg6_moderadores', JSON.stringify(atualizados));
  };

  const adicionarCapitaoAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoCapEmail && novoCapSenha) {
      const atualizados = [...capitaes, { email: novoCapEmail, senha: novoCapSenha, cargo: 'Capitão (Bronze)' }];
      setCapitaes(atualizados);
      localStorage.setItem('cfg6_capitaes', JSON.stringify(atualizados));
      setNovoCapEmail('');
      setNovoCapSenha('');
    }
  };

  const removerCapitaoAdmin = (email: string) => {
    const atualizados = capitaes.filter(c => c.email !== email);
    setCapitaes(atualizados);
    localStorage.setItem('cfg6_capitaes', JSON.stringify(atualizados));
  };

  const adicionarNoticia = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaNoticia) {
      setNoticias([...noticias, { id: Date.now().toString(), titulo: novaNoticia, status: 'Publicado' }]);
      setNovaNoticia('');
    }
  };

  const adicionarCapitao = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeCapitao && nomeEquipe) {
      setCapitaesModerador([...capitaesModerador, { nome: nomeCapitao, equipe: nomeEquipe }]);
      setNomeCapitao('');
      setNomeEquipe('');
    }
  };

  const adicionarAtleta = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeAtleta) {
      setAtletas([...atletas, { nome: nomeAtleta, dorsal: dorsalAtleta || '0' }]);
      setNomeAtleta('');
      setDorsalAtleta('');
    }
  };

  if (!utilizadorLogado) return <div className="min-h-screen bg-[#07080c] text-white p-10">A carregar painel...</div>;

  return (
    <>
      <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans">
        {/* CABEÇALHO DO PAINEL */}
        <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
              <div>
                <h2 className="text-sm font-black uppercase text-white">Painel de Controlo · CFG6</h2>
                <p className="text-[10px] text-amber-400 font-bold">Perfil: {utilizadorLogado.perfil} ({utilizadorLogado.email})</p>
              </div>
            </div>
            <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
              Sair do Painel ↗
            </Link>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO CONSOANTE O PERFIL */}
        <main className="mx-auto max-w-5xl w-full px-6 py-12 flex-grow space-y-12">
          
          {/* 1. PAINEL DO PROPRIETÁRIO (ADMIN SUPREMO) */}
          {utilizadorLogado.perfil === 'Proprietário' && (
            <div className="space-y-10">
              <div className="rounded-[2.5rem] border border-amber-500/30 bg-[#11141d] p-8 shadow-2xl">
                <span className="inline-block rounded-full bg-amber-500/10 border border-amber-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-4">👑 PAINEL DO PROPRIETÁRIO · EXCLUSIVO CFG6</span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">Gestão Global de Acessos</h1>
                <p className="text-xs text-[#8a92a6] mt-1 uppercase">Apenas o proprietário tem o direito exclusivo de adicionar e excluir Coordenadores, Moderadores e Capitães.</p>
              </div>

              {/* SEÇÃO: COORDENADORES */}
              <div className="rounded-[2rem] border border-amber-400/20 bg-[#0e1118] p-6 sm:p-8 shadow-xl">
                <h2 className="text-lg font-black uppercase text-amber-400 mb-2">1. Gestão de Coordenadores (Ouro)</h2>
                <form onSubmit={adicionarCoordenador} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="email" 
                    value={novoCoordEmail} 
                    onChange={(e) => setNovoCoordEmail(e.target.value)} 
                    placeholder="coordenador@arenavale.com" 
                    className="rounded-xl border border-white/1
