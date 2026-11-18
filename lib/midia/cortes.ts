import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import type { Giro, VideoYT } from './youtube';

export { capaVertical } from './youtube';

/** Marca nos cortes o giro que a coordenação escolheu (vídeos publicados deitados no YouTube). */
export function aplicarGiros(cortes: VideoYT[], giros: Record<string, Giro>): VideoYT[] {
  return cortes.map((c) => (giros[c.id] ? { ...c, giro: giros[c.id] } : c));
}

/** video_id → giro, da tabela cortes_posicao (migração 0024). Qualquer falha: nenhum giro. */
export async function buscarGirosDosCortes(sb?: SupabaseClient): Promise<Record<string, Giro>> {
  try {
    const { data, error } = await (sb ?? createPublicClient()).from('cortes_posicao').select('video_id, giro');
    if (error || !data) return {};
    return Object.fromEntries((data as { video_id: string; giro: Giro }[]).map((l) => [l.video_id, l.giro]));
  } catch {
    return {};
  }
}
