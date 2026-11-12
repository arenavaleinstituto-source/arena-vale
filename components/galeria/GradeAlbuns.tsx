import Link from 'next/link';
import { dataAlbum, textoFotos, type AlbumGaleria } from '@/lib/midia/galeria';

/** Cartão de um álbum: capa, título, data e número de fotos. */
export function CartaoAlbum({ album }: { album: AlbumGaleria }) {
  return (
    <Link href={`/galeria/${album.id}`} className="album">
      <span className="capa">
        {album.capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.capaUrl} alt="" loading="lazy" />
        ) : (
          <span className="sem-capa" aria-hidden="true">📷</span>
        )}
      </span>
      <span className="info">
        <strong>{album.titulo}</strong>
        <span className="meta">
          <span>{dataAlbum(album.data)}</span>
          <span>{textoFotos(album.totalFotos)}</span>
        </span>
      </span>
    </Link>
  );
}

/** Grade de álbuns da página /galeria. */
export function GradeAlbuns({ albuns }: { albuns: AlbumGaleria[] }) {
  if (albuns.length === 0) return <p className="vazio">Ainda não há fotos — volte depois dos próximos jogos.</p>;
  return (
    <div className="grade-albuns">
      {albuns.map((a) => (
        <CartaoAlbum key={a.id} album={a} />
      ))}
    </div>
  );
}
