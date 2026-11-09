/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — VOCABULÁRIO FECHADO
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  O painel e o site público NÃO podem ter listas diferentes de
 *  categorias, selos ou modalidades. Antes, cada tela tinha a sua própria
 *  lista (o painel offers 4 categorias, a Home mostrava outras, a galeria
 *  filtrava por "VOLEIBOL" — que não existe em lugar nenhum).
 *
 *  Aqui mora a ÚNICA fonte de verdade. O painel lê daqui, e o site
 *  público valida contra daqui.
 */

import type { Destaque, Noticia } from './tipos';

/* ─────────────────────────── COMUNICADOS ─────────────────────────── */

/**
 * Categorias (selo principal vermelho) de um comunicado.
 * A primeira é a usada por padrão no formulário de publicação.
 */
export const CATEGORIAS_NOTICIA = [
  'Comunicado Oficial',
  'Campeonatos',
  'Arbitragem',
  'TV Arena Vale',
  'Parceria',
  'Projeto Social',
] as const;

/**
 * Selos secundários de um comunicado.
 * O primeiro é o padrão do formulário de publicação.
 */
export const TAGS_NOTICIA = [
  'NOVO',
  'OFICIAL',
  'AO VIVO',
  'URGENTE',
  'INSCRIÇÕES ABERTAS',
  'IMPACTO SOCIAL',
  'DESTAQUE',
] as const;

/* ─────────────────────────── DESTAQUES ──────────────────────────── */

/**
 * Modalidades oficiais do Arena Vale — usadas no formulário do painel e nos
 * filtros da galeria pública. Sem isso, a galeria oferecia o filtro
 * "VOLEIBOL" (digitado errado) que não filtrava nada.
 */
export const MODALIDADES = [
  'FUTSAL',
  'FUTEBOL 7',
  'BASQUETEBOL',
  'VÔLEI',
] as const;

/** Alias legados aceitos na leitura, normalizados para MODALIDADES. */
export const ALIAS_MODALIDADE: Record<string, (typeof MODALIDADES)[number]> = {
  FUTSAL: 'FUTSAL',
  'FUTSAL ADULTO': 'FUTSAL',
  'FUTSAL ADULTA': 'FUTSAL',
  'FUTEBOL 7': 'FUTEBOL 7',
  FUTEBOL7: 'FUTEBOL 7',
  'FUTEBOL 7 SOCIETY': 'FUTEBOL 7',
  'FUTEBOL DE 7': 'FUTEBOL 7',
  BASQUETEBOL: 'BASQUETEBOL',
  BASQUETE: 'BASQUETEBOL',
  VOLEI: 'VÔLEI',
  VOLEIBOL: 'VÔLEI',
  'VÔLEI FEMININO': 'VÔLEI',
  'VÔLEI MASCULINO': 'VÔLEI',
};

/* ─────────────────────────── HELPERS ─────────────────────────────── */

export function ehCategoriaValida(valor: string): boolean {
  return (CATEGORIAS_NOTICIA as readonly string[]).includes(valor);
}

export function ehTagValida(valor: string): boolean {
  return (TAGS_NOTICIA as readonly string[]).includes(valor);
}

export function ehModalidadeValida(valor: string): boolean {
  return (MODALIDADES as readonly string[]).includes(valor);
}

/** Normaliza uma modalidade livre para a forma canônica. */
export function normalizarModalidade(valor: string): string {
  const chave = (valor || '').trim().toUpperCase();
  return ALIAS_MODALIDADE[chave] ?? chave;
}

/** Valor padrão do seletor de categoria no painel. */
export const CATEGORIA_PADRAO = CATEGORIAS_NOTICIA[0];

/** Valor padrão do seletor de selo no painel. */
export const TAG_PADRAO = TAGS_NOTICIA[0];

/** Filtros exibidos na galeria pública de destaques. */
export const FILTROS_MODALIDADE = ['TODOS', ...MODALIDADES] as const;

/**
 * Rótulo do campo `categoria` exibido no card. A categoria canônica
 * "Comunicado Oficial" é longa demais para o badge inclinado do card,
 * então ela é abreviada de forma consistente em todas as telas.
 */
export function rotuloCategoria(categoria: string): string {
  const mapa: Record<string, string> = {
    'Comunicado Oficial': 'COMUNICADO',
    Campeonatos: 'CAMPEONATOS',
    Arbitragem: 'ARBITRAGEM',
    'TV Arena Vale': 'TV ARENA VALE',
    Parceria: 'PARCERIA',
    'Projeto Social': 'PROJETO SOCIAL',
  };
  return mapa[categoria] ?? (categoria || 'COMUNICADO').toUpperCase();
}

/** Reexporta os tipos para quem importa só deste módulo. */
export type { Noticia, Destaque };
