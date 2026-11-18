import { COLUNAS_JOGADOR, type Jogador } from './colunas';

/** Atleta no elenco de um campeonato: o jogador e a linha de `inscricao_atletas` (número e posição valem para aquele campeonato). */
export type AtletaDoElenco = Jogador & { linha: string };

/** Colunas de `inscricao_atletas` com o jogador (sem CPF). */
export const COLUNAS_ELENCO = `id, numero_camisa, posicao, jogadores(${COLUNAS_JOGADOR})`;

type LinhaElenco = { id: string; numero_camisa: number | null; posicao: string | null; jogadores: Jogador | null };

export function paraElenco(linhas: unknown[] | null | undefined): AtletaDoElenco[] {
  return ((linhas ?? []) as LinhaElenco[])
    .flatMap((l) => (l.jogadores ? [{ ...l.jogadores, linha: l.id, numero_camisa: l.numero_camisa ?? l.jogadores.numero_camisa, posicao: l.posicao ?? l.jogadores.posicao }] : []))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
