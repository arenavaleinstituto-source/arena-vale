import type { Metadata } from 'next';
import Link from 'next/link';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { GradeAlbuns } from '@/components/galeria/GradeAlbuns';
import { buscarAlbuns } from '@/lib/midia/galeria-busca';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Galeria | ARENA VALE',
  description: 'Fotos dos jogos e eventos da ARENA VALE para ver, baixar e compartilhar.',
};

const POR_PAGINA = 24;

type Props = { searchParams: Promise<{ pagina?: string }> };

/** Galeria (spec Fase 4A, seção 4.5): álbuns ativos com foto, do mais novo ao mais antigo. */
export default async function GaleriaPage({ searchParams }: Props) {
  const pagina = Math.max(1, Math.floor(Number((await searchParams).pagina) || 1));
  const albuns = await buscarAlbuns(POR_PAGINA * pagina + 1, 1);
  const visiveis = albuns.slice(0, POR_PAGINA * pagina);
  const temMais = albuns.length > visiveis.length;
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Galeria" titulo="Fotos dos jogos" subtitulo="As imagens da Arena para ver, baixar e compartilhar." />
      <section className="faixa">
        <div className="dentro">
          <GradeAlbuns albuns={visiveis} />
          {temMais && (
            <div className="mais-albuns">
              <Link href={`/galeria?pagina=${pagina + 1}`} className="ver" scroll={false}>
                Ver mais
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
