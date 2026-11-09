/** Vídeos do Instagram cadastrados pela coordenação (spec Fase 3, seção 11). Completo na Task 11. */
export type VideoExterno = {
  id: string;
  titulo: string;
  link: string;
  capa_url: string;
  plataforma: string;
  publicado_em: string;
};

export async function buscarVideosExternos(limite = 20): Promise<VideoExterno[]> {
  void limite;
  return [];
}
