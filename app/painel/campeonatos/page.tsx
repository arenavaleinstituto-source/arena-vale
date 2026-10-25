'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Campeonato {
  id: string;
  nome: string;
  ano: number;
  categoria: string;
  formato: string;
  status: string;
  data_inicio: string;
}

export default function CampeonatosPage() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [categoria, setCategoria] = useState('Principal');
  const [formato, setFormato] = useState('pontos_corridos');
  const [status, setStatus] = useState('fase_grupos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);

  const supabase = createClient();

  const fetchCampeonatos = async () => {
    setLoadingLista(true);
    const { data, error } = await supabase
      .from('campeonatos')
      .select('*')
      .order('data_inicio', { ascending: false });

    if (!error && data) {
      setCampeonatos(data);
    }
    setLoadingLista(false);
  };

  useEffect(() => {
    fetchCampeonatos();
  }, []);

  const handleCriarCampeonato = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('campeonatos')
      .insert([
        {
          nome,
          ano: parseInt(ano),
          categoria,
          formato,
          status,
          data_inicio: dataInicio || null,
          data_fim: dataFim || null,
        }
      ]);

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao criar campeonato. Verifique as permissões (RLS).' });
    } else {
      setMessage({ type: 'success', text: 'Campeonato criado com sucesso!' });
      setNome('');
      setCategoria('Principal');
      setDataInicio('');
      setDataFim('');
      fetchCampeonatos();
    }
    setLoading(false);
  };

  const formatarStatus = (status: string) => {
    const mapa: Record<string, string> = {
      'inscricoes_abertas': 'Inscrições Abertas',
      'fase_grupos': 'Fase de Grupos',
      'em_andamento': 'Em Andamento',
      'finalizado': 'Finalizado'
    };
    return mapa[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#070b13] p-4 md:p-8 font-sans text-white selection:bg-[#d4af37] selection:text-[#070b13]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BARRA SUPERIOR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-widest text-[#d4af37] uppercase">ARENA VALE</span>
              <span className="text-xs text-[#8a92a6] font-bold uppercase tracking-widest">
                Painel Restrito • <span className="text-white">Gerir Campeonatos</span>
              </span>
            </div>
          </div>
          <Link
            href="/painel"
            className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg bg-[#101726] border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] text-white transition-all flex items-center gap-2 shadow-lg"
          >
            ← VOLTAR AO PAINEL
          </Link>
        </header>

        {/* HERO / TÍTULO DA PÁGINA */}
        <section className="bg-
