import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { CartoesModalidades } from '@/components/home/Modalidades';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Modalidades | ARENA VALE',
  description: 'Futsal, Futebol 7, Basquete, Vôlei e mais: campeonatos, agenda e notícias de cada esporte.',
};

/** Página Modalidades (spec Fase 3, seção 8): os cartões das modalidades cadastradas. */
export default async function ModalidadesPage() {
  const lista = await buscarModalidades();
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Esportes" titulo="Modalidades" subtitulo="Campeonatos, agenda e notícias de cada esporte." />
      <section className="faixa">
        <div className="dentro">
          <CartoesModalidades lista={lista} />
        </div>
      </section>
    </main>
  );
}
