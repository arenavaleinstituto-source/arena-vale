/** Galeria de fotos (spec Fase 4A, seção 4): tipos e conversões puras. */

export type AlbumGaleria = {
  id: string;
  titulo: string;
  /** AAAA-MM-DD */
  data: string;
  origem: 'jogos' | 'agenda' | null;
  jogoRef: string | null;
  capaUrl: string | null;
  ativo: boolean;
  totalFotos: number;
};

export type FotoGaleria = {
  id: string;
  albumId: string;
  url: string;
  miniaturaUrl: string;
  largura: number;
  altura: number;
};

export type LinhaAlbum = {
  id: string;
  titulo: string;
  data: string;
  origem: string | null;
  jogo_ref: string | null;
  capa_url: string | null;
  ativo: boolean;
  galeria_fotos?: { count: number }[] | null;
};

export type LinhaFoto = {
  id: string;
  album_id: string;
  url: string;
  miniatura_url: string;
  largura: number;
  altura: number;
};

export const SELECT_ALBUM = 'id,titulo,data,origem,jogo_ref,capa_url,ativo,galeria_fotos(count)';
export const SELECT_FOTO = 'id,album_id,url,miniatura_url,largura,altura';

export function deAlbum(l: LinhaAlbum): AlbumGaleria {
  return {
    id: l.id,
    titulo: l.titulo,
    data: l.data,
    origem: l.origem === 'jogos' || l.origem === 'agenda' ? l.origem : null,
    jogoRef: l.jogo_ref,
    capaUrl: l.capa_url,
    ativo: l.ativo,
    totalFotos: l.galeria_fotos?.[0]?.count ?? 0,
  };
}

export function deFoto(l: LinhaFoto): FotoGaleria {
  return { id: l.id, albumId: l.album_id, url: l.url, miniaturaUrl: l.miniatura_url, largura: l.largura, altura: l.altura };
}

/** "15/11/2026" a partir de "2026-11-15". */
export function dataAlbum(data: string): string {
  const [a, m, d] = data.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function textoFotos(n: number): string {
  return n === 1 ? '1 foto' : `${n} fotos`;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
