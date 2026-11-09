/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — DESTAQUES (tabela `atletas_destaque`)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  FONTE DE VERDADE
 *  ---------------
 *  Colunas reais em produção:
 *    id, foto_url, atleta_nome, time_nome, campeonato_nome,
 *    ativo, ordem, created_at, created_by
 *
 *  COLUNAS ADICIONADAS PELA MIGRAÇÃO 0007 (opcionais):
 *    modalidade, jogos, gols_ou_pontos, assistencias
 *
 *  ALIASES ACEITOS NA LEITURA (formato antigo, usado por /painel e pela Home):
 *    atleta_nome     ← nome
 *    time_nome       ← equipe
 *    campeonato_nome ← destaque_texto
 *    foto_url        ← imagem_url
 *
 *  Sem este mapeamento, o site lia `nome`/`equipe`/`imagem_url` — colunas
 *  que não existem — e por isso a galeria pública NUNCA mostrava os atletas
 *  publicados: ela caía sempre no fallback fictício.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { IMAGEM_PADRAO, type Destaque, type DestaqueRow } from './tipos';
import { normalizarTextoPublico, paraCaixaAlta } from './texto';
import { normalizarModalidade } from './vocabulario';

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  return String(valor);
}

/**
 * Deriva a modalidade a partir do nome do campeonato.
 * Serve de fallback quando a coluna `modalidade` ainda não foi preenchida.
 *   "Circuito Arena Vale de Futsal 2026" → "FUTSAL"
 */
export function derivarModalidade(campeonato: string): string {
  const alvo = (campeonato || '').toLowerCase();
  const regras: [RegExp, string][] = [
    [/futsal/, 'FUTSAL'],
    [/basquet/, 'BASQUETEBOL'],
    [/v[oó]lei/, 'VÔLEI'],
    [/society|futebol\s*7/, 'FUTEBOL 7'],
    [/futebol/, 'FUTEBOL 7'],
  ];
  for (const [regex, modalidade] of regras) {
    if (regex.test(alvo)) return modalidade;
  }
  return 'FUTSAL';
}

/** Converte uma linha crua do banco no formato canônico. */
export function mapearDestaque(row: DestaqueRow): Destaque {
  const nome = texto(row.atleta_nome ?? row.nome);
  const equipe = texto(row.time_nome ?? row.equipe);
  const campeonato = texto(row.campeonato_nome ?? row.destaque_texto);
  const modalidadeBruta = texto(row.modalidade);
  const imagem = texto(row.foto_url ?? row.imagem_url);

  return {
    id: texto(row.id) || `destaque-${Math.random().toString(36).slice(2, 9)}`,
    nome: paraCaixaAlta(normalizarTextoPublico(nome)),
    equipe: paraCaixaAlta(normalizarTextoPublico(equipe)),
    campeonato: paraCaixaAlta(normalizarTextoPublico(campeonato)),
    modalidade: modalidadeBruta
      ? normalizarModalidade(normalizarTextoPublico(modalidadeBruta, { substituirLixo: false }))
      : derivarModalidade(campeonato),
    imagem_url: imagem || null,
    jogos: texto(row.jogos) || null,
    gols_ou_pontos: texto(row.gols_ou_pontos) || null,
    assistencias: texto(row.assistencias) || null,
    ordem: Number.isFinite(Number(row.ordem)) ? Number(row.ordem) : 999,
    ativo: row.ativo === undefined || row.ativo === null ? true : Boolean(row.ativo),
    created_at: texto(row.created_at),
  };
}

/** Normaliza uma lista de linhas cruas. */
export function mapearDestaques(rows: DestaqueRow[] | null | undefined): Destaque[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapearDestaque);
}

/* ────────────────────────── CONSULTA ─────────────────────────────── */

export interface OpcoesConsultaDestaques {
  limite?: number;
  incluirInativos?: boolean;
}

