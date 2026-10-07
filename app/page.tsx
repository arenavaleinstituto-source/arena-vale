const championships = [
  ['🏆', 'EM ANDAMENTO', 'COPA ARENA VALE 2026', 'PRINCIPAL COMPETIÇÃO DA TEMPORADA · PONTOS CORRIDOS + MATA-MATA', '12', '66', 'R$ 15k', 'FASE DE GRUPOS', '62%', '12/03/2026', '20/12/2026'],
  ['⚽', 'EM ANDAMENTO', 'LIGA BLUMENAU 2026', 'CAMPEONATO REGIONAL DE PONTOS CORRIDOS · 4 TURNOS', '10', '90', 'R$ 8k', 'TURNO 2', '45%', '05/02/2026', '30/11/2026'],
  ['🥇', 'FASE DE GRUPOS', 'SUPERCOPA VALE 2026', 'TORNEIO ELIMINATÓRIO DOS CAMPEÕES REGIONAIS', '8', '15', 'R$ 20k', 'GRUPOS', '80%', '22/04/2026', '15/11/2026'],
  ['🌟', 'INSCRIÇÕES ABERTAS', 'TORNEIO DE INVERNO 2026', 'CATEGORIA SUB-17 E SUB-15 · FORMATO ELIMINATÓRIO EM JOGO ÚNICO', '16', '—', 'R$ 5k', 'INSCRIÇÕES', '12/16', '15/07/2026', '30/09/2026'],
  ['🔥', 'EM BREVE', 'COPA VERÃO 2027', 'ABERTURA DA TEMPORADA 2027 · PRÉ-INSCRIÇÃO EM DEZEMBRO', '16', '—', 'R$ 12k', 'AGUARDANDO', '0%', '10/01/2027', '20/03/2027'],
  ['🏅', 'FINALIZADO', 'COPA INAUGURAÇÃO 2025', 'TORNEIO DE ABERTURA DA ARENA VALE · CAMPEÃO: FÊNIX CLUB', '8', '14', 'R$ 6k', 'ENCERRADO', '100%', '15/08/2025', '12/12/2025']
];

const games = [
  ['PRÓXIMA', 'HOJE · 19:30', 'FÊNIX CLUB', 'VALE UNITED', 'QUADRA 01'],
  ['PRÓXIMA', 'HOJE · 20:30', 'ARENA FC', 'BLUMENAU 7', 'QUADRA 02'],
  ['AGENDADA', 'AMANHÃ · 18:00', 'ESTRELA AZUL', 'LIONS SC', 'QUADRA 01']
];

