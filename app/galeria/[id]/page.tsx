import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FotosDoAlbum } from '@/components/galeria/FotosDoAlbum';
import { buscarAlbum } from '@/lib/midia/galeria-busca';
import { dataAlbum, textoFotos } from '@/lib/midia/galeria';

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await buscarAlbum((await params).id);
  if (!r) return { title: 'Galeria | ARENA VALE' };
  const partes = [r.album.competicao, r.album.placar, dataAlbum(r.album.data)].filter(Boolean).join(' · ');
  return {
    title: `${r.album.titulo} — Fotos | ARENA VALE`,
    description: r.album.descricao ?? `${textoFotos(r.fotos.length)} de ${r.album.titulo} (${partes}) na ARENA VALE.`,
    openGraph: r.album.capaUrl ? { images: [r.album.capaUrl] } : undefined,
  };
}

/** Álbum da galeria: detalhes do jogo/evento, miniaturas e visualizador. Escondido ou inexistente → 404. */
export default async function AlbumPage({ params }: Props) {
  const r = await buscarAlbum((await params).id);
  if (!r) notFound();
  const { album, fotos } = r;
  const linhaInfo = [dataAlbum(album.data), album.local, textoFotos(fotos.length)].filter(Boolean).join(' · ');
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <section className="topo-pagina topo-album">
        <div className="dentro">
          <span className="chapeu">{album.competicao || 'Galeria'}</span>
          <h1>{album.titulo}</h1>
          {album.placar && <p className="placar-album">{album.placar}</p>}
          <p>{linhaInfo}</p>
          {album.descricao && <p className="descricao-album">{album.descricao}</p>}
          {album.fotografo && <p className="credito-album">Fotos: {album.fotografo}</p>}
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
        </div>
      </section>
      <section className="faixa">
        <div className="dentro">
          <FotosDoAlbum fotos={fotos} />
        </div>
      </section>
    </main>
  );
}
