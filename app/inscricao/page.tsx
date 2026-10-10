'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Atleta {
  nome: string;
  camisa: string;
  posicao: string;
  documento: string;
}

export default function InscricaoPage() {
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [modalidade, setModalidade] = useState('Futsal');
  const [categoria, setCategoria] = useState('Livre / Adulto');
  const [cidade, setCidade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [documentoResponsavel, setDocumentoResponsavel] = useState('');
  const [termoAceito, setTermoAceito] = useState(false);

  const [atletas, setAtletas] = useState<Atleta[]>([
    { nome: '', camisa: '', posicao: '', documento: '' }
  ]);

  const adicionarAtleta = () => {
    setAtletas([...atletas, { nome: '', camisa: '', posicao: '', documento: '' }]);
  };

  const removerAtleta = (index: number) => {
    if (atletas.length > 1) {
      setAtletas(atletas.filter((_, i) => i !== index));
    }
  };

  const atualizarAtleta = (index: number, campo: keyof Atleta, valor: string) => {
    const novaLista = [...atletas];
    novaLista[index][campo] = valor;
    setAtletas(novaLista);
  };

  const handleEnviarInscricao = (e: React.FormEvent) => {
    e.preventDefault();

    if (!termoAceito) {
      alert('É obrigatório ler e aceitar o Termo de Responsabilidade e Cessão de Imagem para prosseguir.');
      return;
    }

    const dataHoraRegistro = new Date().toLocaleString('pt-BR');

    let texto = `*INSCRIÇÃO OFICIAL · ARENA VALE*\n`;
    texto += `*CNPJ Organizador:* 40.694.741/0001-34\n`;
    texto += `------------------------------------\n`;
    texto += `*Equipa:* ${nomeEquipe}\n`;
    texto += `*Modalidade:* ${modalidade}\n`;
    texto += `*Categoria:* ${categoria}\n`;
    texto += `*Cidade/Região:* ${cidade}\n`;
    texto += `*Responsável pelo Registo:* ${responsavel}\n`;
    texto += `*Documento (CPF/RG):* ${documentoResponsavel}\n`;
    texto += `*Data/Hora do Registo:* ${dataHoraRegistro}\n`;
    texto += `------------------------------------\n`;
    texto += `*TERMO DE DIREITO DE IMAGEM: ACEITE CONFIRMADO*\n`;
    texto += `O responsável declara possuir a autorização prévia de todos os atletas para transmissão, fotos e divulgação oficial na plataforma Arena Vale (CNPJ 40.694.741/0001-34).\n`;
    texto += `------------------------------------\n`;
    texto += `*ELENCO DE ATLETAS (${atletas.length}):*\n`;

    atletas.forEach((atleta, idx) => {
      if (atleta.nome.trim()) {
        texto += `${idx + 1}. ${atleta.nome.toUpperCase()} | Nº: ${atleta.camisa || 'S/N'} | Pos: ${atleta.posicao || 'N/I'} | Doc: ${atleta.documento || 'Pendente'}\n`;
      }
    });

    const linkWhatsapp = `https://wa.me/5547988444404?text=${encodeURIComponent(texto)}`;
    window.open(linkWhatsapp, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo 02.png" alt="Arena Vale" className="h-14 sm:h-16 w-auto object-contain" />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#a0a8be] hover:border-white/40 hover:text-white transition"
          >
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <span className="rounded-full bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#e50914]">
            Ficha Oficial de Cadastro
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Inscrição de Equipa & Atletas
          </h1>
          <p className="mt-3 text-sm text-[#8a92a6] max-w-2xl mx-auto">
            Preencha os dados oficiais da agremiação, o elenco de atletas e confirme o termo de responsabilidade de imagens perante a Arena Vale (CNPJ 40.694.741/0001-34).
          </p>
        </div>

        <form onSubmit={handleEnviarInscricao} className="space-y-8">
          {/* 1. Dados da Equipa */}
          <div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-black uppercase tracking-wider text-[#e50914] mb-6 flex items-center gap-2">
              <span>⚽</span> 1. Dados da Agremiação & Modalidade
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Nome da Equipa / Clube *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fênix Futsal Blumenau"
                  value={nomeEquipe}
                  onChange={(e) => setNomeEquipe(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Modalidade *
                </label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
                >
                  <option value="Futsal">Futsal</option>
                  <option value="Basquetebol">Basquetebol</option>
                  <option value="Futebol 7">Futebol 7</option>
                  <option value="Voleibol">Voleibol</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Livre, Veteranos, Sub-17"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Cidade / Município *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Blumenau / SC"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Responsável pelo Cadastro (Apenas Nome e Documento) */}
          <div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-black uppercase tracking-wider text-[#e50914] mb-6 flex items-center gap-2">
              <span>👤</span> 2. Responsável pelo Registo (Capitão / Dirigente)
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Nome Completo do Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Capitão ou Dirigente"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                  Documento (CPF ou RG) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={documentoResponsavel}
                  onChange={(e) => setDocumentoResponsavel(e.target.value)}
                  className="w-full rounded-xl border border-white/15
