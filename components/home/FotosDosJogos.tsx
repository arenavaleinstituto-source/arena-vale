import Link from 'next/link';
import { Fileira } from '@/components/midia/Fileira';
import { CartaoAlbum } from '@/components/galeria/GradeAlbuns';
import type { AlbumGaleria } from '@/lib/midia/galeria';

/** Home: fileira com os álbuns mais novos da galeria. Sem álbum, não aparece. */
export function FotosDosJogos({ albuns }: { albuns: AlbumGaleria[] }) {
  if (albuns.length === 0) return null;
  return (
    <section className="faixa alt" id="fotos">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Fotos dos jogos</h2>
            <p>As melhores imagens da Arena — baixe e compartilhe.</p>
          </div>
          <Link href="/galeria" className="ver">
            Ver galeria →
          </Link>
        </div>
        <Fileira rotulo="álbuns de fotos">
          {albuns.map((a) => (
            <CartaoAlbum key={a.id} album={a} />
          ))}
        </Fileira>
      </div>
    </section>
  );
}
