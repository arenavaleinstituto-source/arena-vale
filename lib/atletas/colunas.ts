/** Colunas de jogadores que podem ser lidas pela API. O CPF não: só pela função cpfs_do_time (migração 0012). */
export const COLUNAS_JOGADOR = 'id, nome, posicao, numero_camisa, foto_url, time_id';

export type Jogador = { id: string; nome: string; posicao: string | null; numero_camisa: number | null; foto_url: string | null };

/** Atleta como o público vê: CPF só mascarado. */
export const COLUNAS_ATLETA_PUBLICO = 'id, nome, posicao, numero_camisa, foto_url, cpf_mascarado';

export type AtletaPublico = { id: string; nome: string; posicao: string | null; numero_camisa: number | null; foto_url: string | null; cpf_mascarado: string | null };
