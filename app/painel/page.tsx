'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PainelPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [usuarioEmail, setUsuarioEmail] = useState<string>('carregando...');
  const [totalCampeonatos, setTotalCampeonatos] = useState<number | string>('--');
  const [totalInscricoes, setTotalInscricoes] = useState<number | string>('--');
  const [campeonatoDestaque, setCampeonatoDestaque] = useState<string>('Copa Regional Vale 2026');
  const [sistemaStatus, setSistemaStatus] = useState<boolean>(true);

  useEffect(() => {
    async function carregarDadosPainel() {
      try {
        // 1. Identificar usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUsuarioEmail(user.email);
        }

        // 2. Buscar contagem de campeonatos cadastrados
        const { count: countCamps, error: errCamps } = await supabase
          .from('campeonatos')
          .select('*', { count: 'exact', head: true });

        if (!errCamps && countCamps !== null) {
          setTotalCampeonatos(countCamps);
        }

        // 3. Buscar inscrições de atletas
        const { count: countInscritos, error: errInsc } = await supabase
          .from('inscricoes')
          .select('*', { count: 'exact', head: true });

        if (!errInsc && countInscritos !== null) {
          setTotalInscricoes(countInscritos);
        }

        // 4. Buscar campeonato ativo principal
        const { data: campAtivo } = await supabase
          .from('campeonatos')
          .select('nome')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (campAtivo?.nome) {
          setCampeonatoDestaque(campAtivo.nome);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setSistemaStatus(false);
      }
    }

    carregarDadosPainel();
  }, [supabase]);

  // Função para deslogar
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#070b13] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* BARRA SUPERIOR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-amber-400">ARENA VALE</span>
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                Painel Restrito • {usuarioEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition flex items-center gap-2"
            >
              VER SITE PRINCIPAL ↗
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs md:text-sm font-bold rounded-lg bg-red-700 hover:bg-red-800 text-white transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              SAIR 🔒
            </button>
          </div>
        </header>

        {/* HERO / TÍTULO PRINCIPAL */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
            Centro de Comando & Gestão Editorial
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 tracking-wide uppercase font-medium">
            Painel do Coordenador: autoridade total para criar campeonatos, postar notícias, gerir atletas e conteúdos.
          </p>
        </section>

        {/* SEÇÃO DE MÉTRICAS */}
        <section className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-amber-300 bg-amber-400/10 rounded border border-amber-400/20 uppercase">
                Métricas e Avaliação
              </span>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white mt-2">
                Relatório de Tráfego e Desempenho
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                Acompanhamento em tempo real das visitas e conteúdos da Arena Vale
              </p>
            </div>

            <div>
