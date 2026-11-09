/** Vídeos do Instagram cadastrados pela coordenação (spec Fase 3, seção 11). Funções puras. */
import { validarLinkInstagram } from './links';

export type VideoExterno = {
  id: string;
  titulo: string;
  link: string;
  capa_url: string;
  plataforma: string;
  publicado_em: string;
};

export function faltasVideoExterno(v: { link: string; titulo: string; capa_url: string | null }): string[] {
  const faltas: string[] = [];
  if (!validarLinkInstagram(v.link.trim())) faltas.push('Cole um link https:// do Instagram (post, reel ou tv).');
  if (!v.titulo.trim()) faltas.push('Falta o título.');
  if (!v.capa_url) faltas.push('Falta a capa.');
  return faltas;
}
