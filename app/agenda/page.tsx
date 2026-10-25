import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Agenda de Jogos | Arena Vale Sports',
  description: 'Consulte o calendário oficial de confrontos, datas, horários e locais dos campeonatos da Arena Vale.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AgendaPage() {
  const jogos = [
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
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-sm font-black uppercase tracking-widest text-white">ARENA VALE</span>
            <span className="text-[10px] font-bold text-[#8a92a6] uppercase tracking-wider">| Agenda Oficial</span>
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-12 space-y-12">
        
        {/* HERO / TÍTULO */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f]">
            CALENDÁRIO DE CONFRONTOS · CFG6
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Agenda de Jogos
          </h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] uppercase tracking-wide leading-relaxed">
            Consulte todas as datas, horários e locais dos jogos oficiais da temporada na Arena Vale.
          </p>
        </div>

        {/* LISTA DE JOGOS */}
        <div className="max-w-4xl mx-auto space-y-4">
          {jogos.map((jogo) => (
            <div key={jogo.id} className="rounded-3xl border border-white/15 bg-[#11141d] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group hover:border-[#e50914]/60 transition duration-300">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />

              <div className="space-y-2 text-center md:text-left z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">{jogo.campeonato}</span>
                <div className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  {jogo.equipeA} <span className="text-[#8a92a6] font-normal">vs</span> {jogo.equipeB}
                </div>
                <p className="text-xs text-[#8a92a6] uppercase">Local: {jogo.local}</p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 z-10">
                <div className="text-center">
                  <span className="text-[10px] text-[#8a92a6] uppercase block">Data</span>
                  <span className="text-xs font-bold text-white">{jogo.data}</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#8a92a6] uppercase block">Horário</span>
                  <span className="text-xs font-black text-[#ff4d4f]">{jogo.horario}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-8 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados.
      </footer>
    </div>
  );
}
