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
  
  const [coordenadores, setCoordenadores] = useState<UsuarioItem[]>([
    { email: 'lpostjen@gmail.com', senha: 'arenaanera', cargo: 'Coordenador (Ouro)' },
    { email: 'iigoranjo@gmail.com', senha: 'Aren@123', cargo: 'Coordenador (Ouro)' }
  ]);

  const [moderadores, setModeradores] = useState<UsuarioItem[]>([]);
  const [capitaes, setCapitaes] = useState<UsuarioItem[]>([]);

  const [novoCoordEmail, setNovoCoordEmail] = useState('');
  const [novoCoordSenha, setNovoCoordSenha] = useState('');

  const [novoModEmail, setNovoModEmail] = useState('');
  const [novoModSenha, setNovoModSenha] = useState('');

  const [novoCapEmail, setNovoCapEmail] = useState('');
  const [novoCapSenha, setNovoCapSenha] = useState('');

  const [noticias, setNoticias] = useState([
    { id: '1', titulo: 'Abertura do Circuito 2026', status: 'Publicado' }
  ]);
  const [novaNoticia, setNovaNoticia] = useState('');

  const [capitaesModerador, setCapitaesModerador] = useState([
    { nome: 'Carlos Equipa A', equipe: 'Vale FC' }
  ]);
  const [nomeCapitao, setNomeCapitao] = useState('');
  const [nomeEquipe, setNomeEquipe] = useState('');

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

        <main className="mx-auto max-w-5xl w-full px-6 py-12 flex-grow space-y-12">
          
          {/* 1. PAINEL DO PROPRIETÁRIO */}
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
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <input 
                    type="password" 
                    value={novoCoordSenha} 
                    onChange={(e) => setNovoCoordSenha(e.target.value)} 
                    placeholder="Palavra-passe" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="sm:col-span-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-400 transition">
                    Adicionar Novo Coordenador
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {coordenadores.map((coord, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <div>
                        <span className="font-bold text-white text-xs">{coord.email}</span>
                        <span className="block text-[10px] text-amber-400">Senha: {coord.senha} · {coord.cargo}</span>
                      </div>
                      <button onClick={() => removerCoordenador(coord.email)} className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-[10px] font-black text-red-400 hover:bg-red-500 hover:text-white transition">
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO: MODERADORES */}
              <div className="rounded-[2rem] border border-slate-300/20 bg-[#0e1118] p-6 sm:p-8 shadow-xl">
                <h2 className="text-lg font-black uppercase text-slate-200 mb-2">2. Gestão de Moderadores (Prata)</h2>
                <form onSubmit={adicionarModerador} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="email" 
                    value={novoModEmail} 
                    onChange={(e) => setNovoModEmail(e.target.value)} 
                    placeholder="moderador@arenavale.com" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <input 
                    type="password" 
                    value={novoModSenha} 
                    onChange={(e) => setNovoModSenha(e.target.value)} 
                    placeholder="Palavra-passe" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="sm:col-span-2 rounded-xl bg-slate-200 px-6 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-white transition">
                    Adicionar Novo Moderador
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {moderadores.map((mod, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <div>
                        <span className="font-bold text-white text-xs">{mod.email}</span>
                        <span className="block text-[10px] text-slate-300">Senha: {mod.senha} · {mod.cargo}</span>
                      </div>
                      <button onClick={() => removerModerador(mod.email)} className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-[10px] font-black text-red-400 hover:bg-red-500 hover:text-white transition">
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO: CAPITÃES */}
              <div className="rounded-[2rem] border border-amber-700/30 bg-[#0e1118] p-6 sm:p-8 shadow-xl">
                <h2 className="text-lg font-black uppercase text-amber-600 mb-2">3. Gestão de Capitães (Bronze)</h2>
                <form onSubmit={adicionarCapitaoAdmin} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="email" 
                    value={novoCapEmail} 
                    onChange={(e) => setNovoCapEmail(e.target.value)} 
                    placeholder="capitao@arenavale.com" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <input 
                    type="password" 
                    value={novoCapSenha} 
                    onChange={(e) => setNovoCapSenha(e.target.value)} 
                    placeholder="Palavra-passe" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="sm:col-span-2 rounded-xl bg-amber-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-amber-600 transition">
                    Adicionar Novo Capitão
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {capitaes.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <div>
                        <span className="font-bold text-white text-xs">{cap.email}</span>
                        <span className="block text-[10px] text-amber-500">Senha: {cap.senha} · {cap.cargo}</span>
                      </div>
                      <button onClick={() => removerCapitaoAdmin(cap.email)} className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-[10px] font-black text-red-400 hover:bg-red-500 hover:text-white transition">
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PAINEL DO COORDENADOR */}
          {utilizadorLogado.perfil === 'Coordenador' && (
            <div className="space-y-8">
              <div className="rounded-[2.5rem] border border-amber-400/30 bg-[#11141d] p-8 shadow-2xl">
                <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-4">🏆 PORTAL DO COORDENADOR (OURO)</span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">Gestão de Notícias & Campeonatos</h1>
                <p className="text-xs text-[#8a92a6] mt-1 uppercase">Total autonomia para manusear e atualizar as notícias e os torneios oficiais da Arena Vale.</p>

                <form onSubmit={adicionarNoticia} className="mt-6 flex gap-3">
                  <input 
                    type="text" 
                    value={novaNoticia} 
                    onChange={(e) => setNovaNoticia(e.target.value)} 
                    placeholder="Título da nova notícia ou atualização..." 
                    className="flex-1 rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="rounded-xl bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition">
                    Publicar Notícia
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {noticias.map((n) => (
                    <div key={n.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <span className="font-bold text-white text-xs">{n.titulo}</span>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-black text-emerald-400">{n.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. PAINEL DO MODERADOR */}
          {utilizadorLogado.perfil === 'Moderador' && (
            <div className="space-y-8">
              <div className="rounded-[2.5rem] border border-slate-300/30 bg-[#11141d] p-8 shadow-2xl">
                <span className="inline-block rounded-full bg-slate-300/10 border border-slate-300/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-200 mb-4">🥈 PORTAL DO MODERADOR (PRATA)</span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">Gestão de Capitães</h1>
                <p className="text-xs text-[#8a92a6] mt-1 uppercase">Adicione os capitães responsáveis pelas equipas do seu campeonato.</p>

                <form onSubmit={adicionarCapitao} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={nomeCapitao} 
                    onChange={(e) => setNomeCapitao(e.target.value)} 
                    placeholder="Nome do Capitão" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={nomeEquipe} 
                    onChange={(e) => setNomeEquipe(e.target.value)} 
                    placeholder="Nome da Equipa" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="sm:col-span-2 rounded-xl bg-slate-200 px-6 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-white transition">
                    Registar Capitão
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {capitaesModerador.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <span className="font-bold text-white text-xs">{cap.nome} · <span className="text-slate-400">{cap.equipe}</span></span>
                      <span className="text-[10px] text-slate-300">Capitão Ativo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PAINEL DO CAPITÃO */}
          {utilizadorLogado.perfil === 'Capitão' && (
            <div className="space-y-8">
              <div className="rounded-[2.5rem] border border-amber-700/40 bg-[#11141d] p-8 shadow-2xl">
                <span className="inline-block rounded-full bg-amber-700/10 border border-amber-700/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4">🥉 PORTAL DO CAPITÃO (BRONZE)</span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">Gestão da Lista de Atletas</h1>
                <p className="text-xs text-[#8a92a6] mt-1 uppercase">Adicione e gira os atletas inscritos para a disputa dos jogos da sua equipa.</p>

                <form onSubmit={adicionarAtleta} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={nomeAtleta} 
                    onChange={(e) => setNomeAtleta(e.target.value)} 
                    placeholder="Nome Completo do Atleta" 
                    className="sm:col-span-2 rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={dorsalAtleta} 
                    onChange={(e) => setDorsalAtleta(e.target.value)} 
                    placeholder="Dorsal" 
                    className="rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
                  />
                  <button type="submit" className="sm:col-span-3 rounded-xl bg-amber-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-amber-600 transition">
                    Adicionar Atleta à Equipa
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {atletas.map((atl, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-4">
                      <span className="font-bold text-white text-xs">{atl.nome}</span>
                      <span className="rounded-lg bg-white/5 px-3 py-1 text-[10px] font-black text-amber-500">Dorsal #{atl.dorsal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>

        <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
          © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**. Todos os direitos reservados.
        </footer>
      </div>
    </>
  );
}
