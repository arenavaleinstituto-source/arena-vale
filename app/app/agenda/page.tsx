'use client';

import React from 'react';
import Link from 'next/link';

interface JogoItem {
  data: string;
  hora: string;
  confronto: string;
  local: string;
}

const jogosFutsal: JogoItem[] = [
  { data: '07/11/2026', hora: '19h30', confronto: 'Vale FC x Uniao Esportiva', local: 'Ginasio Municipal Central' },
  { data: '07/11/2026', hora: '21h00', confronto: 'Amigos do Vale x Real Clube', local: 'Ginasio Municipal Central' },
  { data: '14/11/2026', hora: '19h30', confronto: 'Vale FC x Real Clube', local: 'Ginasio Municipal Central' }
];

const jogosFutebol7: JogoItem[] = [
  { data: '08/11/2026', hora: '09h00', confronto: 'Atletico Vale x Sociedade Esportiva', local: 'Society Parque das Aguas' },
  { data: '08/11/2026', hora: '10h30', confronto: 'Vale United x Estrela do Sul', local: 'Society Parque das Aguas' },
  { data: '15/11/2026', hora: '09h00', confronto: 'Atletico Vale x Vale United', local: 'Society Parque das Aguas' }
];

const jogosBasquete: JogoItem[] = [
  { data: '09/11/2026', hora: '18h00', confronto: 'Vale Basket x Furacao do Vale', local: 'Ginasio Poliesportivo Sul' },
  { data: '16/11/2026', hora: '18h00', confronto: 'Vale Basket x Aguias do Vale', local: 'Ginasio Poliesportivo Sul' }
];

const jogosVolei: JogoItem[] = [
  { data: '10/11/2026', hora: '19h00', confronto: 'Vale Volei x Set Vale', local: 'Ginasio Municipal Central' },
  { data: '17/11/2026', hora: '19h00', confronto: 'Vale Volei x Ataque Vale', local: 'Ginasio Municipal Central' }
];

export default function AgendaPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-[#cad0e0] selection:bg-[#e50914] selection:text-white font-sans">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO DA AGENDA */}
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-12">
        <div className="border-b border-white/10 pb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4">CALENDÁRIO OFICIAL · TEMPORADA 2026</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">Agenda de Exemplo — Arena Vale</h1>
          <p className="text-sm sm:text-base text-[#8a92a6] leading-relaxed">
            Jogos fictícios para preencher a Agenda do site até as inscrições reais estarem fechadas. Troque os times e datas pelos confrontos de verdade assim que definidos.
          </p>
        </div>

        {/* TABELA FUTSAL */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white flex items-center gap-3">
            <span className="h-3 w-1.5 bg-[#e50914]" /> Futsal — Categoria Livre
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e1118] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase tracking-wider text-[#8a92a6]">
                  <th className="p-4 sm:px-6">Data</th>
                  <th className="p-4 sm:px-6">Hora</th>
                  <th className="p-4 sm:px-6">Confronto</th>
                  <th className="p-4 sm:px-6">Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {jogosFutsal.map((j, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition">
                    <td className="p-4 sm:px-6 font-mono text-[#cad0e0]">{j.data}</td>
                    <td className="p-4 sm:px-6 font-mono font-bold text-amber-400">{j.hora}</td>
                    <td className="p-4 sm:px-6 font-bold text-white uppercase">{j.confronto}</td>
                    <td className="p-4 sm:px-6 text-[#8a92a6] uppercase">{j.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA FUTEBOL 7 */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white flex items-center gap-3">
            <span className="h-3 w-1.5 bg-[#e50914]" /> Futebol 7 — Categoria Livre
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e1118] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase tracking-wider text-[#8a92a6]">
                  <th className="p-4 sm:px-6">Data</th>
                  <th className="p-4 sm:px-6">Hora</th>
                  <th className="p-4 sm:px-6">Confronto</th>
                  <th className="p-4 sm:px-6">Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {jogosFutebol7.map((j, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition">
                    <td className="p-4 sm:px-6 font-mono text-[#cad0e0]">{j.data}</td>
                    <td className="p-4 sm:px-6 font-mono font-bold text-amber-400">{j.hora}</td>
                    <td className="p-4 sm:px-6 font-bold text-white uppercase">{j.confronto}</td>
                    <td className="p-4 sm:px-6 text-[#8a92a6] uppercase">{j.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA BASQUETEBOL */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white flex items-center gap-3">
            <span className="h-3 w-1.5 bg-[#e50914]" /> Basquetebol — Categoria Livre
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e1118] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase tracking-wider text-[#8a92a6]">
                  <th className="p-4 sm:px-6">Data</th>
                  <th className="p-4 sm:px-6">Hora</th>
                  <th className="p-4 sm:px-6">Confronto</th>
                  <th className="p-4 sm:px-6">Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {jogosBasquete.map((j, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition">
                    <td className="p-4 sm:px-6 font-mono text-[#cad0e0]">{j.data}</td>
                    <td className="p-4 sm:px-6 font-mono font-bold text-amber-400">{j.hora}</td>
                    <td className="p-4 sm:px-6 font-bold text-white uppercase">{j.confronto}</td>
                    <td className="p-4 sm:px-6 text-[#8a92a6] uppercase">{j.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA VOLEIBOL */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white flex items-center gap-3">
            <span className="h-3 w-1.5 bg-[#e50914]" /> Voleibol — Feminino Livre
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e1118] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase tracking-wider text-[#8a92a6]">
                  <th className="p-4 sm:px-6">Data</th>
                  <th className="p-4 sm:px-6">Hora</th>
                  <th className="p-4 sm:px-6">Confronto</th>
                  <th className="p-4 sm:px-6">Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {jogosVolei.map((j, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition">
                    <td className="p-4 sm:px-6 font-mono text-[#cad0e0]">{j.data}</td>
                    <td className="p-4 sm:px-6 font-mono font-bold text-amber-400">{j.hora}</td>
                    <td className="p-4 sm:px-6 font-bold text-white uppercase">{j.confronto}</td>
                    <td className="p-4 sm:px-6 text-[#8a92a6] uppercase">{j.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMO USAR / INSTRUÇÕES */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0e1118] to-[#07080c] p-8 sm:p-10 shadow-xl mt-12">
          <h3 className="text-lg font-black uppercase text-amber-400 mb-4">📌 Como usar esta agenda</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#cad0e0]">
            <li className="flex items-start gap-3">
              <span className="text-[#e50914] font-bold">•</span>
              <span>Esses times e horários são fictícios, criados só para a Agenda não aparecer vazia enquanto as inscrições reais não fecham.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#e50914] font-bold">•</span>
              <span>Assim que tiver times de verdade inscritos, basta substituir os nomes e manter o mesmo formato de tabela.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#e50914] font-bold">•</span>
              <span>Quando o painel estiver publicado e conectado ao banco, esses jogos passam a ser cadastrados lá, e essa tabela deixa de ser necessária.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
