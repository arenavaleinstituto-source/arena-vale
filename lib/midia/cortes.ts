import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import type { Giro, VideoYT } from './youtube';

export { capaVertical } from './youtube';

/** O que a coordenação escolheu para um corte: girar (vídeo publicado deitado) ou esconder do site. */
export type PosicaoCorte = Giro | 'esconder';

/** Tira os cortes escondidos e marca o giro dos que foram publicados deitados. */
export function aplicarGiros(cortes: VideoYT[], posicoes: Record<string, PosicaoCorte>): VideoYT[] {
  return cortes.flatMap((c) => {
    const p = posicoes[c.id];
    if (p === 'esconder') return [];
    return [p ? { ...c, giro: p } : c];
  });
}

/** video_id → giro ou 'esconder', da tabela cortes_posicao (migrações 0024 e 0025). Qualquer falha: nada. */
export async function buscarGirosDosCortes(sb?: SupabaseClient): Promise<Record<string, PosicaoCorte>> {
  try {
    const { data, error } = await (sb ?? createPublicClient()).from('cortes_posicao').select('*');
    if (error || !data) return {};
    const linhas = data as { video_id: string; giro: Giro | null; escondido?: boolean }[];
    return Object.fromEntries(
      linhas.flatMap<[string, PosicaoCorte]>((l) => (l.escondido ? [[l.video_id, 'esconder' as const]] : l.giro ? [[l.video_id, l.giro]] : [])),
    );
  } catch {
    return {};
  }
}
