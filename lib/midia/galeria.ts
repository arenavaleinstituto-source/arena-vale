/** Galeria de fotos (spec Fase 4A, seção 4): tipos e conversões puras. */
import type { ItemAgenda } from './agenda';

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
  competicao: string | null;
  local: string | null;
  placar: string | null;
  descricao: string | null;
  fotografo: string | null;
  publicadoEm: string | null;
};

export type SituacaoAlbum = 'rascunho' | 'publicado' | 'escondido';

/** Publicado aparece no site; rascunho nunca foi publicado; escondido já foi e saiu. */
export function situacaoAlbum(a: Pick<AlbumGaleria, 'ativo' | 'publicadoEm'>): SituacaoAlbum {
  if (a.ativo) return 'publicado';
  return a.publicadoEm ? 'escondido' : 'rascunho';
}

/** Detalhes que o álbum de um jogo já ganha da agenda. */
export function detalhesDoJogo(j: ItemAgenda): { competicao: string | null; local: string | null; placar: string | null } {
  const competicao = [j.modalidade, j.fase].filter(Boolean).join(' · ');
  return { competicao: competicao || null, local: j.local ?? null, placar: j.placar ?? null };
}

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
  competicao?: string | null;
  local?: string | null;
  placar?: string | null;
  descricao?: string | null;
  fotografo?: string | null;
  publicado_em?: string | null;
};

export type LinhaFoto = {
  id: string;
  album_id: string;
  url: string;
  miniatura_url: string;
  largura: number;
  altura: number;
};

export const SELECT_ALBUM =
  'id,titulo,data,origem,jogo_ref,capa_url,ativo,competicao,local,placar,descricao,fotografo,publicado_em,galeria_fotos(count)';
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
    competicao: l.competicao ?? null,
    local: l.local ?? null,
    placar: l.placar ?? null,
    descricao: l.descricao ?? null,
    fotografo: l.fotografo ?? null,
    publicadoEm: l.publicado_em ?? null,
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
