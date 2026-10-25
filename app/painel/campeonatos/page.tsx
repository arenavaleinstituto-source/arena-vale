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

  const formatarStatus = (statusVal: string) => {
    const mapa: Record<string, string> = {
      'inscricoes_abertas': 'Inscrições Abertas',
      'fase_grupos': 'Fase de Grupos',
      'em_andamento': 'Em Andamento',
      'finalizado': 'Finalizado'
    };
    return mapa[statusVal] || statusVal;
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans text-white selection:bg-yellow-400 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BARRA SUPERIOR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-widest text-white uppercase">ARENA VALE</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Painel Restrito • <span className="text-white">Gerir Campeonatos</span>
              </span>
            </div>
          </div>
          <Link
            href="/painel"
            className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg bg-[#111111] border border-white/10 hover:border-white hover:text-black hover:bg-white text-white transition-all flex items-center gap-2 shadow-lg"
          >
            ← VOLTAR AO PAINEL
          </Link>
        </header>

        {/* HERO / TÍTULO DA PÁGINA */}
        <section className="bg-gradient-to-r from-[#111111] to-[#0a0a0a] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
              GERIR <span className="text-gray-300">CAMPEONATOS</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-widest uppercase font-bold max-w-3xl">
              Crie novas copas, defina formatos e acompanhe o status de todas as competições da Arena Vale.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="lg:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-xl h-fit">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
              <span className="h-4 w-1.5 bg-white -skew-x-12" />
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Novo Campeonato</h2>
            </div>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl font-bold text-xs tracking-wider uppercase text-center border ${message.type === 'success' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-white/5 border-white/20 text-white'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCriarCampeonato} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Nome Oficial</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Copa Arena Vale" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition font-medium text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Ano</label>
                  <input type="number" required value={ano} onChange={(e) => setAno(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition font-medium text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Categoria</label>
                  <input type="text" required value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Principal" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition font-medium text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Formato de Disputa</label>
                <select value={formato} onChange={(e) => setFormato(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition appearance-none font-medium text-white">
                  <option value="pontos_corridos">Pontos Corridos</option>
                  <option value="mata_mata">Mata-Mata</option>
                  <option value="misto">Misto (Grupos + Eliminatórias)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Status Atual</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition appearance-none font-medium text-white">
                  <option value="inscricoes_abertas">Inscrições Abertas</option>
                  <option value="fase_grupos">Fase de Grupos</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Data de Início</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition text-white" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Fim (Opcional)</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition text-white" style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-xl transition shadow-lg disabled:opacity-50">
                {loading ? 'A GRAVAR...' : 'GRAVAR CAMPEONATO'}
              </button>
            </form>
          </div>

          {/* COLUNA DIREITA: TABELA DE CAMPEONATOS */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
              <span className="h-4 w-1.5 bg-white -skew-x-12" />
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Base de Dados</h2>
            </div>
            
            {loadingLista ? (
              <div className="text-center py-16 text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">A carregar registos...</div>
            ) : campeonatos.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-wider text-sm">O cofre está vazio. Nenhum campeonato registado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase text-gray-400 tracking-widest">
                      <th className="py-4 px-4 font-black">Competição</th>
                      <th className="py-4 px-4 font-black">Categoria</th>
                      <th className="py-4 px-4 font-black">Status</th>
                      <th className="py-4 px-4 font-black">Início</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campeonatos.map((camp) => (
                      <tr key={camp.id} className="border-b border-white/5 hover:bg-[#111111] transition-colors group">
                        <td className="py-5 px-4">
                          <div className="font-black text-white text-sm uppercase tracking-wide group-hover:text-yellow-400 transition-colors">{camp.nome}</div>
                          <div className="text-gray-400 text-xs font-bold mt-1 tracking-widest">EDIÇÃO {camp.ano}</div>
                        </td>
                        <td className="py-5 px-4 text-xs font-bold text-white uppercase tracking-wider">{camp.categoria}</td>
                        <td className="py-5 px-4">
                          <span className="inline-block bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-wider">
                            {formatarStatus(camp.status)}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-xs font-bold text-gray-400 tracking-wider">
                          {camp.data_inicio ? new Date(camp.data_inicio).toLocaleDateString('pt-BR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
