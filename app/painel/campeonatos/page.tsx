'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Interface para definir o tipo de dados do Campeonato
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
  
  // Novo estado para guardar a lista de campeonatos
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);

  const supabase = createClient();

  // Função para ir buscar os campeonatos à base de dados
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

  // Carregar a lista assim que a página abre
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
      // Atualizar a grelha visual automaticamente após inserir
      fetchCampeonatos();
    }
    setLoading(false);
  };

  // Função auxiliar para formatar o status na tabela
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
    <div className="min-h-screen bg-[#070b13] p-8 font-sans text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider">Gerir Campeonatos</h1>
            <p className="text-[#8a92a6] mt-1">Crie novas copas e gira a base de dados da Arena Vale.</p>
          </div>
          <Link href="/painel" className="bg-[#101726] border border-white/10 hover:border-[#d4af37] px-4 py-2 rounded-lg text-sm font-bold uppercase transition">
            Voltar ao Painel
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Formulário */}
          <div className="lg:col-span-1 bg-[#101726] border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
            <h2 className="text-xl font-bold text-[#d4af37] mb-6 uppercase border-b border-white/10 pb-4">Novo Campeonato</h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg font-bold text-center border ${message.type === 'success' ? 'bg-[#101726] border-[#d4af37] text-[#d4af37]' : 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCriarCampeonato} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Nome</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Copa Arena Vale" className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Ano</label>
                  <input type="number" required value={ano} onChange={(e) => setAno(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Categoria</label>
                  <input type="text" required value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Principal" className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Formato</label>
                <select value={formato} onChange={(e) => setFormato(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition appearance-none">
                  <option value="pontos_corridos">Pontos Corridos</option>
                  <option value="mata_mata">Mata-Mata</option>
                  <option value="misto">Misto (Grupos + Eliminatórias)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition appearance-none">
                  <option value="inscricoes_abertas">Inscrições Abertas</option>
                  <option value="fase_grupos">Fase de Grupos</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Início</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Fim (Opc.)</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition" style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#070b13] font-black uppercase tracking-wider py-4 rounded-lg transition disabled:opacity-50">
                {loading ? 'A Gravar...' : 'Gravar'}
              </button>
            </form>
          </div>

          {/* Coluna Direita: Tabela de Campeonatos */}
          <div className="lg:col-span-2 bg-[#101726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#d4af37] mb-6 uppercase border-b border-white/10 pb-4">Campeonatos Registados</h2>
            
            {loadingLista ? (
              <div className="text-center py-8 text-[#8a92a6]">A carregar campeonatos...</div>
            ) : campeonatos.length === 0 ? (
              <div className="text-center py-8 text-[#8a92a6]">Nenhum campeonato registado ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase text-[#8a92a6]">
                      <th className="py-3 px-4 font-bold">Campeonato</th>
                      <th className="py-3 px-4 font-bold">Categoria</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold">Início</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campeonatos.map((camp) => (
                      <tr key={camp.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-4 font-bold text-white">{camp.nome} <span className="text-[#8a92a6] font-normal text-sm ml-1">({camp.ano})</span></td>
                        <td className="py-4 px-4 text-sm">{camp.categoria}</td>
                        <td className="py-4 px-4">
                          <span className="bg-[#070b13] border border-white/10 text-[#d4af37] text-xs px-2 py-1 rounded font-bold uppercase">
                            {formatarStatus(camp.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-[#8a92a6]">
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
