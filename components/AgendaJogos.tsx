'use client';

import React, { useState } from 'react';

export default function AgendaJogos() {
  // Simulação ou dados da agenda
  const [jogos, setJogos] = useState([
    {
      id: 1,
      campeonato: 'Circuito Arena Vale de Futsal 2026',
      data: '28/10/2026',
      horario: '19:30',
      equipeA: 'Valeprev Futsal',
      equipeB: 'Atlético Blumenau',
      local: 'Ginásio Municipal do Vale',
      status: 'Confirmado',
    },
    {
      id: 2,
      campeonato: 'Copa Regional Vale de Futebol 7',
      data: '30/10/2026',
      horario: '20:15',
      equipeA: 'Botafogo do Vale',
      equipeB: 'Ajax Pomerode',
      local: 'Arena Principal',
      status: 'Agendado',
    },
  ]);

  return (
    <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-6 sm:p-10 shadow-2xl relative overflow-hidden my-8">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />

      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f] mb-2">
            CALENDÁRIO OFICIAL · CFG6
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Agenda de Jogos</h2>
          <p className="text-xs text-[#8a92a6] uppercase mt-1">Confrontos agendados para a temporada atual</p>
        </div>
        <div className="rounded-full bg-[#e50914] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30">
          Próximos Jogos
        </div>
      </div>

      {/* LISTA DE JOGOS */}
      {jogos.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#8a92a6] uppercase tracking-wider">
          Nenhum confronto agendado no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {jogos.map((jogo) => (
            <div key={jogo.id} className="rounded-2xl border border-white/10 bg-[#07080c] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#e50914]/50 transition duration-300">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">{jogo.campeonato}</span>
                <div className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {jogo.equipeA} <span className="text-[#8a92a6] font-normal">vs</span> {jogo.equipeB}
                </div>
                <p className="text-[11px] text-[#8a92a6] uppercase">Local: {jogo.local}</p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <div className="text-center">
                  <span className="text-[10px] text-[#8a92a6] uppercase block">Data</span>
                  <span className="text-xs font-bold text-white">{jogo.data}</span>
                </div>
                <div className="h-6 w-[1px] bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#8a92a6] uppercase block">Horário</span>
                  <span className="text-xs font-black text-[#e50914]">{jogo.horario}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
