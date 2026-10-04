// Landing pública (Server Component)
import { Nav } from '@/components/nav';
import { Shield } from '@/components/shield';
import {
  getAtletasDestaque,
  getCampeonatos,
  getJogos,
  getPatrocinadores,
} from '@/lib/supabase/queries';

export default async function HomePage() {
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

  const demoCampeonatos = [
    { nome: 'Taça Arena Vale 2026', times: '32 times · 78 jogos', status: 'em_andamento' },
    { nome: 'Copa Vale 2026', times: '16 times · 32 jogos', status: 'em_andamento' },
    { nome: 'Master Cup 2026', times: '12 times · 24 jogos', status: 'fase_grupos' },
    { nome: 'Arena Vale Sub-20', times: '10 times · 20 jogos', status: 'em_andamento' },
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
      <main>
        <section id="topo" className="hero relative overflow-hidden">
          <div className="hero-lines" />
          <div className="container relative z-10 py-24 md:py-32">
            <div className="grid lg:grid-cols-[1.08fr_.92fr] gap-14 items-center">
              <div>
                <div className="eyebrow"><span className="live-dot" /> Vale do Paraíba · Temporada 2026</div>
                <h1 className="hero-title">
                  A CASA DO<br />
                  <span className="accent">FUTEBOL</span> DO VALE.
                </h1>
                <p className="hero-copy">
                  Campeonatos, jogos ao vivo, resultados, estatísticas e os grandes talentos do futebol do Vale — tudo em um só lugar.
                </p>
                <div className="flex gap-3 flex-wrap mb-7">
                  <a href="#aovivo" className="btn-primary text-base px-7 py-3.5">▶ Acompanhar Ao Vivo</a>
                  <a href="#cadastro" className="btn-outline text-base px-7 py-3.5">Inscrever meu time</a>
                </div>
                <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-[var(--text-dim)]">
                  <span><strong className="text-[var(--text)]">{jogosAoVivo.length}</strong> jogos ao vivo</span>
                  <span><strong className="text-[var(--text)]">32</strong> times ativos</span>
                  <span><strong className="text-[var(--text)]">18k+</strong> visualizações</span>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-glow" />
                <div className="logo-orbit orbit-one" />
                <div className="logo-orbit orbit-two" />
                <div className="hero-logo"><Shield size={250} /></div>
                <div className="floating-card floating-card-top">
                  <span className="mini-live"><span className="live-dot" /> AO VIVO</span>
                  <strong>{jogosAoVivo[0]?.placar_casa ?? 2} <small>×</small> {jogosAoVivo[0]?.placar_visitante ?? 1}</strong>
                  <span>Vila Real FC · União FC</span>
                </div>
                <div className="floating-card floating-card-bottom">
                  <span>PLATAFORMA 2026</span>
                  <strong>78 <small>jogos</small></strong>
                  <em>↑ 7,3% nesta temporada</em>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-bottom-fade" />
        </section>

        <section id="campeonatos" className="section">
          <div className="container">
            <header className="section-head">
              <div>
                <span className="eyebrow">Em disputa</span>
                <h2 className="heading">Campeonatos <span className="accent">em andamento</span></h2>
                <p className="section-copy">Acompanhe a temporada e fique por dentro de cada rodada.</p>
              </div>
              <a href="#aovivo" className="btn-outline hidden sm:inline-flex">Ver jogos</a>
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {lista.slice(0, 4).map((c: any, i: number) => (
                <article key={i} className="champ-card group">
                  <div className="champ-number">0{i + 1}</div>
                  <div className="field-pattern" />
                  <div className="champ-content">
                    <span className="status-pill">{c.status === 'fase_grupos' ? 'FASE DE GRUPOS' : 'EM ANDAMENTO'}</span>
                    <h3>{c.nome}</h3>
                    <p>{c.times || '0 TIMES'}</p>
                    <span className="card-arrow">↗</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="aovivo" className="section live-section">
          <div className="container">
            <header className="section-head">
              <div>
                <span className="eyebrow live-eyebrow"><span className="live-dot" /> AO VIVO AGORA</span>
                <h2 className="heading">O jogo <span className="accent">acontece aqui.</span></h2>
                <p className="section-copy">Placar, tempo de jogo e audiência em tempo real.</p>
              </div>
              <a href="#aovivo" className="btn-primary hidden sm:inline-flex">▶ Ver todos</a>
            </header>
            <div className="grid md:grid-cols-3 gap-5">
              {jogosAoVivo.map((j: any, i: number) => (
                <article key={i} className="live-card">
                  <div className="live-card-top">
                    <span className="live-badge"><span className="live-dot" /> AO VIVO</span>
                    <span className="match-time">{['2º TEMPO · 65:23', '1º TEMPO · 32:10', '1º TEMPO · 15:45'][i]}</span>
                  </div>
                  <div className="teams">
                    <div className="team">
                      <div className="team-badge" style={{ background: j.time_casa.escudo_cor }}>{j.time_casa.sigla}</div>
                      <strong>{j.time_casa.nome}</strong>
                    </div>
                    <div className="score">
                      <b>{j.placar_casa}</b><span>×</span><b>{j.placar_visitante}</b>
                    </div>
                    <div className="team">
                      <div className="team-badge" style={{ background: j.time_visitante.escudo_cor }}>{j.time_visitante.sigla}</div>
                      <strong>{j.time_visitante.nome}</strong>
                    </div>
                  </div>
                  <div className="match-meta">
                    <span>📍 {['Estádio Municipal', 'Arena Vale', 'CT Vale'][i]}</span>
                    <span>👁 {[3842, 1503, 982][i].toLocaleString('pt-BR')}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="destaques" className="section">
          <div className="container">
            <header className="section-head">
              <div>
                <span className="eyebrow">Destaques do mês</span>
                <h2 className="heading">Atletas <span className="accent">em destaque</span></h2>
                <p className="section-copy">Os talentos que estão fazendo a diferença nos campos do Vale.</p>
              </div>
            </header>
            {destaques.length === 0 ? (
              <div className="empty-state">Nenhum atleta em destaque cadastrado.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {destaques.map((destaque: any) => (
                  <article key={destaque.id} className="athlete-card group">
                    <div className="athlete-photo">
                      <img src={destaque.foto_url} alt={destaque.atleta_nome} />
                      <div className="athlete-overlay" />
                      <span>DESTAQUE</span>
                    </div>
                    <div className="athlete-info">
                      <h3>{destaque.atleta_nome}</h3>
                      <p>{destaque.time_nome}</p>
                      <small>{destaque.campeonato_nome}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="patrocinadores" className="section sponsors-section">
          <div className="container">
            <header className="section-head">
              <div>
                <span className="eyebrow">Quem acredita</span>
                <h2 className="heading">Nossos <span className="accent">patrocinadores</span></h2>
              </div>
            </header>
            {patrocinadores.length === 0 ? (
              <div className="empty-state">Nenhum patrocinador cadastrado.</div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {patrocinadores.map((patrocinador: any) => (
                  <article key={patrocinador.id} className="sponsor-card">
                    <div className="sponsor-logo">
                      {patrocinador.logo_url ? (
                        <img src={patrocinador.logo_url} alt={patrocinador.nome} />
                      ) : (
                        <span>{patrocinador.logo_initials || patrocinador.nome.slice(0, 3)}</span>
                      )}
                    </div>
                    <div>
                      <h3>{patrocinador.nome}</h3>
                      {patrocinador.categoria && <p>{patrocinador.categoria}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="cadastro" className="signup-section">
          <div className="container">
            <div className="signup-box">
              <div className="signup-copy">
                <span className="eyebrow">Entre em campo</span>
                <h2 className="heading">Seu time merece<br /><span className="accent">estar na Arena.</span></h2>
                <p>Inscreva seu time ou cadastre seu campeonato. Nossa equipe entra em contato em até 24h.</p>
                <div className="signup-points"><span>✓ Gestão de campeonatos</span><span>✓ Placar em tempo real</span><span>✓ Visibilidade para atletas</span></div>
              </div>
              <form className="signup-form" action="/api/inscricoes" method="POST">
                <input type="text" name="nome" placeholder="Seu nome" required />
                <input type="email" name="email" placeholder="E-mail" required />
                <input type="tel" name="phone" placeholder="WhatsApp" required />
                <button type="submit" className="btn-primary text-base py-3.5">Quero participar →</button>
              </form>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer-inner">
            <div className="flex items-center gap-3"><Shield size={42} /><div><strong>ARENA <span>VALE</span></strong><small>SPORTS</small></div></div>
            <p>© 2026 Arena Vale Sports · Feito com 💙💛 no Vale do Paraíba</p>
          </div>
        </footer>
      </main>
    </>
  );
}
