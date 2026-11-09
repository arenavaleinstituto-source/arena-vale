import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { CartoesModalidades } from '@/components/home/Modalidades';

export const metadata: Metadata = {
  title: 'Modalidades | ARENA VALE',
  description: 'Futsal, Futebol 7, Basquete e Vôlei: campeonatos, agenda e notícias de cada esporte.',
};

/** Página Modalidades (spec Fase 3, seção 8): os 4 cartões. */
export default function ModalidadesPage() {
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Esportes" titulo="Modalidades" subtitulo="Campeonatos, agenda e notícias de cada esporte." />
      <section className="faixa">
        <div className="dentro">
          <CartoesModalidades />
        </div>
      </section>
    </main>
  );
}
