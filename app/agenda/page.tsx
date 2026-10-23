'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface JogoAgenda {
  id: string;
  modalidade: string;
  fase: string;
  equipe_casa: string;
  equipe_fora: string;
  data_hora: string;
  local: string;
  status: string;
}

export default function AgendaPublicaPage() {
  const [jogos, setJogos] = useState<JogoAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function carregarAgenda() {
      try {
        const { data, error } = await supabase
          .from('agenda_jogos')
          .select('*')
          .order('data_hora', { ascending: true });

        if (!error && data) {
          setJogos(data);
        }
      } catch {
        // Fallback se a tabela ainda estiver a ser criada
      } finally {
        setLoading(false);
      }
    }

    carregarAgenda();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans">
      
      {/* CABEÇALHO */}
      <header className="w-full bg-[#070b13] py-4 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-wider text-amber-400">
            ARENA VALE <span className="text-xs text-slate-400 font-normal uppercase ml-2">| Agenda Oficial</span>
          </Link>
          <Link href="/" className="text-xs text-slate-300 hover:text-amber-400 font-bold transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            Calendário Desportivo 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            Próximos Confrontos & Jogos
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto uppercase">
            Consulte as datas, horários e locais de todas as partidas oficiais organizadas pela Arena Vale.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">A carregar agenda de confrontos...</div>
        ) : jogos.length === 0 ? (
          <div className="bg-[#0a1120] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <span className="text-4xl">📅</span>
            <h3 className="text-lg font-bold uppercase text-white">Nenhum jogo agendado de momento</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto uppercase">
              As novas jornadas e confrontos de Futsal, Futebol 7, Basquetebol e Voleibol serão publicados em breve pela comissão organizadora.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jogos.map((jogo) => (
              <div key={jogo.id} className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {jogo.modalidade} · {jogo.fase}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(jogo.data_hora).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 text-center">
                  <span className="w-2/5 font-black uppercase text-sm sm:text-base text-white truncate">{jogo.equipe_casa}</span>
                  <span className="text-xs font-black text-amber-400 px-2">VS</span>
                  <span className="w-2/5 font-black uppercase text-sm sm:text-base text-white truncate">{jogo.equipe_fora}</span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>📍 {jogo.local || 'Ginásio / Campo Oficial'}</span>
                  <span className="font-bold text-emerald-400 uppercase">{jogo.status || 'Agendado'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
