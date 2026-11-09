/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — BARREL
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Ponto de entrada único do padrão editorial. Qualquer tela que precise
 *  de comunicados (anúncios) ou de posts (destaques) importa daqui:
 *
 *    import { buscarNoticias, NOTICIAS_PADRAO, normalizarTextoPublico } from '@/lib/content';
 *
 *  Isso garante que Home, mural, painel e galeria leiam, normalizem e
 *  ordenem o conteúdo do MESMO jeito.
 */

export * from './tipos';
export * from './texto';
export * from './vocabulario';
export * from './noticias';
export * from './destaques';
