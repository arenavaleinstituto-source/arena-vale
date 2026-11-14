/** Abas do painel da coordenação (spec Fase 3, seção 12). A aba aberta fica na URL (?aba=). */
export const ABAS_COORD = [
  { id: 'visao', rotulo: 'Visão geral' },
  { id: 'aovivo', rotulo: 'Ao Vivo' },
  { id: 'noticias', rotulo: 'Notícias' },
  { id: 'galeria', rotulo: 'Galeria' },
  { id: 'videos', rotulo: 'Vídeos' },
  { id: 'jogos', rotulo: 'Agenda e jogos' },
  { id: 'campeonatos', rotulo: 'Campeonatos' },
  { id: 'inscricoes', rotulo: 'Inscrições' },
  { id: 'sumulas', rotulo: 'Súmulas' },
  { id: 'moderadores', rotulo: 'Moderadores' },
  { id: 'delegados', rotulo: 'Delegados' },
  { id: 'capitaes', rotulo: 'Capitães' },
  { id: 'patrocinadores', rotulo: 'Patrocinadores' },
  { id: 'destaques', rotulo: 'Atletas destaque' },
  { id: 'config', rotulo: 'Configurações' },
] as const;

export type IdAba = (typeof ABAS_COORD)[number]['id'];

export function abaValida(v: string | null | undefined): IdAba {
  return (ABAS_COORD.find((a) => a.id === v)?.id ?? 'visao') as IdAba;
}
