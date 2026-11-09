/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — TIPOS CANÔNICOS
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  O site tem DOIS tipos de conteúdo editorial, e ambos são publicados
 *  pelo Painel e consumidos pelo site público:
 *
 *    1. COMUNICADO (Noticia)  → tabela `noticias`
 *       Tudo o que é aviso oficial: inscrições, arbitragem, Scaling,
 *      -TV, coberturas, parcerias. Aparece em:
 *         • Home  → seção #noticias (3 mais recentes)
 *         • /noticias → mural completo ("COMUNICADOS OFICIAIS")
 *         • /noticias/[id] → leitura do comunicado
 *
 *    2. DESTAQUE (Destaque)   → tabela `atletas_destaque`
 *       Postagem de atleta em destaque. Aparece em:
 *         • /atletasdestaques → galeria oficial
 *         • Home → seção de atletas (quando publicada)
 *
 *  REGRA DE OURO: existe UM único formato para cada tipo. Home, mural,
 *  painel e galeria consomem exatamente as mesmas interfaces — nunca
 *  uma forma no painel e outra no site público.
 *
 *  @see lib/content/vocabulario.ts  — o vocabulário fechado (categorias/tags)
 *  @see lib/content/texto.ts        — normalização de texto e datas
 *  @see lib/content/noticias.ts     — consulta + mapeamento de comunicados
 *  @see lib/content/destaques.ts    — consulta + mapeamento de destaques
 */

/** Imagem usada quando um item é publicado sem capa. */
export const IMAGEM_PADRAO = '/fundo-arena.jpg';

/**
 * Comunicado / Anúncio oficial.
 *
 * Reflete exatamente as colunas da tabela `noticias`.
 * `descricao` e `tag` são os nomes canônicos — `conteudo` e `selo` são
 * apenas aliases legados aceitos na leitura (ver `mapearNoticia`).
 */
export interface Noticia {
  id: string;
  /** Manchete. Exibida sempre em CAIXA ALTA. */
  titulo: string;
  /** Corpo do comunicado. Exibido como resumo (3 linhas) no card. */
  descricao: string;
  /** Selo principal (badge vermelho). Ex.: "CAMPEONATOS". */
  categoria: string;
  /** Selo secundário (badge contornado). Ex.: "INSCRIÇÕES ABERTAS". */
  tag: string;
  /** Ordenação manual no mural. Menor = aparece primeiro. */
  ordem: number;
  /** `false` = rascunho, não aparece no site público. */
  ativo: boolean;
  /** URL da capa (Supabase Storage ou absoluta). `null` = usa IMAGEM_PADRAO. */
  imagem_url: string | null;
  /** ISO 8601. */
  created_at: string;
}

/**
 * Postagem de atleta em destaque.
 *
 * COLUNAS REAIS NO BANCO (`atletas_destaque`):
 *   id, foto_url, atleta_nome, time_nome, campeonato_nome,
 *   ativo, ordem, created_at, created_by
 *   + (opcionais, adicionadas pela migração 0007) modalidade, jogos,
 *     gols_ou_pontos, assistencias
 *
 * IMPORTANTE: o código antigo do site lia `nome`, `equipe`,
 * `destaque_texto` e `imagem_url` — colunas que NUNCA existiram no
 * banco de produção. Por isso a galeria pública mostrava sempre os 3
 * atletas fictícios do fallback, e o painel do /painel/atletasdestaques
 * falhava ao inserir. O mapeamento canônico abaixo aceita o formato
 * novo (real) e o legado (antigo), para não quebrar nenhum registro.
 */
export interface Destaque {
  id: string;
  /** Nome do atleta. Exibido em CAIXA ALTA. */
  nome: string;
  /** Equipe do atleta. Ex.: "BRUSQUE". */
  equipe: string;
  /** Campeonato em que se(destaca. Ex.: "CATARINENSE SUB 20". */
  campeonato: string;
  /** Modalidade normalizada. Ex.: "FUTSAL". Derivada do campeonato se vazia. */
  modalidade: string;
  /** URL da foto do atleta. `null` = usa IMAGEM_PADRAO. */
  imagem_url: string | null;
  /** Estatísticas opcionais — só renderizadas quando preenchidas. */
  jogos: string | null;
  gols_ou_pontos: string | null;
  assistencias: string | null;
  /** Ordenação manual na galeria. Menor = aparece primeiro. */
  ordem: number;
  /** `false` = não aparece no site público. */
  ativo: boolean;
  /** ISO 8601. */
  created_at: string;
}

/** Linha crua vinda do Supabase (antes do mapeamento canônico). */
export type NoticiaRow = Record<string, unknown>;
export type DestaqueRow = Record<string, unknown>;

/** Opções de ordenação do mural de comunicados. */
export type OrdemComunicados = 'ordem' | 'recentes' | 'antigos';
