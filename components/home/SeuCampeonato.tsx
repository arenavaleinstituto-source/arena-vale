import Link from 'next/link';

const RECURSOS = [
  'Página própria do campeonato',
  'Tabela de classificação automática',
  'Agenda e resultados dos jogos',
  'Súmula online de cada partida',
  'Elenco das equipes com fotos',
  'Notícias e divulgação no portal',
];

/** Faixa "Alugue o site para o seu campeonato": oferta para organizadores de campeonatos da região. */
export function SeuCampeonato({ whatsapp, alt = false }: { whatsapp: string; alt?: boolean }) {
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero colocar o meu campeonato no site da ARENA VALE.')}`;
  return (
    <section className={`faixa${alt ? ' alt' : ''}`} id="seu-campeonato">
      <div className="dentro">
        <div className="seu-camp">
          <div className="seu-camp-txt">
            <span className="chapeu">Para organizadores</span>
            <h2>
              Seu campeonato com cara de <em>liga profissional.</em>
            </h2>
            <p>
              Alugue a estrutura do site da ARENA VALE para o seu campeonato: tudo organizado num só lugar, com a vitrine do palco do esporte da região.
            </p>
            <div className="botoes">
              <a href={link} className="av-btn forte" target="_blank" rel="noopener noreferrer">
                Quero meu campeonato no site
              </a>
              <Link href="/modalidades" className="av-btn leve">
                Ver como fica
              </Link>
            </div>
          </div>
          <ul className="seu-camp-lista">
            {RECURSOS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
