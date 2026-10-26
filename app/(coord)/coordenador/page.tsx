'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SENHA_MESTRA = 'arena2026';

interface VideoItem {
  id: string;
  youtubeId: string;
  titulo: string;
  formato: 'widescreen' | 'shorts';
}

interface NoticiaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tag: string;
}

interface JogoItem {
  id: string;
  dataHora: string;
  equipeA: string;
  equipeB: string;
  modalidade: string;
  local: string;
  status: string;
}

const VIDEOS_INICIAIS: VideoItem[] = [
  {
    id: 'default-1',
    youtubeId: 'sY8Dpv7KIho',
    titulo: 'Resenha da Arbitragem · TV Arena Vale',
    formato: 'widescreen'
  }
];

const NOTICIAS_INICIAIS: NoticiaItem[] = [
  {
    id: 'noticia-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao: 'A Arena Vale prepara cobertura técnica e multimédia completa para o desporto regional.',
    categoria: 'INSTITUCIONAL',
    tag: 'NOVIDADES'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO DESPORTO REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade desportiva.',
    categoria: 'PROJETO VALE',
    tag: 'DESENVOLVIMENTO'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO DESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível das competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'GESTÃO'
  }
];

const JOGOS_INICIAIS: JogoItem[] = [
  {
    id: 'jogo-1',
    dataHora: 'Sábado · 19:30',
    equipeA: 'Equipe A',
    equipeB: 'Equipe B',
    modalidade: 'Futsal Regional',
    local: 'Arena Multiuso',
    status: 'Transmissão Ao Vivo'
  }
];

