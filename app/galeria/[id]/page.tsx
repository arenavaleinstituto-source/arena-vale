import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { FotosDoAlbum } from '@/components/galeria/FotosDoAlbum';
import { buscarAlbum } from '@/lib/midia/galeria-busca';
import { dataAlbum, textoFotos } from '@/lib/midia/galeria';

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await buscarAlbum((await params).id);
  if (!r) return { title: 'Galeria | ARENA VALE' };
  return {
    title: `${r.album.titulo} — Fotos | ARENA VALE`,
    description: `${textoFotos(r.fotos.length)} de ${r.album.titulo} (${dataAlbum(r.album.data)}) na ARENA VALE.`,
    openGraph: r.album.capaUrl ? { images: [r.album.capaUrl] } : undefined,
  };
}

/** Álbum da galeria: miniaturas e visualizador em tela cheia. Escondido ou inexistente → 404. */
export default async function AlbumPage({ params }: Props) {
  const r = await buscarAlbum((await params).id);
  if (!r) notFound();
  const { album, fotos } = r;
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Galeria" titulo={album.titulo} subtitulo={`${dataAlbum(album.data)} · ${textoFotos(fotos.length)}`}>
        <div className="links-album">
          <Link href="/galeria" className="ver">
            ← Todos os álbuns
          </Link>
          {album.jogoRef && (
            <Link href="/agenda" className="ver">
              Agenda da Arena →
            </Link>
          )}
        </div>
      </TopoPagina>
      <section className="faixa">
        <div className="dentro">
          <FotosDoAlbum fotos={fotos} />
        </div>
      </section>
    </main>
  );
}
