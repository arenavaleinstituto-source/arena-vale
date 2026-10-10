'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(2);

  const listaJogos = [
    { status: 'AO VIVO', horario: 'HOJE · 19:30', time1: 'FÊNIX CLUB', time2: 'VALE UNITED' },
    { status: 'EM BREVE', horario: 'HOJE · 21:00', time1: 'ARENA FC', time2: 'BLUMENAU 7' },
    { status: 'AGENDADA', horario: 'AMANHÃ · 18:00', time1: 'ESTRELA AZUL', time2: 'LIONS SC' }
  ];

  const noticias = [
    { titulo: 'LIGA REGIONAL DE FUTSAL', descricao: 'Confira a análise técnica da rodada e os melhores momentos.', categoria: 'GIRO DA ARENA', tag: 'ANÁLISE' },
    { titulo: 'SUPERCOPA VALE 2026', descricao: 'Grandes jogadas e os bastidores das semifinais eletrizantes.', categoria: 'PÓS-JOGO ARENA', tag: 'HIGHLIGHTS' },
    { titulo: 'FORMAÇÃO E NOVOS TALENTOS', descricao: 'Conheça os jovens que estão se destacando nas categorias de base.', categoria: 'ARENA BASE', tag: 'HISTÓRIAS' }
  ];

  const campeonatos = [
    {
      id: 'futsal',
      nome: 'Futsal Regional',
      fase: 'Fase de Grupos',
      logo: '/campeonato-futsal.png',
      sigla: 'FR',
      patrocinadores: [
        { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
        { nome: 'Empresa Parceira', cota: 'Apoio Oficial' },
        { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
      ]
    },
    {
      id: 'volei',
      nome: 'Voleibol Vale Cup',
      fase: 'Oitavos de Final',
      logo: '/campeonato-volei.png',
      sigla: 'VC',
      patrocinadores: [
        { nome: 'Patrocinador Master', cota: 'Master do Torneio' },
        { nome: 'Marca Regional', cota: 'Apoio Oficial' },
        { nome: 'Espaço Disponível', cota: 'Cota Aberta' }
      ]
    },
    {
      id: 'basquete',
      nome: 'Basquetebol Open',
      fase: 'Classificatórias',
      logo: '/LOGO%20B
