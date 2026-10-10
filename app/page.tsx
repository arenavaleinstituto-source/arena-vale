'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const listaJogos = [
  { status: 'AO VIVO', horario: 'HOJE · 19:30', time1: 'FÊNIX CLUB', time2: 'VALE UNITED' },
  { status: 'EM BREVE', horario: 'HOJE · 21:00', time1: 'ARENA FC', time2: 'BLUMENAU 7' },
  { status: 'AGENDADA', horario: 'AMANHÃ · 18:00', time1: 'ESTRELA AZUL', time2: 'LIONS SC' }
];

const noticias = [
  { titulo: 'LIGA REGIONAL DE FUTSAL', descricao: 'Confira a análise técnica da rodada e os melhores momentos.', categoria: 'GIRO DA ARENA', tag: 'ANÁLISE' },
  { titulo: 'SUPERCOPA VALE 2026', descricao: 'Grandes jogadas e os bastidores das semifinais eletrizantes.', categoria: 'PÓS-JOGO ARENA', tag: 'HIGHLIGHTS' },
  { titulo: 'FORMAÇÃO E NOVOS TALENTOS', descricao: 'Conheça os jovens que estão se destacando nas categorias de base.', categoria: 'ARENA BASE', tag: 'HISTÓRIAS' }
];

