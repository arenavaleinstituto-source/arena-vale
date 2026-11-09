/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — COMUNICADOS (tabela `noticias`)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  FONTE DE VERDADE
 *  ---------------
 *  Colunas reais em produção:
 *    id, titulo, descricao, categoria, tag, imagem_url,
 *    ordem, ativo, created_by, created_at, updated_at
 *
 *  ALIASES ACEITOS NA LEITURA (registros antigos / outras instalações):
 *    descricao ← conteudo
 *    tag       ← selo
 *    imagem_url← imagemCapa
 *
 *  Regras aplicadas em TODOS os consumidores (Home, /noticias, /noticias/[id],
 *  /painel/noticias):
 *    • só mostra o que está `ativo = true`
 *    • ordena por `ordem` (manual) e, empatado, por `created_at` (mais novo)
 *    • normaliza acentuação e texto lixo
 *    • usa a MESMA capa de fallback
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { IMAGEM_PADRAO, type Noticia, type NoticiaRow, type OrdemComunicados } from './tipos';
import { normalizarTextoPublico, paraCaixaAlta } from './texto';
import { rotuloCategoria } from './vocabulario';

/* ───────────────────────── MAPEAMENTO ────────────────────────────── */

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  return String(valor);
}

/**
 * Converte uma linha crua do banco no formato canônico.
 * Aceita tanto o formato real (`titulo`/`descricao`/`tag`) quanto o legado
 * (`conteudo`/`selo`), para que nenhum registro publicado se perca.
 */
export function mapearNoticia(row: NoticiaRow): Noticia {
  const titulo = texto(row.titulo ?? row.titulo_comunicado);
  const descricao = texto(row.descricao ?? row.conteudo);
  const categoria = texto(row.categoria);
  const tag = texto(row.tag ?? row.selo);
  const imagem = texto(row.imagem_url ?? row.imagemCapa);

  return {
    id: texto(row.id) || `noticia-${texto(row.ordem) || Math.random().toString(36).slice(2, 9)}`,
    titulo: paraCaixaAlta(normalizarTextoPublico(titulo)),
    descricao: normalizarTextoPublico(descricao),
    categoria: rotuloCategoria(normalizarTextoPublico(categoria, { substituirLixo: false })),
    tag: paraCaixaAlta(normalizarTextoPublico(tag, { substituirLixo: false })),
    ordem: Number.isFinite(Number(row.ordem)) ? Number(row.ordem) : 999,
    ativo: row.ativo === undefined || row.ativo === null ? true : Boolean(row.ativo),
    imagem_url: imagem || null,
    created_at: texto(row.created_at) || texto(row.updated_at),
  };
}

/** Normaliza uma lista de linhas cruas. */
export function mapearNoticias(rows: NoticiaRow[] | null | undefined): Noticia[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapearNoticia);
}

/* ────────────────────────── CONSULTA ─────────────────────────────── */

export interface OpcoesConsultaNoticias {
  /** Máximo de itens devolvidos. `undefined` = sem limite. */
  limite?: number;
  /** Inclui rascunhos (`ativo = false`). Usar só no painel. */
  incluirInativos?: boolean;
  /** Critério de ordenação. Padrão: `ordem`. */
  ordem?: OrdemComunicados;
}

/**
 * Consulta ÚNICA de comunicados. Use esta função em qualquer tela que
 * precise de comunicados — nunca escreva uma query ad-hoc para `noticias`.
 */
export async function buscarNoticias(
  supabase: SupabaseClient,
  opcoes: OpcoesConsultaNoticias = {}
): Promise<{ noticias: Noticia[]; erro: string | null }> {
  const { limite, incluirInativos = false, ordem = 'ordem' } = opcoes;

  try {
    let query = supabase.from('noticias').select('*');

    if (!incluirInativos) query = query.eq('ativo', true);

    if (ordem === 'recentes') {
      query = query.order('created_at', { ascending: false });
    } else if (ordem === 'antigos') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('ordem', { ascending: true }).order('created_at', { ascending: false });
    }

    if (typeof limite === 'number') query = query.limit(limite);

    const { data, error } = await query;

    if (error) {
      return { noticias: [], erro: error.message };
    }

    return { noticias: mapearNoticias(data as NoticiaRow[]), erro: null };
  } catch (erro: any) {
    return { noticias: [], erro: erro?.message ?? 'Erro ao carregar comunicados.' };
  }
}

/* ──────────────────────── FALLBACKS ──────────────────────────────── */

/**
 * Comunicados de fallback exibidos quando o banco está indisponível ou
 * ainda não tem nenhum comunicado publicado.
 *
 *IMPORTANTE: este é o MESMO conjunto usado pela Home e pelo mural
 * /noticias. Antes, cada tela tinha o seu — por isso a Home mostrava
 * "NOVA TEMPORADA DE TRANSMISSÕES" e o mural mostrava outra coisa.
 *
 *  O texto já vem acentuado e coerente com o vocabulário oficial.
 */
export const NOTICIAS_PADRAO: Noticia[] = [
  {
    id: 'noticia-padrao-1',
    titulo: 'NOVA TEMPORADA DE TRANSMISSÕES',
    descricao:
      'A Arena Vale prepara cobertura técnica e multimídia completa para o esporte regional com câmeras em alta definição e placar em tempo real.',
    categoria: 'BROADCAST',
    tag: 'AO VIVO',
    ordem: 1,
    ativo: true,
    imagem_url: null,
    created_at: '2026-01-05T12:00:00.000Z',
  },
  {
    id: 'noticia-padrao-2',
    titulo: 'INCENTIVO AO ESPORTE COMUNITÁRIO',
    descricao:
      'Aproximamos marcas, atletas e escolinhas gratuitas com impacto direto em mais de 15 comunidades da região do Vale.',
    categoria: 'PROJETO SOCIAL',
    tag: 'IMPACTO SOCIAL',
    ordem: 2,
    ativo: true,
    imagem_url: null,
    created_at: '2026-01-04T12:00:00.000Z',
  },
  {
    id: 'noticia-padrao-3',
    titulo: 'ORGANIZAÇÃO E GESTÃO ESPORTIVA',
    descricao:
      'Coordenação técnica, súmula digital e arbitragem estruturadas para elevar o nível de todas as competições da temporada.',
    categoria: 'CAMPEONATOS',
    tag: 'OFICIAL',
    ordem: 3,
    ativo: true,
    imagem_url: null,
    created_at: '2026-01-03T12:00:00.000Z',
  },
];

/**
 * Devolve os comunicados do banco ou, se não houver nenhum (ou a tabela
 * ainda não existir), o conjunto de fallback. Nunca devolve lista vazia
 * para o site público.
 */
export function comFallback(noticias: Noticia[], fallback: Noticia[] = NOTICIAS_PADRAO): Noticia[] {
  return noticias.length > 0 ? noticias : fallback;
}

/** Capa de um comunicado, com o fallback oficial. */
export function imagemNoticia(noticia: Pick<Noticia, 'imagem_url'>): string {
  return noticia.imagem_url || IMAGEM_PADRAO;
}
