// Gerar com: supabase gen types typescript --local > lib/supabase/types.ts
// (placeholder — rode após o primeiro `supabase start`)
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type UserRole = 'anonimo' | 'autenticado' | 'moderador' | 'coordenador';
export type CampeonatoStatus = 'em_andamento' | 'fase_grupos' | 'mata_mata' | 'finalizado' | 'cancelado';
export type JogoStatus = 'agendado' | 'ao_vivo' | 'finalizado' | 'adiado' | 'cancelado';
export type InscricaoStatus = 'pendente' | 'aprovada' | 'recusada' | 'cancelada';
export type SumulaStatus = 'rascunho' | 'pendente_assinatura' | 'validada' | 'contestada';
export type EventoTipo = 'gol' | 'cartao_amarelo' | 'cartao_vermelho' | 'substituicao' | 'inicio' | 'fim';

// Tipos manuais (rode `supabase gen types typescript --local` para gerar automaticamente)
export interface Profile { id: string; full_name: string; email: string; role: UserRole; phone?: string; avatar_url?: string; cpf?: string; created_at: string; updated_at: string; }
export interface Campeonato { id: string; nome: string; ano: number; categoria?: string; formato?: string; status: CampeonatoStatus; data_inicio?: string; data_fim?: string; logo_url?: string; descricao?: string; created_by?: string; created_at: string; }
export interface Time { id: string; nome: string; sigla: string; escudo_url?: string; escudo_cor?: string; cidade?: string; fundacao?: string; responsavel_id?: string; created_at: string; }
export interface Inscricao { id: string; campeonato_id: string; time_id: string; categoria?: string; valor_pago?: number; status: InscricaoStatus; submitted_at: string; approved_at?: string; approved_by?: string; }
export interface Jogador { id: string; nome: string; cpf?: string; data_nascimento?: string; posicao?: string; numero_camisa?: number; time_id?: string; foto_url?: string; created_at: string; }
export interface Jogo { id: string; campeonato_id: string; fase?: string; rodada?: number; data: string; local?: string; time_casa_id: string; time_visitante_id: string; placar_casa: number; placar_visitante: number; placar_casa_1t?: number; placar_visitante_1t?: number; status: JogoStatus; arbitro?: string; created_at: string; }
export interface EventoJogo { id: string; jogo_id: string; tipo: EventoTipo; minuto: number; jogador_id?: string; time_id?: string; observacao?: string; created_at: string; }
export interface Sumula { id: string; jogo_id: string; hash_conteudo: string; status: SumulaStatus; arbitro_nome?: string; arbitro_assinatura_url?: string; capitão_casa_nome?: string; capitão_casa_assinatura_url?: string; capitão_visitante_nome?: string; capitão_visitante_assinatura_url?: string; observacoes?: string; criada_por?: string; validada_por?: string; validada_em?: string; created_at: string; }
export interface Transmissao { id: string; jogo_id: string; plataforma: string; url: string; embed_url?: string; viewers: number; status?: string; started_at?: string; ended_at?: string; }
export interface Patrocinador { id: string; nome: string; cota: string; valor_mensal: number; logo_url?: string; logo_initials?: string; logo_cor?: string; categoria?: string; descricao?: string; site_url?: string; ativo: boolean; vigencia_inicio?: string; vigencia_fim?: string; created_by?: string; created_at: string; updated_at: string; }
