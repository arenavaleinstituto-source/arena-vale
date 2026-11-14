import Link from 'next/link';
import type { Modalidade } from '@/lib/midia/modalidades';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';
import { ModalidadesOrbita } from './ModalidadesOrbita';

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
    <section className="faixa" id="modalidades" style={{ background: 'var(--grafite)' }}>
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Modalidades</span>
          <h2>Todo esporte tem <em className="accent">seu palco.</em></h2>
          <p>Campeonatos, agenda e notícias de cada esporte, do campo à quadra.</p>
        </div>
        <ModalidadesOrbita lista={lista} />
      </div>
    </section>
  );
}
