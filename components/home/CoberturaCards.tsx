const CARDS = [
  { titulo: 'Transmissões ao vivo', texto: 'Os jogos no canal TV Arena Vale, com aviso para não perder nenhuma partida.' },
  { titulo: 'Notícias do Vale', texto: 'Notícias, resultados e bastidores dos campeonatos da região.' },
  { titulo: 'Agenda dos jogos', texto: 'Jogos de hoje e dos próximos dias, com local, horário e fase.' },
  { titulo: 'Fotos dos jogos', texto: 'As melhores imagens da Arena para ver, baixar e compartilhar.' },
  { titulo: 'Atletas destaque', texto: 'Quem brilhou em quadra e no campo. O jogo não termina no placar.' },
  { titulo: 'Esporte mundial', texto: 'As notícias do esporte pelo mundo, selecionadas pela coordenação.' },
];

/** "O que você encontra aqui" — 6 cards explicativos do site. */
export function CoberturaCards() {
  return (
    <section className="faixa" id="cobertura" style={{ background: 'var(--papel)' }}>
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">O que você encontra aqui</span>
          <h2>Tudo do esporte do Vale <em className="accent">num lugar só.</em></h2>
          <p>Do apito inicial ao placar final, a ARENA VALE acompanha cada jogo.</p>
        </div>
        <div className="cobertura-grade">
          {CARDS.map((c) => (
            <article className="cobertura-cartao" key={c.titulo}>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