/** Consulta ÚNICA de destaques. Nunca escreva uma query ad-hoc para esta tabela. */
export async function buscarDestaques(
  supabase: SupabaseClient,
  opcoes: OpcoesConsultaDestaques = {}
): Promise<{ destaques: Destaque[]; erro: string | null }> {
  const { limite, incluirInativos = false } = opcoes;

  try {
    let query = supabase.from('atletas_destaque').select('*');

    if (!incluirInativos) query = query.eq('ativo', true);

    query = query.order('ordem', { ascending: true }).order('created_at', { ascending: false });

    if (typeof limite === 'number') query = query.limit(limite);

    const { data, error } = await query;

    if (error) {
      return { destaques: [], erro: error.message };
    }

    return { destaques: mapearDestaques(data as DestaqueRow[]), erro: null };
  } catch (erro: any) {
    return { destaques: [], erro: erro?.message ?? 'Erro ao carregar destaques.' };
  }
}

/* ──────────────────────── FALLBACKS ──────────────────────────────── */

/**
 * Atletas de fallback da galeria pública.
 * Mesmo conjunto usado pela Home — antes cada tela tinha o seu, e a Home
 * mostrava GABRIEL MENDES enquanto a galeria mostrava MATHEUS SILVA.
 */
export const DESTAQUES_PADRAO: Destaque[] = [
  {
    id: 'destaque-padrao-1',
    nome: 'GABRIEL MENDES',
    equipe: 'FÊNIX CLUB · ALA / FIXO',
    campeonato: 'COPA VALE 2026',
    modalidade: 'FUTSAL',
    imagem_url:
      'https://images.pexels.com/photos/15818644/pexels-photo-15818644.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    jogos: '12',
    gols_ou_pontos: '18 Gols',
    assistencias: '9',
    ordem: 1,
    ativo: true,
    created_at: '2026-01-05T12:00:00.000Z',
  },
  {
    id: 'destaque-padrao-2',
    nome: 'LUCAS SILVEIRA',
    equipe: 'VALE UNITED BASQUETE · ARMADOR',
    campeonato: 'LIGA VALE HOOPS 2026',
    modalidade: 'BASQUETEBOL',
    imagem_url:
      'https://images.pexels.com/photos/974516/pexels-photo-974516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    jogos: '8',
    gols_ou_pontos: '164 Pts',
    assistencias: '42',
    ordem: 2,
    ativo: true,
    created_at: '2026-01-04T12:00:00.000Z',
  },
  {
    id: 'destaque-padrao-3',
    nome: 'MATHEUS BECKER',
    equipe: 'ARENA FC · PIVÔ / ATACANTE',
    campeonato: 'COPA ARENA VALE DE FUTEBOL 7',
    modalidade: 'FUTEBOL 7',
    imagem_url:
      'https://images.pexels.com/photos/13521967/pexels-photo-13521967.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    jogos: '10',
    gols_ou_pontos: '14 Gols',
    assistencias: '6',
    ordem: 3,
    ativo: true,
    created_at: '2026-01-03T12:00:00.000Z',
  },
  {
    id: 'destaque-padrao-4',
    nome: 'CAMILA HOFFMANN',
    equipe: 'VÔLEI FUTURO VALE · PONTEIRA',
    campeonato: 'TAÇA VALE VÔLEI 2026',
    modalidade: 'VÔLEI',
    imagem_url:
      'https://images.pexels.com/photos/34544419/pexels-photo-34544419.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    jogos: '9',
    gols_ou_pontos: '118 Pts',
    assistencias: '24 Aces',
    ordem: 4,
    ativo: true,
    created_at: '2026-01-02T12:00:00.000Z',
  },
];

/** Devolve os destaques do banco ou, se vazio, o conjunto de fallback. */
export function comFallbackDestaques(
  destaques: Destaque[],
  fallback: Destaque[] = DESTAQUES_PADRAO
): Destaque[] {
  return destaques.length > 0 ? destaques : fallback;
}

/** Foto do atleta, com o fallback oficial. */
export function imagemDestaque(destaque: Pick<Destaque, 'imagem_url'>): string {
  return destaque.imagem_url || IMAGEM_PADRAO;
}
