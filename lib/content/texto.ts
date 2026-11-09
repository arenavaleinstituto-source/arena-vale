/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PADRÃO EDITORIAL ARENA VALE — NORMALIZAÇÃO DE TEXTO
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  PROBLEMA QUE ESTE MÓDULO RESOLVE
 *  ---------------------------------
 *  O texto do banco era gravado sem acentuação ("INSCRICOES ABERTAS",
 *  "Estao abertas", "Volei"). A Home escondia isso com uma lista de
 *  7 substituições (`corrigirTextoPublico`) que rodava SÓ na Home.
 *  O mural /noticias e o painel não tinham NENHUMA correção — o mesmo
 *  comunicado aparecia "INSCRIÇÕES" na Home e "INSCRICOES" no mural.
 *
 *  A SOLUÇÃO
 *  ---------
 *  1. A fonte do dado passa a ser acentuada (migração 0007).
 *  2. Este normalizador é a REDE DE SEGURANÇA, compartilhada por TODAS as
 *     telas. Mais largo que a lista antiga, e preserva a caixa do texto.
 *  3. Texto lixo (ex.: "DSFSDF") é detectado e substituído por uma
 *     descrição institucional — antes isso só era mascarado na Home.
 */

/**
 * Dicionário de palavras que DEVEM ter acento, escritas sem ele.
 * A chave é minúscula; a aplicação preserva a caixa original.
 */
const MAPA_ACENTOS: Record<string, string> = {
  // palavras geralmente minúsculas; a aplicação preserva a caixa original.
  inscricao: 'inscrição',
  inscricoes: 'inscrições',
  inscricoes_abertas: 'inscrições_abertas',
  transmissao: 'transmissão',
  transmissoes: 'transmissões',
  regiao: 'região',
  regioes: 'regiões',
  estacao: 'estação',
  volei: 'vôlei',
  voleibol: 'vôleibol',
  numero: 'número',
  numeros: 'números',
  tecnica: 'técnica',
  tecnicas: 'técnicas',
  tecnico: 'técnico',
  tecnicos: 'técnicos',
  decisao: 'decisão',
  decisoes: 'decisões',
  participacao: 'participação',
  apresentacao: 'apresentação',
  programacao: 'programação',
  conducao: 'condução',
  edicao: 'edição',
  edicoes: 'edições',
  posicao: 'posição',
  producao: 'produção',
  execucao: 'execução',
  manutencao: 'manutenção',
  informacao: 'informação',
  informacoes: 'informações',
  inscricao_aberta: 'inscrição_aberta',
  relatorio: 'relatório',
  relatorios: 'relatórios',
  roteiro: 'roteiro',
  migracao: 'migração',
  versao: 'versão',
  secao: 'seção',
  acao: 'ação',
  acoes: 'ações',
  operacao: 'operação',
  operacoes: 'operações',
  criacao: 'criação',
  divulgacao: 'divulgação',
  legitimacao: 'legitimação',
  integracao: 'integração',
  alem: 'além',
  ja: 'já',
  nao: 'não',
  sao: 'são',
  sera: 'será',
  serao: 'serão',
  ate: 'até',
  apos: 'após',
  voce: 'você',
  voces: 'vocês',
  tambem: 'também',
  estao: 'estão',
};

/**
 * Aplica o dicionário de acentos preservando a caixa do texto.
 * "INSCRICOES" → "INSCRIÇÕES" · "Inscricoes" → "Inscrições" · "inscricoes" → "inscrições"
 */
export function aplicarAcentos(texto: string): string {
  if (!texto) return '';
  return texto.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (palavra) => {
    const base = palavra.toLowerCase();

    const acentuada = MAPA_ACENTOS[base];
    if (!acentuada) return palavra;

    // CAIXA ALTA → CAIXA ALTA acentuada
    if (palavra === palavra.toUpperCase() && palavra !== palavra.toLowerCase()) {
      return acentuada.toUpperCase();
    }
    // Inicial maiúscula → inicial maiúscula
    if (palavra[0] === palavra[0].toUpperCase() && palavra[0] !== palavra[0].toLowerCase()) {
      return acentuada.charAt(0).toUpperCase() + acentuada.slice(1);
    }
    return acentuada;
  });
}

/**
 * Padrões de conteúdo lixo que já ficaram no banco (ex.: "DSFSDF").
 * Qualquer texto que case com isto é substituído por uma descrição
 * institucional genérica, em vez de ser exibido cru.
 */
const PADROES_LIXO: RegExp[] = [
  /^dsfsdf/i,
  /^asdf/i,
  /^qwerty/i,
  /^lorem ipsum/i,
  /^teste+$/i,
  /^xxx+$/i,
  /^-+$/,
];

/** Detecta se um texto é lixo placeholder. */
export function ehTextoLixo(texto: string): boolean {
  const limpo = (texto || '').trim();
  if (!limpo) return true;
  return PADROES_LIXO.some((r) => r.test(limpo));
}

/** Descrição usada quando o comunicado foi salvo sem texto útil. */
export const DESCRICAO_PADRAO =
  'Confira os principais resultados, notícias e bastidores das competições na cobertura oficial da Arena Vale.';

/**
 * NORMALIZAÇÃO CANÔNICA DE TEXTO PÚBLICO.
 *
 * Use em TODO título, descrição, categoria e selo antes de renderizar.
 * É idempotente: chamar duas vezes devolve o mesmo resultado.
 */
export function normalizarTextoPublico(
  texto: string | null | undefined,
  opcoes: { substituirLixo?: boolean } = {}
): string {
  const { substituirLixo = true } = opcoes;

  if (!texto) return '';

  const limpo = String(texto).replace(/\s+/g, ' ').trim();
  if (!limpo) return '';

  if (substituirLixo && ehTextoLixo(limpo)) return DESCRICAO_PADRAO;

  return aplicarAcentos(limpo);
}

/** Normaliza SEM trocar lixo (para o painel, que precisa ver o que está salvo). */
export function normalizarTextoAdmin(texto: string | null | undefined): string {
  if (!texto) return '';
  return String(texto).replace(/\s+/g, ' ').trim();
}

/* ───────────────────────────── DATAS ─────────────────────────────── */

/**
 * Formata uma data ISO no padrão brasileiro.
 * `2026-10-28T12:00:00Z` → `28/10/2026`
 */
export function formatarDataBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR');
}

/** Data por extenso curta: `28 de outubro de 2026`. */
export function formatarDataExtensoBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Data e hora: `28/10/2026 às 14:30`. */
export function formatarDataHoraBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** Título em CAIXA ALTA, respeitando acentuação já existente. */
export function paraCaixaAlta(texto: string): string {
  return (texto || '').toUpperCase();
}
