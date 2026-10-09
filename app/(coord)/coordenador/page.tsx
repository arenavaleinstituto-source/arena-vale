'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CoordenadorDashboardPage() {
  // 1. ESPAÇO PARA OS 3 COORDENADORES GERAIS
  const [coordenadores, setCoordenadores] = useState([
    {
      id: 1,
      cargo: 'COORDENADOR GERAL / FUNDADOR',
      nome: 'Coordenação Arena Vale',
      email: 'arenavale2026@gmail.com',
      telefone: '(47) 98844-4404',
      status: 'ATIVO'
    },
    {
      id: 2,
      cargo: 'COORDENADOR DE COMPETIÇÕES',
      nome: 'Gestão de Campeonatos',
      email: 'competicoes@arenavale.com.br',
      telefone: '(47) 98844-4404',
      status: 'ATIVO'
    },
    {
      id: 3,
      cargo: 'COORDENADOR DE COMUNICAÇÃO & TRANSMISSÃO',
      nome: 'Mídia & Cobertura TV',
      email: 'imprensa@arenavale.com.br',
      telefone: '(47) 98844-4404',
      status: 'ATIVO'
    }
  ]);

  // Estados para edição rápida de Coordenador
  const [coordEditando, setCoordEditando] = useState<any | null>(null);

  // 2. MODERADORES E CAPITÃES
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

    setUsuarios((prev) => [
      ...prev,
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

  const handleSalvarCoordenador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordEditando) return;

    setCoordenadores((prev) =>
      prev.map((c) => (c.id === coordEditando.id ? coordEditando : c))