export default function PublicPage() {
  return (
    <main id="topo" className="min-h-screen bg-[#0a1830] text-white">
      {/* Cabeçalho */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
        <a href="#topo" className="flex items-center gap-4">
          <img 
            src="https://dhu8izvlu5fgy.space.minimax.io/logo-header.png" 
            alt="Arena Vale Sports" 
            className="h-12 w-auto sm:h-16 object-contain"
          />
          <span className="font-black tracking-[.08em] text-2xl sm:text-4xl leading-tight text-white whitespace-nowrap">
            COMPLEXO ESPORTIVO ARENA VALE
          </span>
        </a>
        <div className="flex gap-2 text-xs font-bold">
          <a href="/login" className="rounded-full bg-[#d4a849] px-6 py-3 text-[#0a1530] transition hover:opacity-90">
            PAINEL
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto min-h-[590px] max-w-7xl overflow-hidden rounded-[2rem] px-6 py-28 lg:px-14">
        <img 
          src="/foto-pro-site-1.png" 
          alt="Atletas Arena Vale" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/75 to-[#071426]/25" />
        <div className="relative max-w-2xl">
          <h1 className="font-extrabold uppercase leading-tight tracking-tight text-3xl md:text-5xl lg:text-6xl">
  <span className="block text-[#D4A346]">ALÉM DO PLACAR,</span>
  <span className="block text-white">CONTAMOS HISTÓRIAS!</span>
</h1>
          <p className="mt-7 max-w-xl text-lg text-[#a8b4cc]">
            Acompanhe partidas, equipas e campeonatos com informação, emoção e a identidade oficial da Arena Vale Sports.
          </p>
        </div>
      </section>

      {/* Atletas em Destaque - Card Único */}
      <section className="bg-[#0c1f4a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">DESTAQUES DO MÊS</p>
          <h2 className="mt-3 text-4xl font-black uppercase text-white">ATLETAS EM DESTAQUE</h2>
          <p className="mt-2 text-[#a8b4cc]">OS TALENTOS QUE BRILHARAM NAS QUADRAS, CAMPOS E ARENAS DO VALE</p>

          <div className="relative mt-10 overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#071426] shadow-2xl">
            <img
              src="/foto-pro-site-1.png"
              alt="Atletas em Destaque Arena Vale"
              className="absolute inset-0 h-full w-full object-cover object-center brightness-90 transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-[#071426]/75 to-transparent sm:bg-gradient-to-r sm:from-[#071426]/95 sm:via-[#071426]/70 sm:to-transparent" />
            <div className="relative z-10 flex min-h-[380px] flex-col justify-end p-8 sm:min-h-[440px] sm:max-w-2xl sm:p-14">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#d4a849]/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#d4a849] backdrop-blur-md">
                ⭐ GALERIA OFICIAL
              </span>
              <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                CONHEÇA TODOS OS <br />
                <span className="text-[#d4a849]">ATLETAS DESTAQUE</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#cad5ea] sm:text-base">
                Acompanhe as revelações, artilheiros, melhores em campo e os grandes talentos que fazem a história da Arena Vale Sports.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/coordenador/atletasdestaques"
                  className="rounded-full bg-[#d4a849] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-[#071426] shadow-lg transition hover:bg-[#e0b75a] hover:scale-105"
                >
                  Ver Todos os Destaques →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores Rápidos */}
      <section className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-6 py-14 text-center">
        <div>
          <b className="text-5xl text-[#d4a849]">03</b>
          <p className="mt-2 text-xs font-bold tracking-[.2em] text-[#a8b4cc]">JOGOS HOJE</p>
        </div>
        <div>
          <b className="text-5xl text-[#d4a849]">12</b>
          <p className="mt-2 text-xs font-bold tracking-[.2em] text-[#a8b4cc]">EQUIPAS ATIVAS</p>
        </div>
        <div>
          <b className="text-5xl text-[#d4a849]">184</b>
          <p className="mt-2 text-xs font-bold tracking-[.2em] text-[#a8b4cc]">ATLETAS</p>
        </div>
      </section>

      {/* Campeonatos */}
      <section id="torneios" className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">CAMPEONATOS</p>
            <h2 className="mt-3 text-4xl font-black uppercase">TORNEIOS EM DISPUTA</h2>
          </div>
          <a href="#torneios" className="hidden rounded-full border border-[#d4a849] px-4 py-2 text-sm text-[#d4a849] md:block">
            VER TODOS &gt;
          </a>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {championships.map(c => (
            <article key={c[2]} className="rounded-3xl border border-white/10 bg-[#0e2148] p-6">
              <div className="flex justify-between">
                <span className="text-3xl">{c[0]}</span>
                <span className="text-xs font-bold text-[#d4a849]">{c[1]}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black">{c[2]}</h3>
              <p className="mt-2 min-h-10 text-sm text-[#a8b4cc]">{c[3]}</p>
              <div className="mt-6 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
                <span><b className="block text-2xl">{c[4]}</b><small>EQUIPAS</small></span>
                <span><b className="block text-2xl">{c[5]}</b><small>JOGOS</small></span>
                <span><b className="block text-2xl text-[#d4a849]">{c[6]}</b><small>PREMIAÇÃO</small></span>
              </div>
              <div className="mt-4 flex justify-between text-xs text-[#a8b4cc]">
                <span>{c[7]} · {c[8]}</span>
                <span>{c[9]} — {c[10]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Agenda Desportiva */}
      <section id="agenda" className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">AGENDA DESPORTIVA</p>
            <h2 className="mt-3 text-4xl font-black uppercase">PRÓXIMAS PARTIDAS</h2>
          </div>
          <a href="#agenda" className="rounded-full border border-[#d4a849] px-4 py-2 text-sm text-[#d4a849]">
            VER TODAS &gt;
          </a>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {games.map(g => (
            <article key={g[2]} className="rounded-3xl border border-white/10 bg-[#0e2148] p-6">
              <span className="text-xs font-bold text-[#d4a849]">{g[0]}</span>
              <p className="mt-3 text-sm text-[#a8b4cc]">{g[1]}</p>
              <div className="mt-5 flex items-center justify-between text-center">
                <b>{g[2]}<small className="mt-1 block text-xs text-[#a8b4cc]">MANDANTE</small></b>
                <span className="text-[#d4a849]">VS</span>
                <b>{g[3]}<small className="mt-1 block text-xs text-[#a8b4cc]">VISITANTE</small></b>
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-sm text-[#a8b4cc]">📍 {g[4]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Apresentação da Aplicação Oficial */}
      <section className="bg-[#0c1f4a] px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="max-w-xl">
            <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">APLICAÇÃO OFICIAL</p>
            <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
              LEVE A ARENA VALE NO SEU BOLSO
            </h2>
            <p className="mt-5 text-lg text-[#a8b4cc]">
              Acompanhe torneios, resultados em tempo real, fichas técnicas de atletas e toda a emoção das quadras diretamente no seu smartphone.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="rounded-full bg-[#d4a849] px-6 py-3 font-bold text-[#0a1530]">
                Disponível em breve
              </span>
            </div>
          </div>
          <div className="w-full max-w-xs sm:max-w-sm">
            <img 
              src="/imagem-app-mockup.jpg" 
              alt="Aplicação Móvel Arena Vale Sports" 
              className="w-full h-auto rounded-[2.5rem] shadow-2xl border border-white/15"
            />
          </div>
        </div>
      </section>

      {/* Patrocinadores */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">PATROCINADORES</p>
        <h2 className="mt-3 text-4xl font-black uppercase">QUEM APOIA O ARENA VALE SPORTS</h2>
        <p className="mt-3 text-[#a8b4cc]">EMPRESAS E ENTIDADES QUE TORNAM O DESPORTO DO VALE POSSÍVEL</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white p-5 text-center text-[#0a1830]">
            <b className="text-2xl">AC</b>
            <small className="mt-2 block">ACADESF</small>
          </div>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="rounded-2xl border border-dashed border-[#a8b4cc] p-5 text-center text-[#a8b4cc]">
              <b className="text-2xl">+</b>
              <small className="mt-2 block">Espaço disponível</small>
            </div>
          ))}
        </div>
        <a href="https://wa.me/5547988444404" className="mt-8 inline-block text-[#d4a849]">
          💼 Quer ser patrocinador? Entre em contacto pelo WhatsApp (47) 9 8844-4404
        </a>
      </section>

      {/* TV Arena Vale */}
      <section className="bg-[#0c1f4a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold tracking-[.25em] text-[#d4a849]">TV ARENA VALE</p>
          <h2 className="mt-3 text-4xl font-black uppercase">VÍDEOS RECENTES E TRANSMISSÕES</h2>
          <p className="mt-3 max-w-2xl text-[#a8b4cc]">
            ACOMPANHE OS MELHORES MOMENTOS, ENTREVISTAS E AS PARTIDAS TRANSMITIDAS PELA ARENA VALE SPORTS
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://www.youtube.com/shorts/sY8Dpv7KIho" className="rounded-full bg-[#d4a849] px-6 py-4 font-bold text-[#0a1530]">
              TRANSMISSÃO AO VIVO
            </a>
            <a href="https://www.youtube.com/@TVArenaVale" className="rounded-full border border-[#a8b4cc] px-6 py-4 font-bold">
              VER CANAL
            </a>
          </div>
          <p className="mt-8 text-sm text-[#d4a849]">
            📺 VÍDEO EM DESTAQUE: YOUTUBE.COM/SHORTS/SY8Dpv7KIho · O COORDENADOR PODE TROCAR ESTE VÍDEO A QUALQUER MOMENTO PELO PAINEL.
          </p>
          <div className="mt-12 rounded-3xl border border-white/10 bg-[#0a1830] p-8">
            <p className="font-bold tracking-[.2em]">CHAT DA TRANSMISSÃO</p>
            <h3 className="mt-2 text-2xl font-black uppercase">COMENTE COM A TORCIDA</h3>
            <p className="mt-4 text-[#a8b4cc]">0 MENSAGENS · 4 ESPECTADORES · ATUALIZAÇÃO AO VIVO</p>
            <p className="mt-5 text-[#a8b4cc]">SEJA O PRIMEIRO A COMENTAR DURANTE A TRANSMISSÃO.</p>
            <button className="mt-5 rounded-full bg-[#d4a849] px-6 py-3 font-bold text-[#0a1530]">
              ENVIAR
            </button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-black">ALÉM DO PLACAR, CONTAMOS HISTÓRIAS!</h2>
        <p className="mt-3 text-[#a8b4cc]">BLUMENAU · SANTA CATARINA</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/5547988444404" className="rounded-full bg-[#25d366] px-4 py-3 font-bold">
            Fale connosco no WhatsApp
          </a>
          <a href="https://www.youtube.com/@TVArenaVale" className="rounded-full bg-[#f00] px-4 py-3 font-bold">
            Canal TV Arena Vale
          </a>
          <a href="/login" className="rounded-full border border-[#a8b4cc] px-4 py-3">
            PORTAL
          </a>
        </div>
        <p className="mt-10 text-xs text-[#a8b4cc]">Created by MiniMax Agent</p>
      </footer>
    </main>
  );
}
