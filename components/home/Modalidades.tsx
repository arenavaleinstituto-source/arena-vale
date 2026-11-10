import Link from 'next/link';
import type { Modalidade } from '@/lib/midia/modalidades';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';

/** Os cartões de modalidade (as cadastradas pela coordenação). */
export function CartoesModalidades({ lista }: { lista: Modalidade[] }) {
  return (
    <div className="mods">
      {lista.map((m) => (
        <Link key={m.slug} href={`/modalidades/${m.slug}`} className="mod-c">
          <h3>{m.nome}</h3>
          <span>{m.frase}</span>
        </Link>
      ))}
    </div>
  );
}

export async function Modalidades() {
  const lista = await buscarModalidades();
  return (
    <section className="faixa alt" id="modalidades">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Modalidades</h2>
            <p>Campeonatos, agenda e notícias de cada esporte.</p>
          </div>
        </div>
        <CartoesModalidades lista={lista} />
      </div>
    </section>
  );
}
