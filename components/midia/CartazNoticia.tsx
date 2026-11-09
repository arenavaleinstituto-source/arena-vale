import { Cartaz } from './Cartaz';
import { CATEGORIAS_MIDIA, ehNova, modoReproducao, type NoticiaMidia } from '@/lib/midia/noticias';

/** Cartaz 2:3 de uma notícia: selo VÍDEO/FOTO, NOVO nas primeiras 48 h e a fonte no Esporte Mundial. */
export function CartazNoticia({ n }: { n: NoticiaMidia }) {
  const video = modoReproducao(n).tipo !== 'foto';
  const categoria = CATEGORIAS_MIDIA.find((c) => c.valor === n.categoria)?.rotulo;
  return (
    <Cartaz
      href={`/noticias/${n.id}`}
      titulo={n.titulo}
      imagem={n.imagem_url}
      enquadramento={n.enquadramento}
      selo={video ? 'Vídeo' : 'Foto'}
      video={video}
      novo={ehNova(n.publicado_em, new Date())}
      chapeu={n.categoria === 'geral' ? undefined : categoria}
      fonte={n.aba === 'mundo' ? n.fonte : null}
    />
  );
}
