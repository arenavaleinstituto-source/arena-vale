'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const championships = [
    {
      nome: 'COPA ARENA VALE 2026',
      status: 'EM ANDAMENTO',
      descricao: 'Principal competição da temporada · Pontos corridos + Mata-mata',
      times: '16 EQUIPES',
      premiacao: 'R$ 15.000'
    },
    {
      nome: 'LIGA BLUMENAU DE FUTSAL',
      status: 'EM ANDAMENTO',
      descricao: 'Campeonato regional com 4 turnos classificatórios',
      times: '12 EQUIPES',
      premiacao: 'R$ 8.000'
    },
    {
      nome: 'SUPERCOPA VALE 2026',
      status: 'FASE FINAL',
      descricao: 'Torneio eliminatório dos campeões regionais',
      times: '8 EQUIPES',
      premiacao: 'R$ 10.000'
    },
    {
      nome: 'COPA VERÃO 2027',
      status: 'EM BREVE',
      descricao: 'Abertura oficial da temporada de verão · Inscrições abertas',
      times: '20 EQUIPES',
      premiacao: 'R$ 12.000'
    }
  ];

  const games = [
    {
      status: 'AO VIVO',
      horario: 'HOJE · 19:30',
      mandante: 'FÊNIX CLUB',
      visitante: 'VALE UNITED',
      detalhe: 'GINÁSIO PRINCIPAL · NARRAÇÃO AO VIVO'
    },
    {
      status: 'EM BREVE',
      horario: 'HOJE · 21:00',
      mandante: 'ARENA FC',
      visitante: 'BLUMENAU 7',
      detalhe: 'QUADRA 02 · COBERTURA COMPLETA'
    },
    {
      status: 'AGENDADA',
      horario: 'AMANHÃ · 18:00',
      mandante: 'ESTRELA AZUL',
      visitante: 'LIONS SC',
      detalhe: 'ARENA VALE · PRÉ-JOGO ÀS 17:30'
    }
  ];

  const news = [
    {
      categoria: 'GIRO DA ARENA',
      tag: 'ANÁLISE',
      titulo: 'SUPERCOPA VALE ENTRA NA FASE DECISIVA',
      descricao: 'Confira a análise tática dos confrontos e as equipes favoritas ao título desta edição.'
    },
    {
      categoria: 'PÓS-JOGO ARENA',
      tag: 'HIGHLIGHTS',
      titulo: 'MELHORES MOMENTOS: FÊNIX AVALIA CLÁSSICO',
      descricao: 'Gols, defesas e as entrevistas exclusivas com os técnicos logo após o apito final.'
    },
    {
      categoria: 'ARENA BASE',
      tag: 'HISTÓRIAS',
      titulo: 'NOVOS TALENTOS GANHAM O HOLOFOTE NO VALE',
      descricao: 'Conheça os jovens que estão se destacando nas categorias de formação e chamando atenção de clubes.'
    }
];

