import { Cartaz } from './Cartaz';
import { CATEGORIAS_MIDIA, ehNova, modoReproducao, type NoticiaMidia } from '@/lib/midia/noticias';

/** Cartaz 2:3 de uma notícia: capa limpa (a fonte aparece dentro da notícia), NOVO nas primeiras 48 h e ▶ nos vídeos. */
export function CartazNoticia({ n }: { n: NoticiaMidia }) {
  const video = modoReproducao(n).tipo !== 'foto';
  const categoria = CATEGORIAS_MIDIA.find((c) => c.valor === n.categoria)?.rotulo;
  return (
    <Cartaz
      href={`/noticias/${n.id}`}
      titulo={n.titulo}
      imagem={n.imagem_url}
      enquadramento={n.enquadramento}
      video={video}
      cabecalho={video ? { confronto: n.confronto ?? null } : undefined}
      novo={ehNova(n.publicado_em, new Date())}
      chapeu={n.categoria === 'geral' ? undefined : categoria}
    />
  );
}
