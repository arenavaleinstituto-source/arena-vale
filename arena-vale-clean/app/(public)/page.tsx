// Landing pública (Server Component)
import { Nav } from '@/components/nav';
import { Shield } from '@/components/shield';
import { ShieldLarge } from '@/components/shield';
import { getCampeonatos, getJogos } from '@/lib/supabase/queries';

export default async function HomePage() {
  // Tenta carregar dados reais; se Supabase não estiver configurado ainda, fallback para demo
  let campeonatos: any[] = [];
  let jogos: any[] = [];
  try {
    [campeonatos, jogos] = await Promise.all([
      getCampeonatos().catch(() => []),
      getJogos({ status: 'ao_vivo' }).catch(() => []),
    ]);
  } catch {}

  // Demo data para quando ainda não há dados no DB
  const demoCampeonatos = [
    { nome: 'Taça Arena Vale 2026', times: '32 · 78', status: 'em_andamento' },
    { nome: 'Copa Vale 2026', times: '16 · 32', status: 'em_andamento' },
    { nome: 'Master Cup 2026', times: '12 · 24', status: 'fase_grupos' },
    { nome: 'Arena Vale Sub-20', times: '10 · 20', status: 'em_andamento' },
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
        <section id="topo" className="relative py-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="eyebrow">📍 Vale do Paraíba · SP · Temporada 2026</span>
                <h1 className="heading mb-6">
                  A CASA DO<br />
                  <span className="accent">FUTEBOL</span> DO VALE.
                </h1>
                <p className="text-lg text-[var(--text-dim)] max-w-md mb-9">
                  Plataforma completa de gestão de campeonatos de futebol. Acompanhe jogos ao vivo,
                  estatísticas em tempo real, classificação e tudo que o seu time precisa.
                </p>
                <div className="flex gap-3 flex-wrap mb-6">
                  <a href="#aovivo" className="btn-primary text-base px-7 py-3.5">▶ Acompanhar Ao Vivo</a>
                  <a href="#cadastro" className="btn-outline text-base px-7 py-3.5">Inscrever meu time</a>
                </div>
                <p className="text-sm text-[var(--text-dim)] flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--live)] animate-pulse" />
                  <strong className="text-[var(--text)]">{jogosAoVivo.length} jogos rolando agora</strong> · 1.245 usuários assistindo
                </p>
              </div>
              <div className="flex flex-col items-center gap-7">
                <Shield size={220} />
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {[
                    { label: 'Receita', value: 'R$ 24.780', trend: '↑ 16.6%' },
                    { label: 'Times', value: '32', trend: '↑ 12.5%' },
                    { label: 'Jogos', value: '78', trend: '↑ 7.3%' },
                    { label: 'Views', value: '18.432', trend: '↑ 15.2%' },
                  ].map(s => (
                    <div key={s.label} className="panel hover:border-[var(--primary)] transition-all">
                      <div className="text-[10px] tracking-widest text-[var(--text-mute)] uppercase font-bold">{s.label}</div>
                      <div className="font-serif text-2xl font-black mt-1">{s.value}</div>
                      <div className="text-xs text-[#5fdb95] mt-0.5">{s.trend}</div>
                    </div>
                  ))}
                </div>
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
                <div key={i} className="aspect-[3/4] rounded-[14px] relative overflow-hidden border border-white/10 hover:border-[var(--primary)] transition cursor-pointer"
                  style={{ background: `linear-gradient(135deg, var(--bg-alt) 0%, #08163a 100%)` }}>
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#08163a] to-transparent">
                    <div className="font-serif font-extrabold text-base mb-1">{c.nome}</div>
                    <div className="text-[11px] text-[var(--text-dim)] tracking-wider mb-2">{c.times || '0 TIMES'}</div>
                    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${c.status === 'fase_grupos' ? 'bg-[rgba(245,215,110,0.15)] text-[var(--primary)]' : 'bg-[rgba(95,219,149,0.15)] text-[#5fdb95]'}`}>
                      {c.status === 'fase_grupos' ? 'FASE DE GRUPOS' : 'EM ANDAMENTO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AO VIVO */}
        <section id="aovivo" className="py-24 bg-[rgba(16,42,94,0.45)]">
          <div className="container">
            <header className="flex justify-between items-end mb-12">
              <div>
                <span className="eyebrow animate-pulse-live">🔴 AO VIVO</span>
                <h2 className="heading">Rolando <span className="accent">agora</span></h2>
              </div>
              <a href="#" className="btn-primary">▶ Ver todos ao vivo</a>
            </header>
            <div className="grid md:grid-cols-3 gap-5">
              {jogosAoVivo.map((j: any, i: number) => (
                <div key={i} className="panel relative before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px] before:bg-gradient-to-r before:from-[var(--live)] before:to-transparent">
                  <div className="flex justify-between items-center mb-4 text-[11px]">
                    <span className="bg-[var(--live)] text-white font-extrabold px-2 py-0.5 rounded animate-blink">AO VIVO</span>
                    <span className="text-[var(--primary)] font-serif font-bold">{['2º TEMPO · 65:23', '1º TEMPO · 32:10', '1º TEMPO · 15:45'][i]}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-12 h-12 rounded-full grid place-items-center text-white font-extrabold text-sm" style={{ background: j.time_casa.escudo_cor }}>{j.time_casa.sigla}</div>
                      <strong className="text-sm">{j.time_casa.nome}</strong>
                    </div>
                    <div className="flex items-center gap-2 font-serif font-black text-4xl">
                      <span>{j.placar_casa}</span>
                      <span className="text-[var(--text-mute)] text-2xl font-normal">×</span>
                      <span>{j.placar_visitante}</span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <div className="w-12 h-12 rounded-full grid place-items-center text-white font-extrabold text-sm" style={{ background: j.time_visitante.escudo_cor }}>{j.time_visitante.sigla}</div>
                      <strong className="text-sm">{j.time_visitante.nome}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--text-mute)] pt-3 border-t border-white/5">
                    <span>📍 {['Estádio Municipal', 'Arena Vale', 'CT Vale'][i]}</span>
                    <span>👁 {[3842, 1503, 982][i]} assistindo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