export default function PainelCoordenadorPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState(false);

  const [novoLink, setNovoLink] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [formatoEscolhido, setFormatoEscolhido] = useState<'widescreen' | 'shorts'>('widescreen');
  const [listaVideos, setListaVideos] = useState<VideoItem[]>([]);

  const [novoTituloNoticia, setNovoTituloNoticia] = useState('');
  const [novaDescricaoNoticia, setNovaDescricaoNoticia] = useState('');
  const [novaCategoriaNoticia, setNovaCategoriaNoticia] = useState('INSTITUCIONAL');
  const [novaTagNoticia, setNovaTagNoticia] = useState('NOVIDADES');
  const [listaNoticias, setListaNoticias] = useState<NoticiaItem[]>([]);

  const [novaDataHora, setNovaDataHora] = useState('');
  const [novaEquipeA, setNovaEquipeA] = useState('');
  const [novaEquipeB, setNovaEquipeB] = useState('');
  const [novaModalidade, setNovaModalidade] = useState('Futsal');
  const [novoLocal, setNovoLocal] = useState('');
  const [novoStatus, setNovoStatus] = useState('Transmissão Ao Vivo');
  const [listaJogos, setListaJogos] = useState<JogoItem[]>([]);

  useEffect(() => {
    try {
      const sessao = sessionStorage.getItem('arenavale_coord_auth');
      if (sessao === 'true') setAutenticado(true);

      const videosSalvos = localStorage.getItem('arenavale_videos');
      setListaVideos(videosSalvos ? JSON.parse(videosSalvos) : VIDEOS_INICIAIS);

      const noticiasSalvas = localStorage.getItem('arenavale_noticias');
      setListaNoticias(noticiasSalvas ? JSON.parse(noticiasSalvas) : NOTICIAS_INICIAIS);

      const jogosSalvos = localStorage.getItem('arenavale_agenda');
      setListaJogos(jogosSalvos ? JSON.parse(jogosSalvos) : JOGOS_INICIAIS);
    } catch {
      setListaVideos(VIDEOS_INICIAIS);
      setListaNoticias(NOTICIAS_INICIAIS);
      setListaJogos(JOGOS_INICIAIS);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === SENHA_MESTRA) {
      setAutenticado(true);
      setErroSenha(false);
      sessionStorage.setItem('arenavale_coord_auth', 'true');
    } else {
      setErroSenha(true);
      setSenhaInput('');
    }
  };

  const handleLogout = () => {
    setAutenticado(false);
    setSenhaInput('');
    sessionStorage.removeItem('arenavale_coord_auth');
  };

  const extrairIdYoutube = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAdicionarVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extrairIdYoutube(novoLink);
    if (!id) {
      alert('Insira um link válido do YouTube (ex: watch?v=, youtu.be/ ou shorts/)');
      return;
    }
    const item: VideoItem = {
      id: Date.now().toString(),
      youtubeId: id,
      titulo: novoTitulo.trim() || 'Nova Transmissão · TV Arena Vale',
      formato: formatoEscolhido
    };
    const novaLista = [item, ...listaVideos];
    setListaVideos(novaLista);
    localStorage.setItem('arenavale_videos', JSON.stringify(novaLista));
    setNovoLink('');
    setNovoTitulo('');
    alert('Vídeo publicado com sucesso!');
  };

  const removerVideo = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este vídeo?')) {
      const novaLista = listaVideos.filter((v) => v.id !== id);
      setListaVideos(novaLista);
      localStorage.setItem('arenavale_videos', JSON.stringify(novaLista));
    }
  };

  const handleAdicionarNoticia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTituloNoticia.trim() || !novaDescricaoNoticia.trim()) {
      alert('Preencha o título e a descrição da notícia.');
      return;
    }
    const item: NoticiaItem = {
      id: Date.now().toString(),
      titulo: novoTituloNoticia.trim().toUpperCase(),
      descricao: novaDescricaoNoticia.trim(),
      categoria: novaCategoriaNoticia.trim().toUpperCase() || 'GERAL',
      tag: novaTagNoticia.trim().toUpperCase() || 'DESTAQUE'
    };
    const novaLista = [item, ...listaNoticias];
    setListaNoticias(novaLista);
    localStorage.setItem('arenavale_noticias', JSON.stringify(novaLista));
    setNovoTituloNoticia('');
    setNovaDescricaoNoticia('');
    alert('Notícia publicada com sucesso!');
  };

  const removerNoticia = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta notícia?')) {
      const novaLista = listaNoticias.filter((n) => n.id !== id);
      setListaNoticias(novaLista);
      localStorage.setItem('arenavale_noticias', JSON.stringify(novaLista));
    }
  };

  const handleAdicionarJogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaEquipeA.trim() || !novaEquipeB.trim() || !novaDataHora.trim()) {
      alert('Preencha os nomes das equipes e a data/horário da partida.');
      return;
    }
    const item: JogoItem = {
      id: Date.now().toString(),
      dataHora: novaDataHora.trim(),
      equipeA: novaEquipeA.trim(),
      equipeB: novaEquipeB.trim(),
      modalidade: novaModalidade.trim(),
      local: novoLocal.trim() || 'Arena Vale',
      status: novoStatus.trim() || 'Confirmado'
    };
    const novaLista = [item, ...listaJogos];
    setListaJogos(novaLista);
    localStorage.setItem('arenavale_agenda', JSON.stringify(novaLista));
    setNovaDataHora('');
    setNovaEquipeA('');
    setNovaEquipeB('');
    setNovoLocal('');
    alert('Confronto adicionado à Agenda com sucesso!');
  };

  const removerJogo = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este jogo da agenda?')) {
      const novaLista = listaJogos.filter((j) => j.id !== id);
      setListaJogos(novaLista);
      localStorage.setItem('arenavale_agenda', JSON.stringify(novaLista));
    }
  };

  if (!autenticado) {
    return (<div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center p-6 selection:bg-[#e50914] selection:text-white"><div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#11141d] p-8 shadow-2xl text-center"><div className="mx-auto mb-5 flex h-20 w-auto items-center justify-center rounded-2xl border border-amber-400/30 bg-[#07080c] p-3 shadow-lg shadow-amber-500/10"><img src="/logo.png" alt="Arena Vale Coordenador" className="h-full w-auto object-contain mix-blend-lighten" /></div><span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">🔒 ÁREA PROTEGIDA</span><h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">ACESSO DO COORDENADOR</h1><p className="mt-2 text-xs text-[#8a92a6]">Digite a credencial de segurança para liberar o painel de controle.</p><form onSubmit={handleLogin} className="mt-6 space-y-4"><input type="password" required placeholder="Senha de acesso..." value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-center text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none" />{erroSenha && (<p className="text-xs font-bold text-red-400">Senha incorreta. Acesso negado.</p>)}<button type="submit" className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/20 hover:brightness-110 transition cursor-pointer">Desbloquear Painel</button></form><div className="mt-6 pt-6 border-t border-white/10"><Link href="/" className="text-xs font-bold text-[#8a92a6] hover:text-white transition">← Voltar para a Página Inicial</Link></div></div></div>);
  }

  return (<div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white"><header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#07080c]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5"><div className="flex items-center gap-4"><Link href="/" className="flex items-center transition hover:opacity-90"><img src="/logo.png" alt="Arena Vale" className="h-12 sm:h-14 w-auto object-contain rounded-lg mix-blend-lighten" /></Link><span className="hidden sm:inline-block rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">🛡️ Painel do Coordenador</span></div><div className="flex items-center gap-3"><button type="button" onClick={handleLogout} className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer">🔒 Bloquear</button><Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] hover:bg-white/10 hover:text-white transition">← Ver Site Principal</Link></div></div></header><main className="mx-auto max-w-7xl px-6 py-10 space-y-12"><div><div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 mb-3">GESTÃO GLOBAL DE CONTEÚDO</div><h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">PAINEL DE CONTROLE DO COORDENADOR</h1><p className="mt-2 text-sm text-[#8a92a6] max-w-2xl">Gerencie os vídeos do YouTube, as notícias em destaque e a agenda de jogos da temporada oficial.</p></div><section className="rounded-3xl border border-amber-500/20 bg-[#11141d] p-6 sm:p-8 shadow-2xl space-y-6"><h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="text-amber-400">📹</span> Adicionar Vídeo / Transmissão (YouTube)</h2><form onSubmit={handleAdicionarVideo} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Título do Vídeo</label><input type="text" required placeholder="Ex: Final Regional 2026 · TV Arena Vale" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Link do YouTube</label><input type="url" required placeholder="https://www.youtube.com/watch?v=... ou /shorts/..." value={novoLink} onChange={(e) => setNovoLink(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white placeholder:text-[#555d6e] focus:border-amber-400 focus:outline-none" /></div></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Enquadramento</label><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setFormatoEscolhido('widescreen')} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${formatoEscolhido === 'widescreen' ? 'bg-amber-400 text-black font-bold' : 'border border-white/15 bg-white/5 text-[#cad0e0]'}`}>📺 16:9 Widescreen</button><button type="button" onClick={() => setFormatoEscolhido('shorts')} className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${formatoEscolhido === 'shorts' ? 'bg-[#e50914] text-white font-bold' : 'border border-white/15 bg-white/5 text-[#cad0e0]'}`}>📱 9:16 Shorts</button></div></div><button type="submit" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black font-bold cursor-pointer">+ Publicar Vídeo na Grelha</button></form><div className="pt-6 border-t border-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-[#8a92a6] mb-4">Vídeos Ativos ({listaVideos.length})</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listaVideos.map((video) => (<div key={video.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-3"><span className="text-xs font-bold text-white truncate max-w-[200px]">{video.titulo}</span><button type="button" onClick={() => removerVideo(video.id)} className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer">Remover</button></div>))}</div></div></section><section className="rounded-3xl border border-amber-500/20 bg-[#11141d] p-6 sm:p-8 shadow-2xl space-y-6"><h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="text-amber-400">📰</span> Adicionar Notícia / Conteúdo & Cobertura</h2><form onSubmit={handleAdicionarNoticia} className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2"><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Título da Notícia</label><input type="text" required placeholder="Ex: COPA VALE DE FUTSAL CONFIRMADA" value={novoTituloNoticia} onChange={(e) => setNovoTituloNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white uppercase focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Categoria</label><input type="text" placeholder="Ex: COMPETIÇÕES" value={novaCategoriaNoticia} onChange={(e) => setNovaCategoriaNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white uppercase focus:border-amber-400 focus:outline-none" /></div></div><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2"><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Descrição / Resumo</label><textarea required rows={2} placeholder="Resumo da notícia..." value={novaDescricaoNoticia} onChange={(e) => setNovaDescricaoNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none resize-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Tag / Selo</label><input type="text" placeholder="Ex: NOVIDADES" value={novaTagNoticia} onChange={(e) => setNovaTagNoticia(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white uppercase focus:border-amber-400 focus:outline-none" /></div></div><button type="submit" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black font-bold cursor-pointer">+ Publicar Notícia</button></form><div className="pt-6 border-t border-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-[#8a92a6] mb-4">Notícias Publicadas ({listaNoticias.length})</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listaNoticias.map((noticia) => (<div key={noticia.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080c] p-3"><span className="text-xs font-bold text-white truncate max-w-[200px]">{noticia.titulo}</span><button type="button" onClick={() => removerNoticia(noticia.id)} className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer">Remover</button></div>))}</div></div></section><section className="rounded-3xl border border-amber-500/20 bg-[#11141d] p-6 sm:p-8 shadow-2xl space-y-6"><h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="text-amber-400">📅</span> Adicionar Jogo / Confronto na Agenda</h2><p className="text-xs text-[#8a92a6]">Cadastre os confrontos programados com datas, locais e status de transmissão.</p><form onSubmit={handleAdicionarJogo} className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Data e Horário</label><input type="text" required placeholder="Ex: 24/10 · 20:00" value={novaDataHora} onChange={(e) => setNovaDataHora(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Modalidade</label><input type="text" placeholder="Ex: Futsal Adulto" value={novaModalidade} onChange={(e) => setNovaModalidade(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Local / Ginásio</label><input type="text" placeholder="Ex: Ginásio Central" value={novoLocal} onChange={(e) => setNovoLocal(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div></div><div className="grid gap-4 sm:grid-cols-3"><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Equipe Mandante (A)</label><input type="text" required placeholder="Ex: Time Azul" value={novaEquipeA} onChange={(e) => setNovaEquipeA(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Equipe Visitante (B)</label><input type="text" required placeholder="Ex: Time Branco" value={novaEquipeB} onChange={(e) => setNovaEquipeB(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div><div><label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0] mb-2">Status da Partida</label><input type="text" placeholder="Ex: Transmissão Ao Vivo" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" /></div></div><button type="submit" className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black font-bold cursor-pointer">+ Publicar Jogo na Agenda</button></form><div className="pt-6 border-t border-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-[#8a92a6] mb-4">Jogos Agendados ({listaJogos.length})</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listaJogos.map((jogo) => (<div key={jogo.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#07080c] p-4 gap-3"><div><div className="flex items-center justify-between text-[11px] text-[#8a92a6] mb-1"><span>{jogo.dataHora}</span><span className="text-amber-400 font-bold">{jogo.modalidade}</span></div><p className="text-sm font-black text-white">{jogo.equipeA} <span className="text-[#e50914]">VS</span> {jogo.equipeB}</p><p className="text-xs text-[#8a92a6] mt-1 font-medium">📍 {jogo.local}</p></div><div className="pt-2 border-t border-white/5 flex items-center justify-between"><span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">{jogo.status}</span><button type="button" onClick={() => removerJogo(jogo.id)} className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer">Remover</button></div></div>))}</div></div></section></main></div>);
}