export default function HomePage() {
  return (
    <div id="topo" className="min-h-screen bg-[#0b0d12] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-base sm:text-lg font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-wider text-[#a0a8be] lg:flex">
            <Link href="#inicio" className="text-white transition hover:text-[#e50914]">
              Início
            </Link>
            <Link href="#aovivo" className="flex items-center gap-1.5 text-white transition hover:text-[#e50914]">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-pulse" />
              Ao Vivo
            </Link>
            <Link href="#noticias" className="transition hover:text-white">
              Notícias
            </Link>
            <Link href="#agenda" className="transition hover:text-white">
              Agenda
            </Link>
            <Link href="#campeonatos" className="transition hover:text-white">
              Campeonatos
            </Link>
            <Link href="/coordenador/atletasdestaques" className="transition hover:text-white">
              Atletas Destaques
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5547988444404"
              className="rounded-full bg-[#e50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-105"
            >
              Anuncie
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-[#a0a8be] transition hover:border-white/40 hover:text-white"
            >
              Painel
            </Link>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto max-w-7xl px-6 pt-8 pb-12">
        <div className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl flex flex-col justify-end p-8 sm:p-14">
          <img
            src="/foto-pro-site-1.png"
            alt="Arena Vale"
            className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/95 via-[#0b0d12]/40 to-transparent" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
              MÍDIA ESPORTIVA DIGITAL
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
              O PALCO DO <br />
              <span className="text-[#e50914]">ESPORTE É AQUI.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl text-[#cad0e0] leading-relaxed">
              Transmissões ao vivo, coberturas, análises e as grandes histórias de quem vive o jogo dentro e fora das quadras.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#aovivo"
                className="flex items-center gap-2 rounded-full bg-[#e50914] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105"
              >
                <span>▶</span> ASSISTIR AO VIVO
              </a>

              <a
                href="#agenda"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40"
              >
                VER A AGENDA →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="aovivo" className="border-t border-white/5 bg-[#10131a] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
                TRANSMISSÕES OFICIAIS
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                ARENA VALE AO VIVO
              </h2>
            </div>
            <a
              href="https://www.youtube.com/@TVArenaVale"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#e50914] hover:border-[#e50914]"
            >
              Canal no YouTube ↗
            </a>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#161a24] p-6 lg:col-span-2 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-3.5 py-1 text-xs font-black tracking-wider text-white">
                    ● AO VIVO AGORA
                  </span>
                  <span className="text-xs font-bold text-[#8a92a6]">COPA ARENA VALE 2026</span>
                </div>

                <div className="my-10 flex items-center justify-around text-center">
                  <div className="flex-1">
                    <b className="block text-2xl sm:text-4xl font-black">FÊNIX CLUB</b>
                    <span className="mt-1 block text-xs font-bold text-[#8a92a6]">MANDANTE</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b0d12] px-6 py-3 text-2xl sm:text-4xl font-black text-[#e50914]">
                    VS
                  </div>
                  <div className="flex-1">
                    <b className="block text-2xl sm:text-4xl font-black">VALE UNITED</b>
                    <span className="mt-1 block text-xs font-bold text-[#8a92a6]">VISITANTE</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <span className="text-xs text-[#8a92a6]">📍 GINÁSIO PRINCIPAL · NARRAÇÃO EXCLUSIVA</span>
                <a
                  href="https://www.youtube.com/shorts/sY8Dpv7KIho"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase text-white transition hover:bg-[#ff1e27]"
                >
                  ACESSAR TRANSMISSÃO
                </a>
              </div>
            </div>

            <div id="agenda" className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#161a24] p-6 shadow-xl">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-[#e50914]">
                  RODADA DA SEMANA
                </h3>
                <p className="mt-1 text-xs text-[#8a92a6]">
                  Acompanhe a escala de transmissões e coberturas oficiais.
                </p>
                <div className="mt-5 space-y-3">
                  {games.map((g, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-[#0b0d12] p-3 text-xs">
                      <div className="flex justify-between text-[#8a92a6]">
                        <span className="font-bold text-[#e50914]">{g.status}</span>
                        <span>{g.horario}</span>
                      </div>
                      <p className="mt-1.5 font-black text-white">{g.mandante} x {g.visitante}</p>
                      <span className="mt-1 block text-[10px] text-[#8a92a6]">{g.detalhe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="campeonatos" className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
              COMPETIÇÕES OFICIAIS
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              CAMPEONATOS EM DESTAQUE
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {championships.map((c, i) => (
            <article
              key={i}
              className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl transition hover:border-[#e50914]/50"
            >
              <div>
                <span className="rounded-full bg-[#e50914]/15 px-3 py-1 text-[10px] font-black uppercase text-[#e50914]">
                  {c.status}
                </span>
                <h3 className="mt-4 text-xl font-black uppercase leading-tight text-white">
                  {c.nome}
                </h3>
                <p className="mt-2 text-xs text-[#8a92a6] leading-relaxed">
                  {c.descricao}
                </p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4 text-xs font-bold text-[#cad0e0] flex justify-between">
                <span>{c.times}</span>
                <span className="text-[#e50914]">{c.premiacao}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="noticias" className="border-t border-white/5 bg-[#10131a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
              AGORA NA ARENA
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              NOTÍCIAS & ANÁLISES
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, i) => (
              <article
                key={i}
                className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl transition hover:border-[#e50914]/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                      {item.categoria}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-bold text-[#cad0e0]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-black uppercase leading-tight text-white">
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
                <div className="mt-6 border-t border-white/5 pt-4">
                  <span className="text-xs font-bold text-white transition hover:text-[#e50914] cursor-pointer">
                    Ler matéria completa →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#13161f] shadow-2xl">
            <img
              src="/foto-pro-site-1.png"
              alt="Atletas em Destaque"
              className="absolute inset-0 h-full w-full object-cover object-center brightness-60 transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/80 to-transparent sm:bg-gradient-to-r sm:from-[#0b0d12]/95 sm:via-[#0b0d12]/70 sm:to-transparent" />
            
            <div className="relative z-10 flex min-h-[380px] flex-col justify-end p-8 sm:min-h-[440px] sm:max-w-2xl sm:p-14">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#e50914]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#ff1e27] backdrop-blur-md">
                PROTAGONISTAS DO VALE
              </span>
              <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                CONHEÇA OS <br />
                <span className="text-[#e50914]">ATLETAS EM DESTAQUE</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#cad0e0] sm:text-base">
                Os personagens, artilheiros, revelações e atletas que fazem a história do esporte acontecer.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/coordenador/atletasdestaques"
                  className="rounded-full bg-[#e50914] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105"
                >
                  VER GALERIA COMPLETA →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-14 shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
              OPORTUNIDADE COMERCIAL
            </span>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight">
              COLOQUE SUA MARCA NO <br />
              <span className="text-[#e50914]">PALCO DO ESPORTE.</span>
            </h2>
            <p className="mt-4 text-base text-[#cad0e0] leading-relaxed">
              A Arena Vale aproxima marcas de uma comunidade apaixonada por esporte. Presença antes, durante e depois dos jogos através de transmissões ao vivo, placar, melhores momentos e mídias digitais.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5547988444404"
                className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27]"
              >
                💼 Falar com a Equipe Comercial
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="text-2xl font-black tracking-tight text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
            <p className="text-xs font-semibold text-[#8a92a6] mt-1">
              O palco do esporte é aqui.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-wider text-[#8a92a6]">
            <Link href="#aovivo" className="hover:text-white">Ao Vivo</Link>
            <Link href="#campeonatos" className="hover:text-white">Campeonatos</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Atletas Destaques</Link>
            <a href="https://wa.me/5547988444404" className="hover:text-white">Anuncie</a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl pt-8 mt-8 border-t border-white/5 text-center text-[11px] text-[#555d6e]">
          © 2026 Arena Vale · Mídia Esportiva. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
