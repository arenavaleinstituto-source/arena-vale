export default function PublicPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-24 text-center">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Arena Vale Sports</p>
        <h1 className="heading mt-4">A CASA DO <span className="accent">FUTEBOL</span> DO VALE.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-[var(--text-dim)]">Acompanhe campeonatos, jogos, equipes e atletas do Vale do Paraíba.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/login?next=/coordenador" className="btn-primary">Coordenação</a>
          <a href="/moderador" className="btn-outline">Moderador</a>
          <a href="/capitao" className="btn-outline">Capitão</a>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-3">
          <div className="panel"><div className="text-4xl">🏆</div><h2 className="mt-4 font-serif text-xl font-bold">Campeonatos</h2><p className="mt-2 text-sm text-[var(--text-dim)]">Torneios e competições do Vale.</p></div>
          <div className="panel"><div className="text-4xl">⚽</div><h2 className="mt-4 font-serif text-xl font-bold">Jogos ao vivo</h2><p className="mt-2 text-sm text-[var(--text-dim)]">Resultados e agenda esportiva.</p></div>
          <div className="panel"><div className="text-4xl">⭐</div><h2 className="mt-4 font-serif text-xl font-bold">Atletas em destaque</h2><p className="mt-2 text-sm text-[var(--text-dim)]">Os talentos que brilham no Vale.</p></div>
        </div>
      </div>
    </main>
  );
}
