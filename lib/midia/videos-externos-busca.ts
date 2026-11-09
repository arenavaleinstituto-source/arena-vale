import { createPublicClient } from '@/lib/supabase/server';
import type { VideoExterno } from './videos-externos';

/** Vídeos externos ativos, os mais recentes primeiro. Sem a tabela (banco antigo) ou em erro: lista vazia. */
export async function buscarVideosExternos(limite = 20): Promise<VideoExterno[]> {
  try {
    const { data, error } = await createPublicClient()
      .from('videos_externos')
      .select('id,titulo,link,capa_url,plataforma,publicado_em')
      .eq('ativo', true)
      .order('publicado_em', { ascending: false })
      .limit(limite);
    if (error || !data) return [];
    return data as VideoExterno[];
  } catch {
    return [];
  }
}
