'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface NoticiaItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tag: string;
  imagem?: string;
}

interface AtletaItem {
  id: string;
  nome: string;
  modalidade: string;
  equipe: string;
  destaque: string;
  imagem?: string;
}

const NOTICIAS_PADRAO: NoticiaItem[] = [
  {
    id: 'noticia-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao: 'A Arena Vale prepara cobertura técnica e multimídia completa para o esporte regional com câmeras IA.',
    categoria: 'BROADCAST',
    tag: 'AO VIVO',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'noticia-2',
    titulo: 'INCENTIVO AO ESPORTE REGIONAL',
    descricao: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade esportiva do Vale.',
    categoria: 'PROJETO VALE',
    tag: 'DESTAQUE',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'noticia-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO ESPORTIVA',
    descricao: 'Coordenação e arbitragem estruturadas para elevar o nível técnico de todas as competições.',
    categoria: 'COMPETIÇÕES',
    tag: 'OFICIAL',
    imagem: '/fundo-arena.jpg'
  }
];

const ATLETAS_PADRAO: AtletaItem[] = [
  {
    id: 'atleta-1',
    nome: 'MATHEUS SILVA',
    modalidade: 'FUTSAL ADULTO',
    equipe: 'VALE FC',
    destaque: 'Artilheiro da Temporada · 18 Gols',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'atleta-2',
    nome: 'GABRIEL SOUZA',
    modalidade: 'FUTEBOL 7',
    equipe: 'ATLÉTICO VALE',
    destaque: 'Melhor Goleiro do Circuito',
    imagem: '/fundo-arena.jpg'
  },
  {
    id: 'atleta-3',
    nome: 'LUCAS OLIVEIRA',
    modalidade: 'BASQUETEBOL',
    equipe: 'VALE HOOPS',
    destaque: 'MVP da Etapa Regional',
    imagem: '/fundo-arena.jpg'
  }
];

export default function HomePage() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(0);

  const [noticiasPublicas, setNoticiasPublicas] = useState<NoticiaItem[]>(NOTICIAS_PADRAO);
  const [atletasPublicos, setAtletasPublicos] = useState<AtletaItem[]>(ATLETAS_PADRAO);

  useEffect(() => {
    const supabase = createClient();

    async function carregarConteudo() {
      try {
        const [{ data: noticias, error: erroNoticias }, { data: atletas, error: erroAtletas }] =
          await Promise.all([
            supabase
              .from('noticias')
              .select('id, titulo, descricao, categoria, tag, imagem_url')
              .eq('ativo', true)
              .order('ordem', { ascending: true }) 
              .limit(3),
            supabase
              .from('atletas_destaque')
              .select('id, nome, modalidade, equipe, destaque_texto, imagem_url')
              .eq('ativo', true)
              .order('created_at', { ascending: true })
              .limit(3),
          ]);

        if (!erroNoticias && noticias && noticias.length > 0) {
          setNoticiasPublicas(
            noticias.map((n: any) => ({
              id: n.id,
              titulo: n.titulo,
              descricao: n.descricao,
              categoria: n.categoria,
              tag: n.tag,
              imagem: n.imagem_url || '/fundo-arena.jpg',
            }))
          );
        }

        if (!erroAtletas && atletas && atletas.length > 0) {
          setAtletasPublicos(
            atletas.map((a: any) => ({
              id: a.id,
              nome: a.nome,
              modalidade: a.modalidade,
              equipe: a.equipe,
              destaque: a.destaque_texto,
              imagem: a.imagem_url || '/fundo-arena.jpg',
            }))
          );
        }
      } catch {
        // Mantém os itens padrão se houver falha na ligação
      }
    }

    carregarConteudo();
  }, []);

  const modalidades = [
    {
      id: 'futsal',
      nome: 'Futsal',
      tituloOficial: 'Circuito Arena Vale de Futsal 2026',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra. O Circuito Arena Vale organiza a temporada em fase de grupos seguida de mata-mata, com transmissão ao vivo das principais partidas pela TV Arena Vale.',
      statusBadge: 'CIRCUITO 2026',
      detalhes: [
        'Categorias: Sub-15, Sub-20, Livre (adulto) e Master (35+)',
        'Formato: fase de grupos + mata-mata eliminatório',
        'Duração da partida: 2 tempos de 20 minutos (base) ou 25 minutos (Livre/Master)',
        'Local: ginásios parceiros da região do Vale'
      ]
    },
    {
      id: 'fut7',
      nome: 'Futebol 7',
      tituloOficial: 'Copa Arena Vale de Futebol 7',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'Disputado em campos society, o futebol 7 é ideal para quem busca um futebol mais dinâmico, com espaços reduzidos e jogadas rápidas. A Copa reúne times amadores e semiprofissionais em uma disputa equilibrada ao longo da temporada.',
      statusBadge: 'PRÉ-TEMPORADA',
      detalhes: [
        'Categorias: Livre (adulto) e Sub-17',
        'Formato: fase de grupos + mata-mata eliminatório',
        'Duração da partida: 2 tempos de 25 minutos',
        'Local: campos society parceiros'
      ]
    },
    {
      id: 'basquete',
      nome: 'Basquetebol',
      tituloOficial: 'Liga Arena Vale de Basquete',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'A liga de basquete valoriza o preparo físico e técnico dos atletas, com jogos disputados em quadras cobertas e cronometragem oficial. É uma das modalidades com maior crescimento de público nas transmissões da Arena Vale.',
      statusBadge: 'EM PLANEAMENTO',
      detalhes: [
        'Categorias: Sub-17 e Livre (adulto)',
        'Formato: pontos corridos (turno único) + fase final com os 4 melhores',
        'Duração da partida: 4 quartos de 10 minutos',
        'Local: ginásios parceiros da região do Vale'
      ]
    },
    {
      id: 'volei',
      nome: 'Voleibol',
      tituloOficial: 'Torneio Arena Vale de Vôlei',
      fase: 'Em Breve · Temporada 2026',
      descricao: 'O vôlei reúne equipes masculinas e femininas em um torneio disputado em sistema de melhor de 3 ou 5 sets, com arbitragem oficial e cobertura completa das principais partidas.',
      statusBadge: 'PROJETOS ABERTOS',
      detalhes: [
        'Categorias: Masculino e Feminino, Livre (adulto)',
        'Formato: fase de grupos + mata-mata (melhor de 3 sets) + final (melhor de 5 sets)',
        'Local: ginásios parceiros da região do Vale'
      ]
    }
  ];

  const ativo = modalidades[campeonatoSelecionado];

  return (
    <>
      <div id="topo" className="min-h-screen bg-[#070b13] text-white selection:bg-[#d4af37] selection:text-[#070b13]">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070b13]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
            <div className="flex items-center shrink-0">
              <Link href="/" title="Início" className="group relative flex items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02]">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#d4af37]/30 via-white/10 to-transparent opacity
