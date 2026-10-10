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

  return (<div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white pb-20">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto
