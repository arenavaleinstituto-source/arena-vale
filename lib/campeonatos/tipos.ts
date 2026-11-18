export type TipoPlacar = 'gols' | 'sets' | 'cestas';
export type Criterio = 'vitorias' | 'saldo' | 'pro' | 'contra' | 'confronto_direto' | 'media_sets' | 'media_pontos_sets' | 'sorteio';
export type Pontuacao =
  | { tipo: 'gols'; vitoria: number; empate: number; derrota: number }
  | { tipo: 'sets'; vitoria_direta: number; vitoria_decisivo: number; derrota_decisivo: number; derrota: number }
  | { tipo: 'cestas'; vitoria: number; derrota: number };
export type DesempateMataMata = { prorrogacao: boolean; gol_fora: boolean; final: 'penaltis' | 'melhor_campanha' };
export type OpcoesMataMata = {
  ida_volta: boolean; final_ida_volta: boolean; terceiro_lugar: boolean;
  /** Fases jogadas em ida e volta (escolha fase a fase). Quando existe, vale no lugar de ida_volta/final_ida_volta. */
  ida_volta_fases?: string[];
  chave: 'sorteio' | 'manual'; desempate: DesempateMataMata; sets_melhor_de: 3 | 5;
};
export type FormaDisputa =
  | { tipo: 'pontos_corridos'; ida_volta: boolean; final_entre: number | null; mata: OpcoesMataMata | null }
  | { tipo: 'mata_mata'; mata: OpcoesMataMata }
  | { tipo: 'grupos_mata_mata'; grupos: number; passam_por_grupo: number; melhores_extras: number;
      montagem: 'sorteio' | 'sorteio_cabecas' | 'manual'; ida_volta_grupos: boolean; mata: OpcoesMataMata };
export type Regulamento = {
  versao: 1; formato_antigo: boolean; tipo_placar: TipoPlacar; forma: FormaDisputa; pontuacao: Pontuacao;
  criterios: Criterio[]; wo_placar: { vencedor: number; perdedor: number }; regras_adicionais: string;
  suspensao: { amarelos: number; jogos_por_vermelho: number; zera_no_mata_mata: boolean };
  secoes: { artilharia: boolean; goleiro: boolean; destaques: boolean; goleiro_minimo_pct: number };
};
export type Vaga =
  | { tipo: 'grupo'; grupo: string; posicao: number }      // "1º do Grupo A"; grupo 'geral' nos pontos corridos com final
  | { tipo: 'extra'; posicao: number; indice: number }      // "2º melhor 3º colocado" → { posicao: 3, indice: 2 }
  | { tipo: 'vencedor'; jogo: number }                      // jogo = `ordem` do jogo de origem
  | { tipo: 'perdedor'; jogo: number }
  | { tipo: 'semente'; indice: number };                    // cabeça de chave nº N (mata-mata direto)
export type JogoGerado = {
  ordem: number; fase: string; rodada: number | null; grupo: string | null;
  casa: string | null; visitante: string | null;            // time_id, ou null enquanto a vaga não é decidida
  vaga_casa: Vaga | null; vaga_visitante: Vaga | null; volta_de: number | null; // ordem do jogo de ida
};
export type JogoCalc = {
  id: string; ordem: number | null; fase: string | null; grupo: string | null; rodada: number | null;
  casa: string | null; visitante: string | null; status: string;
  placar_casa: number | null; placar_visitante: number | null;
  penaltis_casa: number | null; penaltis_visitante: number | null; wo: 'casa' | 'visitante' | null;
  parciais: { casa: number; visitante: number }[] | null;
  vaga_casa: Vaga | null; vaga_visitante: Vaga | null; vaga_manual: boolean; jogo_volta_de: string | null;
};
export type Sorteios = Record<string, string[]>;            // chave 'geral' | 'grupo:A' | 'extra:3' → time_ids na ordem sorteada
