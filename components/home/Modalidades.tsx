import Link from 'next/link';
import { MODALIDADES_SITE } from '@/lib/midia/modalidades';

/** Os 4 cartões de modalidade. */
export function CartoesModalidades() {
  return (
    <div className="mods">
      {MODALIDADES_SITE.map((m) => (
        <Link key={m.slug} href={`/modalidades/${m.slug}`} className="mod-c">
          <h3>{m.nome}</h3>
          <span>{m.frase}</span>
        </Link>
      ))}
    </div>
  );
}

export function Modalidades() {
  return (
    <section className="faixa alt" id="modalidades">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Modalidades</h2>
            <p>Campeonatos, agenda e notícias de cada esporte.</p>
          </div>
        </div>
        <CartoesModalidades />
      </div>
    </section>
  );
}
