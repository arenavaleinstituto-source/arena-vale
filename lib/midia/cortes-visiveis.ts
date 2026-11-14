import { createPublicClient } from '@/lib/supabase/server';
import { buscarCortesYT, type VideoYT } from './youtube';

/** Cortes do canal filtrados pelos IDs que a coordenação ocultou. */
export async function buscarCortesVisiveis(channelId: string): Promise<VideoYT[]> {
  const [todos, { data }] = await Promise.all([
    buscarCortesYT(channelId),
    createPublicClient().from('cortes_ocultos').select('video_id'),
  ]);
  const ocultos = new Set((data ?? []).map((r: { video_id: string }) => r.video_id));
  return todos.filter((c) => !ocultos.has(c.id));
}