export default function HomePage() {
  const [menuPainelAberto, setMenuPainelAberto] = useState(false);

  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/proprietario" title="Acesso Seguro" className="flex items-center gap-2.5 transition hover:opacity-90">
              <img
                src="/logo.png"
                alt="Arena Vale Sports"
                className="h-11 w-auto max-w-[150px] object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="logo-fallback" style={{ display: 'none' }} className="items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner">
                  <span className="text-sm font-black text-white"><span className="text-[#e50914]">A</span>V</span>
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white whitespace-nowrap">
                  ARENA <span className="text-[#e50914]">VALE</span>
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden xl:flex items-center gap-5 text-[11px] font-bold uppercase tracking-wider text-[#a0a8be]">
            <Link href="#inicio" className="text-white hover:text-[#e50914] whitespace-nowrap transition">Início</Link>
            <Link href="#aovivo" className="flex items-center gap-1.5 text-white hover:text-[#e50914] whitespace-nowrap transition">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse shrink-0" /> Ao Vivo
            </Link>
            <Link href="#noticias" className="hover:text-white whitespace-nowrap transition">Notícias</Link>
            <Link href="#agenda" className="hover:text-white whitespace-nowrap transition">Agenda</Link>
            <Link href="#campeonatos" className="hover:text-white whitespace-nowrap transition">Campeonatos</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white whitespace-nowrap transition">Atletas Destaques</Link>
            <Link href="#projetosocial" className="hover:text-white whitespace-nowrap transition">Projeto Social</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] whitespace-nowrap">
              Anuncie
            </a>
            <div className="relative">
              <button type="button" onClick={() => setMenuPainelAberto(!menuPainelAberto)} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-[11px] font-bold text-[#a0a8be] transition hover:border-white/40 hover:text-white whitespace-nowrap">
                <span>Painel</span> <span className="text-[10px]">▾</span>
              </button>
              {menuPainelAberto && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-[#13161f] p-2 shadow-2xl backdrop-blur-xl z-50" onMouseLeave={() => setMenuPainelAberto(false)}>
                  <Link href="/coordenador" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e50914]/15 text-[#e50914]">🛡️</span>
                    <div><p className="font-black text-white">Coordenador</p><p className="text-[10px] text-[#8a92a6]">Gestão Operacional</p></div>
                  </Link>
                  <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">⚖️</span>
                    <div><p className="font-black text-white">Moderador</p><p className="text-[10px] text-[#8a92a6]">Torneios & Placares</p></div>
                  </Link>
                  <Link href="/login" onClick={() => setMenuPainelAberto(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#cad0e0] hover:bg-white/5 hover:text-white transition">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">⚽</span>
                    <div><p className="font-black text-white">Capitão</p><p className="text-[10px] text-[#8a92a6]">Equipes & Elencos</p></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[580px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          <img src="/foto-pro-site-1.png" alt="Arena Vale" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" /> COBERTURA & TRANSMISSÃO OFICIAL
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight">
              <span className="block whitespace-nowrap">
                O PALCO DO
              </span>
              <span className="block whitespace-nowrap mt-1 sm:mt-2">
                <span className="text-[#e50914]">ESPORTE</span> É AQUI.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora de quadra.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#aovivo" className="flex items-center gap-2 rounded-full bg-[#e50914] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105"><span>▶</span> ASSISTIR AO VIVO</a>
              <a href="#agenda" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40">VER A AGENDA →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="aovivo" className="border-t border-white/5 bg-[#10131a] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">TRANSMISSÕES OFICIAIS</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">ARENA VALE AO VIVO</h2></div>
            <a href="https://www.youtube.com/@TVArenaVale" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#e50914]">Canal no YouTube ↗</a>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#161a24] p-6 lg:col-span-2 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-3 py-1 text-xs font-black tracking-wider text-white">● AO VIVO AGORA</span>
                <span className="text-xs font-bold text-[#8a92a6]">COPA ARENA VALE 2026</span>
              </div>
              <div className="my-8 flex items-center justify-around text-center">
                <div className="flex-1"><b className="block text-2xl sm:text-4xl font-black">FÊNIX CLUB</b><span className="mt-1 block text-xs text-[#8a92a6]">MANDANTE</span></div>
                <div className="rounded-2xl border border-white/10 bg-[#0b0d12] px-6 py-3 text-2xl sm:text-4xl font-black text-[#e50914]">VS</div>
                <div className="flex-1"><b className="block text-2xl sm:text-4xl font-black">VALE UNITED</b><span className="mt-1 block text-xs text-[#8a92a6]">VISITANTE</span></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <span className="text-xs text-[#8a92a6]">📍 GINÁSIO PRINCIPAL · NARRAÇÃO EXCLUSIVA</span>
                <a href="https://www.youtube.com/shorts/sY8Dpv7KIho" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase text-white transition hover:bg-[#ff1e27]">ACESSAR TRANSMISSÃO</a>
              </div>
            </div>
            <div id="agenda" className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#161a24] p-6 shadow-xl">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-[#e50914]">RODADA DA SEMANA</h3>
                <p className="mt-1 text-xs text-[#8a92a6]">Acompanhe a escala de transmissões do ecossistema Arena Vale.</p>
                <div className="mt-5 space-y-3">
                  {listaJogos.map((g, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-[#0b0d12] p-3 text-xs">
                      <div className="flex justify-between text-[#8a92a6]"><span className="font-bold text-[#e50914]">{g.status}</span><span>{g.horario}</span></div>
                      <p className="mt-1.5 font-black text-white">{g.time1} x {g.time2}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="noticias" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8"><p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">AGORA NA ARENA</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">CONTEÚDO & COBERTURA</h2></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((h, i) => (
            <article key={i} className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl transition hover:border-[#e50914]/50">
              <div>
                <div className="flex items-center justify-between"><span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">{h.categoria}</span><span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-bold text-[#cad0e0]">{h.tag}</span></div>
                <h3 className="mt-4 text-xl font-black uppercase leading-tight text-white">{h.titulo}</h3>
                <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">{h.descricao}</p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4"><span className="text-xs font-bold text-white transition hover:text-[#e50914] cursor-pointer">Acompanhar cobertura →</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#10131a] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl">
            <img src="/foto-pro-site-1.png" alt="Atletas em Destaque" className="absolute inset-0 h-full w-full object-cover object-center brightness-60 transition duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/80 to-transparent sm:bg-gradient-to-r sm:from-[#0b0d12]/95 sm:via-[#0b0d12]/70 sm:to-transparent" />
            <div className="relative z-10 flex min-h-[380px] flex-col justify-end p-8 sm:min-h-[440px] sm:max-w-2xl sm:p-14">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#ff1e27] backdrop-blur-md">HISTÓRIAS DA ARENA</span>
              <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">CONHEÇA TODOS OS <br /><span className="text-[#e50914]">ATLETAS EM DESTAQUE</span></h3>
              <p className="mt-4 text-sm leading-relaxed text-[#cad0e0] sm:text-base">Os personagens, artilheiros, revelações e protagonistas que transformam cada partida em um grande espetáculo.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/coordenador/atletasdestaques" className="rounded-full bg-[#e50914] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105">GALERIA OFICIAL →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="campeonatos" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8"><p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">COMPETIÇÕES OFICIAIS</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">CAMPEONATOS REGIONAIS</h2></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[{ nome: 'Futsal Regional', fase: 'Fase de Grupos' }, { nome: 'Voleibol Vale Cup', fase: 'Oitavos de Final' }, { nome: 'Basquetebol Open', fase: 'Classificatórias' }, { nome: 'Futebol 7 Intermunicipal', fase: 'Semifinais' }].map((m, idx) => (
            <div key={idx} className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
              <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#e50914]">EM ANDAMENTO</span>
              <h3 className="mt-4 text-lg font-black uppercase text-white">{m.nome}</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">{m.fase}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="projetosocial" className="border-t border-white/5 bg-[#10131a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-[#161a24] p-8 sm:p-14 shadow-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">IMPACTO & INCLUSÃO</span>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight">PROJETO SOCIAL <br /><span className="text-[#e50914]">ARENA VALE</span></h2>
            <p className="mt-4 max-w-2xl text-base text-[#cad0e0] leading-relaxed">O desporto como ferramenta de transformação. Incentivo e suporte contínuo para jovens talentos das comunidades do Vale.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27]">💼 Apoiar o Projeto Social</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-14 shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">OPORTUNIDADE COMERCIAL</span>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight">COLOQUE SUA MARCA NO <br /><span className="text-[#e50914]">PALCO DO ESPORTE.</span></h2>
            <p className="mt-4 text-base text-[#cad0e0] leading-relaxed">A Arena Vale aproxima marcas de uma audiência que vive o esporte todos os dias. Presença antes, durante e depois do jogo através de transmissões, placar, melhores momentos e mídias digitais.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27]">💼 Falar com a Equipe Comercial</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row text-xs text-[#8a92a6]">
          <div>
            <span className="text-2xl font-black tracking-tight text-white">ARENA <span className="text-[#e50914]">VALE</span></span>
            <p className="text-xs font-semibold text-[#8a92a6] mt-1">O palco do esporte é aqui.</p>
          </div>
          <div className="flex flex-wrap gap-4 uppercase font-bold">
            <Link href="#aovivo" className="hover:text-white">Ao Vivo</Link>
            <Link href="#agenda" className="hover:text-white">Agenda</Link>
            <Link href="#campeonatos" className="hover:text-white">Campeonatos</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Atletas Destaques</Link>
            <Link href="#projetosocial" className="hover:text-white">Projeto Social</Link>
            <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="hover:text-white">Comercial</a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl pt-8 mt-8 border-t border-white/5 text-center text-[11px] text-[#555d6e]">
          © 2026 Arena Vale · Mídia Esportiva. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
