import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Inicialização direta do cliente para Server Component (apenas leitura pública)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60; // Atualiza o cache a cada 60 segundos

export default async function AgendaPage() {
  const { data: jogos } = await supabase
    .from('agenda_jogos')
    .select('*')
    .order('data_hora', { ascending: true });

  return (
    <div className="min-h-screen bg-[#070b13] text-white">
      {/* Mantenha o seu Header aqui */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black uppercase text-amber-400 mb-8">Agenda de Jogos</h1>
        
        {!jogos || jogos.length === 0 ? (
          <p>Nenhum confronto agendado.</p>
        ) : (
          <div className="space-y-4">
            {jogos.map((jogo) => (
              <div key={jogo.id} className="bg-[#0a1120] p-6 border border-slate-800 rounded-xl">
                <span className="text-amber-400 text-xs font-bold uppercase">{jogo.modalidade} - {jogo.fase}</span>
                <h3 className="text-xl font-bold mt-2">{jogo.equipe_casa} vs {jogo.equipe_fora}</h3>
                <p className="text-sm text-slate-400">{new Date(jogo.data_hora).toLocaleString('pt-BR')} | {jogo.local}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
