'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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

  const supabase = createClient();

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
      // Limpar formulário após sucesso
      setNome('');
      setCategoria('Principal');
      setDataInicio('');
      setDataFim('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070b13] p-8 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider">Gerir Campeonatos</h1>
            <p className="text-[#8a92a6] mt-1">Crie novas copas e jornadas na base de dados.</p>
          </div>
          <Link href="/painel" className="bg-[#101726] border border-white/10 hover:border-[#d4af37] px-4 py-2 rounded-lg text-sm font-bold uppercase transition">
            Voltar ao Painel
          </Link>
        </div>

        <div className="bg-[#101726] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-[#d4af37] mb-6 uppercase border-b border-white/10 pb-4">Novo Campeonato</h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg font-bold text-center border ${message.type === 'success' ? 'bg-[#101726] border-[#d4af37] text-[#d4af37]' : 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCriarCampeonato} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Nome do Campeonato</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Copa Arena Vale 2026" className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Ano</label>
              <input type="number" required value={ano} onChange={(e) => setAno(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Categoria</label>
              <input type="text" required value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Principal, Sub-23, Veteranos" className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Formato</label>
              <select value={formato} onChange={(e) => setFormato(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition appearance-none">
                <option value="pontos_corridos">Pontos Corridos</option>
                <option value="mata_mata">Mata-Mata</option>
                <option value="misto">Misto (Grupos + Eliminatórias)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition appearance-none">
                <option value="inscricoes_abertas">Inscrições Abertas</option>
                <option value="fase_grupos">Fase de Grupos</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Data de Início</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" style={{ colorScheme: 'dark' }} />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Data de Fim (Opcional)</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition" style={{ colorScheme: 'dark' }} />
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" disabled={loading} className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-[#070b13] font-black uppercase tracking-wider py-4 rounded-lg transition disabled:opacity-50">
                {loading ? 'A Gravar...' : 'Gravar Campeonato'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
