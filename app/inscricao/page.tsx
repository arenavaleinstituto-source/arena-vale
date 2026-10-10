'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Atleta {
  id: number;
  nome: string;
  numero: string;
  documento: string;
  posicao: string;
}

export default function FichaInscricaoPage() {
  const [nomeTime, setNomeTime] = useState('');
  const [modalidade, setModalidade] = useState('Futsal Regional');
  const [cidade, setCidade] = useState('');
  const [capitaoNome, setCapitaoNome] = useState('');
  const [capitaoWhats, setCapitaoWhats] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [atletas, setAtletas] = useState<Atleta[]>([
    { id: 1, nome: '', numero: '', documento: '', posicao: '' },
    { id: 2, nome: '', numero: '', documento: '', posicao: '' },
    { id: 3, nome: '', numero: '', documento: '', posicao: '' },
    { id: 4, nome: '', numero: '', documento: '', posicao: '' },
    { id: 5, nome: '', numero: '', documento: '', posicao: '' }
  ]);

  const adicionarAtleta = () => {
    setAtletas((prev) => [
      ...prev,
      { id: Date.now(), nome: '', numero: '', documento: '', posicao: '' }
    ]);
  };

  const removerAtleta = (id: number) => {
    if (atletas.length <= 1) return;
    setAtletas((prev) => prev.filter((a) => a.id !== id));
  };

  const atualizarAtleta = (id: number, campo: keyof Atleta, valor: string) => {
    setAtletas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const atletasPreenchidos = atletas.filter((a) => a.nome.trim() !== '');
    let texto = '*FICHA DE INSCRIÇÃO OFICIAL - ARENA VALE*%0A%0A';
    texto += `*Equipe:* ${nomeTime}%0A`;
    texto += `*Modalidade:* ${modalidade}%0A`;
    texto += `*Cidade:* ${cidade}%0A`;
    texto += `*Capitão:* ${capitaoNome}%0A`;
    texto += `*WhatsApp:* ${capitaoWhats}%0A%0A`;
    texto += `*ATLETAS (${atletasPreenchidos.length}):*%0A`;

    atletasPreenchidos.forEach((a, index) => {
      texto += `${index + 1}. ${a.nome} (Nº ${a.numero || 'S/N'}, Pos: ${a.posicao || '-'}, Doc: ${a.documento || '-'})%0A`;
    });

    setSucesso(true);
    const linkZap = `https://wa.me/5547988444404?text=${texto}`;
    window.open(linkZap, '_blank');
  };

  return (<div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white pb-20"><header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4"><Link href="/" className="flex items-center gap-2"><img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain" /></Link><Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold text-[#a0a8be] hover:text-white transition">← Voltar ao Início</Link></div></header><main className="mx-auto max-w-4xl px-4 sm:px-6 pt-10"><div className="text-center sm:text-left mb-10"><span className="rounded-full bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#e50914]">Área do Capitão</span><h1 className="mt-4 text-3xl sm:text-5xl font-black uppercase tracking-tight">Ficha de Inscrição <span className="text-[#e50914]">do Time</span></h1><p className="mt-2 text-sm text-[#8a92a6]">Preencha os dados da sua agremiação e a lista de atletas que disputarão o campeonato oficial.</p></div>{sucesso && (<div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300 text-sm font-bold flex items-center justify-between"><span>✅ Ficha gerada com sucesso! Redirecionando para a homologação oficial.</span><button type="button" onClick={() => setSucesso(false)} className="text-xs uppercase underline">Fechar</button></div>)}<form onSubmit={handleSubmit} className="space-y-8"><div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-10 shadow-2xl"><h2 className="text-lg font-black uppercase tracking-wider text-white border-b border-white/10 pb-4 mb-6 flex items-center gap-2"><span className="text-[#e50914]">1.</span> Informações da Agremiação & Capitão</h2><div className="grid gap-5 sm:grid-cols-2"><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Nome do Time / Clube *</label><input type="text" required placeholder="Ex: Fênix Clube SC" value={nomeTime} onChange={(e) => setNomeTime(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Campeonato / Modalidade *</label><select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"><option value="Futsal Regional">Futsal Regional</option><option value="Basquetebol Open">Basquetebol Open</option><option value="Voleibol Vale Cup">Voleibol Vale Cup</option><option value="Futebol 7 Intermunicipal">Futebol 7 Intermunicipal</option></select></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Cidade / Bairro *</label><input type="text" required placeholder="Ex: Blumenau / Garcia" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Nome do Capitão / Responsável *</label><input type="text" required placeholder="Nome completo do responsável" value={capitaoNome} onChange={(e) => setCapitaoNome(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div className="sm:col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">WhatsApp para Contato Oficial *</label><input type="tel" required placeholder="(47) 99999-9999" value={capitaoWhats} onChange={(e) => setCapitaoWhats(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div></div></div><div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-10 shadow-2xl"><div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3"><div><h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2"><span className="text-[#e50914]">2.</span> Elenco de Atletas</h2><p className="text-xs text-[#8a92a6] mt-0.5">Cadastre os jogadores que compõem o elenco.</p></div><button type="button" onClick={adicionarAtleta} className="rounded-full border border-[#e50914]/40 bg-[#e50914]/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#ff1e27] hover:bg-[#e50914] hover:text-white transition">+ Adicionar Atleta</button></div><div className="space-y-4">{atletas.map((atleta, index) => (<div key={atleta.id} className="grid grid-cols-12 gap-3 items-center rounded-2xl border border-white/5 bg-[#0b0d12] p-4"><div className="col-span-12 sm:col-span-1 text-center font-black text-xs text-[#8a92a6]">#{index + 1}</div><div className="col-span-12 sm:col-span-5"><input type="text" placeholder="Nome completo do jogador" value={atleta.nome} onChange={(e) => atualizarAtleta(atleta.id, 'nome', e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#13161f] px-3 py-2.5 text-xs text-white focus:border-[#e50914] focus:outline-none" /></div><div className="col-span-4 sm:col-span-2"><input type="text" placeholder="Nº Camisa" value={atleta.numero} onChange={(e) => atualizarAtleta(atleta.id, 'numero', e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#13161f] px-3 py-2.5 text-xs text-center text-white focus:border-[#e50914] focus:outline-none" /></div><div className="col-span-4 sm:col-span-2"><input type="text" placeholder="Posição" value={atleta.posicao} onChange={(e) => atualizarAtleta(atleta.id, 'posicao', e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#13161f] px-3 py-2.5 text-xs text-white focus:border-[#e50914] focus:outline-none" /></div><div className="col-span-3 sm:col-span-1"><input type="text" placeholder="RG/CPF" value={atleta.documento} onChange={(e) => atualizarAtleta(atleta.id, 'documento', e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#13161f] px-2 py-2.5 text-xs text-center text-white focus:border-[#e50914] focus:outline-none" /></div><div className="col-span-1 sm:col-span-1 text-right"><button type="button" onClick={() => removerAtleta(atleta.id)} className="h-8 w-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-sm" title="Remover atleta">✕</button></div></div>))}</div><div className="mt-6 flex justify-center"><button type="button" onClick={adicionarAtleta} className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-bold text-[#cad0e0] hover:text-white hover:border-white/40 transition">+ Adicionar Outro Jogador</button></div></div><div className="pt-4"><button type="submit" className="w-full rounded-full bg-[#e50914] py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-[1.01] transition">🚀 Finalizar e Enviar Ficha de Inscrição Oficial</button><p className="text-center text-xs text-[#8a92a6] mt-3">Ao enviar, a lista será transmitida diretamente para a comissão técnica e organizadora da Arena Vale.</p></div></form></main></div>);
}
