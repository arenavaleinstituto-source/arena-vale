/**
 * "Resultados dos projetos" do Projeto Social: notícias publicadas na categoria
 * projeto_social. A consulta real entra com o catálogo de notícias (Task 12).
 */
export type ResultadoProjeto = { id: string; titulo: string; imagem_url: string | null; tipo_midia: 'foto' | 'video' };

export async function buscarResultadosProjeto(): Promise<ResultadoProjeto[]> {
  return [];
}
