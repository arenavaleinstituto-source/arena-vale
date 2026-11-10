/**
 * Regras das notícias no modelo de mídia esportiva (spec Fase 3, seção 10, e
 * spec 2026-11-08, seções 4.1–4.5). Funções puras: usadas pelo site, pelo painel
 * e pelo bot. As consultas ao banco ficam em `noticias-busca.ts` (só servidor).
 */
import { idYoutube, NOME_SERVICO, servicoDoLink } from './links';

export type Aba = 'arena' | 'mundo';
export type CategoriaMidia = 'geral' | 'campeonatos' | 'bastidores' | 'projeto_social';
export type ModoVideo = 'guardar_arquivo' | 'so_link';

export const CATEGORIAS_MIDIA: { valor: CategoriaMidia; rotulo: string }[] = [
  { valor: 'geral', rotulo: 'Geral' },
  { valor: 'campeonatos', rotulo: 'Campeonatos' },
  { valor: 'bastidores', rotulo: 'Bastidores' },
  { valor: 'projeto_social', rotulo: 'Projeto Social' },
];

export type NoticiaMidia = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaMidia;
  imagem_url: string | null;
  enquadramento: string | null;
  aba: Aba;
  destaque: boolean;
  tipo_midia: 'foto' | 'video';
  video_url: string | null;
  video_expira_em: string | null;
  video_link: string | null;
  video_servico: string | null;
  status: 'rascunho' | 'publicado';
  publicado_em: string | null;
  fonte: string | null;
  origem: 'manual' | 'telegram';
  modalidade: string | null;
  created_at: string;
  /** Story no Instagram (0016). */
  story_status?: 'processando' | 'publicado' | 'erro';
  story_erro?: string | null;
};

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);

function categoriaDe(v: unknown): CategoriaMidia {
  const t = (typeof v === 'string' ? v : '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  if (t === 'campeonatos') return 'campeonatos';
  if (t === 'bastidores') return 'bastidores';
  if (t === 'projeto_social' || t === 'projeto social') return 'projeto_social';
  return 'geral';
}

/**
 * Aceita a linha nova (com `status`, `aba`...) e a antiga (só `ativo`): no banco
 * antigo, notícia ativa conta como publicada na aba ARENA VALE.
 */
export function mapearNoticiaMidia(row: Record<string, unknown>): NoticiaMidia {
  const temStatus = row.status === 'publicado' || row.status === 'rascunho';
  const status = temStatus ? (row.status as NoticiaMidia['status']) : row.ativo === false ? 'rascunho' : 'publicado';
  const created = texto(row.created_at) ?? new Date(0).toISOString();
  return {
    id: String(row.id),
    titulo: typeof row.titulo === 'string' ? row.titulo : '',
    descricao: typeof row.descricao === 'string' ? row.descricao : '',
    categoria: categoriaDe(row.categoria),
    imagem_url: texto(row.imagem_url),
    enquadramento: texto(row.enquadramento),
    aba: row.aba === 'mundo' ? 'mundo' : 'arena',
    destaque: row.destaque === true,
    tipo_midia: row.tipo_midia === 'video' ? 'video' : 'foto',
    video_url: texto(row.video_url),
    video_expira_em: texto(row.video_expira_em),
    video_link: texto(row.video_link),
    video_servico: texto(row.video_servico),
    status,
    publicado_em: texto(row.publicado_em) ?? (status === 'publicado' && !temStatus ? created : null),
    fonte: texto(row.fonte),
    origem: row.origem === 'telegram' ? 'telegram' : 'manual',
    modalidade: texto(row.modalidade),
    created_at: created,
    ...(row.story_status === 'processando' || row.story_status === 'publicado' || row.story_status === 'erro'
      ? { story_status: row.story_status, story_erro: texto(row.story_erro) }
      : {}),
  };
}

export type ModoReproducao =
  | { tipo: 'arquivo'; src: string }
  | { tipo: 'youtube'; embed: string }
  | { tipo: 'link'; href: string; servico: string }
  | { tipo: 'foto' };

/** Ordem do spec 4.5: arquivo guardado → YouTube embutido → outro link → foto. */
export function modoReproducao(n: Pick<NoticiaMidia, 'tipo_midia' | 'video_url' | 'video_link'>): ModoReproducao {
  if (n.tipo_midia !== 'video') return { tipo: 'foto' };
  if (n.video_url) return { tipo: 'arquivo', src: n.video_url };
  if (n.video_link) {
    const id = idYoutube(n.video_link);
    if (id) return { tipo: 'youtube', embed: `https://www.youtube-nocookie.com/embed/${id}` };
    return { tipo: 'link', href: n.video_link, servico: NOME_SERVICO[servicoDoLink(n.video_link)] };
  }
  return { tipo: 'foto' };
}

const H48 = 48 * 3600 * 1000;
export function ehNova(publicadoEm: string | null, agora: Date): boolean {
  if (!publicadoEm) return false;
  const d = agora.getTime() - Date.parse(publicadoEm);
  return d >= 0 && d < H48;
}

export function faltasParaPublicar(n: Pick<NoticiaMidia, 'titulo' | 'imagem_url' | 'tipo_midia' | 'video_url' | 'video_link'>, modo: ModoVideo): string[] {
  const faltas: string[] = [];
  if (!n.titulo.trim()) faltas.push('Falta o título.');
  if (!n.imagem_url) faltas.push('Falta o cartaz.');
  if (n.tipo_midia === 'video') {
    if (modo === 'so_link' && !n.video_link) faltas.push('Cole o link do vídeo para publicar');
    if (modo === 'guardar_arquivo' && !n.video_url && !n.video_link) faltas.push('Falta o vídeo: envie o arquivo ou cole o link.');
  }
  return faltas;
}

const porData = (a: NoticiaMidia, b: NoticiaMidia) => Date.parse(b.publicado_em ?? b.created_at) - Date.parse(a.publicado_em ?? a.created_at);

/** Fileiras do catálogo (spec 4.1): Destaques, Mais recentes, Campeonatos, Bastidores, Projeto Social (só na aba ARENA VALE). */
export function montarFileiras(ns: NoticiaMidia[], aba: Aba): { titulo: string; itens: NoticiaMidia[] }[] {
  const lista = [...ns].sort(porData);
  const fileiras = [
    { titulo: 'Destaques', itens: lista.filter((n) => n.destaque) },
    { titulo: 'Mais recentes', itens: lista },
    { titulo: 'Campeonatos', itens: lista.filter((n) => n.categoria === 'campeonatos') },
    { titulo: 'Bastidores', itens: lista.filter((n) => n.categoria === 'bastidores') },
    ...(aba === 'arena' ? [{ titulo: 'Projeto Social', itens: lista.filter((n) => n.categoria === 'projeto_social') }] : []),
  ];
  return fileiras.filter((f) => f.itens.length > 0).map((f) => ({ ...f, itens: f.itens.slice(0, 20) }));
}
