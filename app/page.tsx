// Landing pública (Server Component)
import { Nav } from '@/components/nav';
import { Shield } from '@/components/shield';
import { ShieldLarge } from '@/components/shield';
import {
  getAtletasDestaque,
  getCampeonatos,
  getJogos,
  getPatrocinadores,
} from '@/lib/supabase/queries';


export default async function HomePage() {
  // Tenta carregar dados reais; se Supabase não estiver configurado ainda, fallback para demo
  let campeonatos: any[] = [];
  let jogos: any[] = [];
  let destaques: any[] = [];
  let patrocinadores: any[] = [];

  try {
    [campeonatos, jogos, destaques, patrocinadores] = await Promise.all([
  getCampeonatos().catch(() => []),
  getJogos({ status: 'ao_vivo' }).catch(() => []),
  getAtletasDestaque().catch(() => []),
  getPatrocinadores().catch(() => []),
]);

  } catch {}

  // Demo data para quando ainda não há dados no DB
  const sportImages = {
    hero: 'https://images.unsplash.com/photo-1545525201-e1a5a2a18293?auto=format&fit=crop&fm=jpg&q=85&w=1800',
    stadium: 'https://images.unsplash.com/photo-1762013315117-1c8005ad2b41?auto=format&fit=crop&fm=jpg&q=85&w=1200',
    crowd: 'https://images.unsplash.com/photo-1781152791898-945ca008c8ef?auto=format&fit=crop&fm=jpg&q=85&w=1200',
    team: 'https://images.unsplash.com/photo-1780766382589-5e517d4f0b81?auto=format&fit=crop&fm=jpg&q=85&w=1200',
  };

  const demoCampeonatos = [
    { nome: 'Taça Arena Vale 2026', times: '32 TIMES · 78 JOGOS', status: 'em_andamento', image: sportImages.hero },
    { nome: 'Copa Vale 2026', times: '16 TIMES · 32 JOGOS', status: 'em_andamento', image: sportImages.stadium },
    { nome: 'Master Cup 2026', times: '12 TIMES · 24 JOGOS', status: 'fase_grupos', image: sportImages.crowd },
    { nome: 'Arena Vale Sub-20', times: '10 TIMES · 20 JOGOS', status: 'em_andamento', image: sportImages.team },
  ];
  const demoJogos = [
    { id: '1', time_casa: { sigla: 'VR', nome: 'Vila Real FC', escudo_cor: '#a83232' }, time_visitante: { sigla: 'UF', nome: 'União FC', escudo_cor: '#1f7a3a' }, placar_casa: 2, placar_visitante: 1 },
    { id: '2', time_casa: { sigla: 'AM', nome: 'Amigos FC', escudo_cor: '#c9a338' }, time_visitante: { sigla: 'RF', nome: 'Resenha FC', escudo_cor: '#7a1f3f' }, placar_casa: 0, placar_visitante: 0 },
    { id: '3', time_casa: { sigla: 'MA', nome: 'Maria FC', escudo_cor: '#1e2d54' }, time_visitante: { sigla: 'AJ', nome: 'Atlético JV', escudo_cor: '#7a1f1f' }, placar_casa: 1, placar_visitante: 0 },
  ];

  const lista = campeonatos.length ? campeonatos : demoCampeonatos;
  const jogosAoVivo = jogos.length ? jogos : demoJogos;

  return (
    <>
      <Nav />
      <main className="pt-[78px]">
        {/* HERO */}
        <section id="topo" className="relative min-h-[680px] overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${sportImages.hero}")` }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,22,58,.98)_0%,rgba(8,22,58,.86)_42%,rgba(8,22,58,.34)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#08163a_0%,transparent_30%)]" />
          <div className="container relative z-10 py-24">
            <div className="max-w-3xl">
              <span className="eyebrow">📍 Vale do Paraíba · Temporada 2026</span>
              <h1 className="heading text-5xl md:text-7xl lg:text-[76px] mb-6 max-w-3xl">
                A CASA DO<br /><span className="accent">FUTEBOL</span> DO VALE.
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-dim)] max-w-2xl mb-9">
                Campeonatos, jogos ao vivo, classificação, atletas e tudo que movimenta o futebol do Vale — em um só lugar.
              </p>
              <div className="flex gap-3 flex-wrap mb-8">
                <a href="#aovivo" className="btn-primary text-base px-7 py-3.5">▶ Acompanhar Ao Vivo</a>
                <a href="#campeonatos" className="btn-outline text-base px-7 py-3.5 bg-black/20 backdrop-blur-sm">Ver campeonatos</a>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-dim)]">
                <span className="glass-chip">🔴 ${jogosAoVivo.length} jogos ao vivo</span>
                <span className="glass-chip">🏆 ${lista.length} campeonatos</span>
                <span className="glass-chip">⚽ Futebol do Vale</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0">
            <div className="container pb-5">
              <div className="hero-stats">
                <div><strong>32</strong><span>Times ativos</span></div>
                <div><strong>78</strong><span>Jogos na temporada</span></div>
                <div><strong>18.4K</strong><span>Visualizações</span></div>
                <div><strong>24/7</strong><span>Plataforma online</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* CAMPEONATOS */}
        <section id="campeonatos" className="py-24">
          <div className="container">
            <header className="flex justify-between items-end mb-12">
              <div>
                <span className="eyebrow">Em disputa</span>
                <h2 className="heading">Campeonatos <span className="accent">em andamento</span></h2>
              </div>
              <a href="#" className="btn-outline">Ver todos</a>
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {lista.slice(0, 4).map((c: any, i: number) => (
                <article key={i} className="sport-card group" style={{ backgroundImage: `url("${c.image || sportImages.hero}")` }}>
                  <div className="sport-card-overlay" />
                  <div className="sport-card-content">
                    <span className="sport-card-kicker">{c.status === 'fase_grupos' ? 'FASE DE GRUPOS' : 'EM ANDAMENTO'}</span>
                    <h3>{c.nome}</h3>
                    <p>{c.times || '0 TIMES'}</p>
                    <span className="sport-card-link">Ver campeonato →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AO VIVO */}
        <section id="aovivo" className="py-24 bg-[rgba(16,42,94,0.55)]">
          <div className="container">
            <header className="flex justify-between items-end gap-6 mb-10">
              <div>
                <span className="eyebrow animate-pulse-live">🔴 AO VIVO</span>
                <h2 className="heading">Rolando <span className="accent">agora</span></h2>
                <p className="text-[var(--text-dim)] mt-3">Acompanhe os principais jogos em tempo real.</p>
              </div>
              <a href="#campeonatos" className="btn-outline hidden sm:inline-flex">Ver campeonatos</a>
            </header>
            <div className="grid md:grid-cols-3 gap-5">
              {jogosAoVivo.map((j: any, i: number) => (
                <article key={i} className="panel live-card">
                  <div className="flex justify-between items-center mb-5 text-[11px]">
                    <span className="live-pill">AO VIVO</span>
                    <span className="text-[var(--primary)] font-serif font-bold">{['2º TEMPO · 65:23', '1º TEMPO · 32:10', '1º TEMPO · 15:45'][i]}</span>
                  </div>
                  <div className="match-row">
                    <div className="team">
                      <div className="team-badge" style={{ background: j.time_casa.escudo_cor }}>{j.time_casa.sigla}</div>
                      <strong>{j.time_casa.nome}</strong>
                    </div>
                    <div className="score"><span>{j.placar_casa}</span><b>×</b><span>{j.placar_visitante}</span></div>
                    <div className="team">
                      <div className="team-badge" style={{ background: j.time_visitante.escudo_cor }}>{j.time_visitante.sigla}</div>
                      <strong>{j.time_visitante.nome}</strong>
                    </div>
                  </div>
                  <div className="match-meta">
                    <span>📍 {['Estádio Municipal', 'Arena Vale', 'CT Vale'][i]}</span>
                    <span>👁 {[3842, 1503, 982][i]} assistindo</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        {/* ATLETAS EM DESTAQUE */}
<section id="destaques" className="py-24">
  <div className="container">
    <header className="mb-12">
      <span className="eyebrow">Destaques do mês</span>
      <h2 className="heading">
        Atletas <span className="accent">em destaque</span>
      </h2>
      <p className="text-[var(--text-dim)] mt-3">
        Os talentos que brilharam nas quadras, campos e arenas do Vale.
      </p>
    </header>

    {destaques.length === 0 ? (
      <p className="text-[var(--text-mute)]">
        Nenhum atleta em destaque cadastrado.
      </p>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destaques.map((destaque: any) => (
          <article key={destaque.id} className="panel overflow-hidden">
            <img
              src={destaque.foto_url}
              alt={destaque.atleta_nome}
              className="w-full h-64 object-cover rounded-xl"
            />

            <div className="pt-4">
              <span className="text-xs uppercase tracking-widest text-[var(--primary)]">
                Atleta em destaque
              </span>

              <h3 className="font-serif text-xl font-bold mt-2">
                {destaque.atleta_nome}
              </h3>

              <p className="text-sm text-[var(--text-dim)] mt-1">
                {destaque.time_nome}
              </p>

              <p className="text-xs text-[var(--text-mute)] mt-2">
                {destaque.campeonato_nome}
              </p>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</section>

{/* PATROCINADORES */}
<section id="patrocinadores" className="py-24 bg-[rgba(16,42,94,0.45)]">
  <div className="container">
    <header className="mb-12">
      <span className="eyebrow">Apoio</span>
      <h2 className="heading">
        Nossos <span className="accent">patrocinadores</span>
      </h2>
    </header>

    {patrocinadores.length === 0 ? (
      <p className="text-[var(--text-mute)]">
        Nenhum patrocinador cadastrado.
      </p>
    ) : (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {patrocinadores.map((patrocinador: any) => (
          <article key={patrocinador.id} className="panel text-center">
            <div className="h-28 grid place-items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              {patrocinador.logo_url ? (
                <img
                  src={patrocinador.logo_url}
                  alt={patrocinador.nome}
                  className="max-h-full max-w-full object-contain p-4"
                />
              ) : (
                <span className="font-serif text-xl font-bold text-[var(--primary)]">
                  {patrocinador.logo_initials ||
                    patrocinador.nome.slice(0, 3)}
                </span>
              )}
            </div>

            <h3 className="font-bold mt-4">
              {patrocinador.nome}
            </h3>

            {patrocinador.categoria && (
              <p className="text-xs text-[var(--text-mute)] mt-1">
                {patrocinador.categoria}
              </p>
            )}
          </article>
        ))}
      </div>
    )}
  </div>
</section>

        <section id="cadastro" className="py-24 bg-gradient-to-br from-[rgba(245,215,110,0.10)] via-transparent to-[rgba(120,160,255,0.08)] border-y border-[var(--primary)]/20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="eyebrow">Entre em campo</span>
                <h2 className="heading mb-3">Pronto para entrar na arena?</h2>
                <p className="text-[var(--text-dim)] text-base">
                  Inscreva seu time ou cadastre seu campeonato. Nossa equipe entra em contato em até 24h.
                </p>
              </div>
              <form className="grid grid-cols-2 gap-3" action="/api/inscricoes" method="POST">
                <input className="col-span-2 px-4 py-3.5 rounded-[10px] bg-[var(--surface)] border border-white/10 focus:border-[var(--primary)] outline-none" type="text" name="nome" placeholder="Seu nome" required />
                <input className="col-span-2 px-4 py-3.5 rounded-[10px] bg-[var(--surface)] border border-white/10 focus:border-[var(--primary)] outline-none" type="email" name="email" placeholder="E-mail" required />
                <input className="col-span-2 px-4 py-3.5 rounded-[10px] bg-[var(--surface)] border border-white/10 focus:border-[var(--primary)] outline-none" type="tel" name="phone" placeholder="WhatsApp" required />
                <button type="submit" className="btn-primary text-base py-3.5 col-span-2">Quero participar</button>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-[#08163a] border-t border-white/5 py-14">
          <div className="container text-center text-xs text-[var(--text-mute)]">
            © 2026 Arena Vale Sports · Feito com 💙💛 no Vale do Paraíba
          </div>
        </footer>
      </main>
    </>
  );
}
