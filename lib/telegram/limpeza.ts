import type { SupabaseClient } from '@supabase/supabase-js';

const PREFIXO = '/storage/v1/object/public/noticias/';

/** Caminho dentro do bucket `noticias` a partir do endereço público. */
export function caminhoNoBucket(url: string): string | null {
  const i = url.indexOf(PREFIXO);
  return i === -1 ? null : decodeURIComponent(url.slice(i + PREFIXO.length).split('?')[0]);
}

/**
 * Apaga do bucket os vídeos vencidos e limpa `video_url` (spec 2026-11-08, 4.5).
 * A notícia continua no catálogo: com link, toca pelo link; sem link, vira foto.
 */
export async function apagarVideosVencidos(admin: SupabaseClient): Promise<number> {
  const { data, error } = await admin
    .from('noticias')
    .select('id, video_url')
    .not('video_url', 'is', null)
    .lt('video_expira_em', new Date().toISOString())
    .limit(500);
  if (error || !data?.length) return 0;
  const linhas = data as { id: string; video_url: string }[];
  const caminhos = linhas.map((l) => caminhoNoBucket(l.video_url)).filter((c): c is string => !!c);
  if (caminhos.length) await admin.storage.from('noticias').remove(caminhos);
  await admin
    .from('noticias')
    .update({ video_url: null, video_expira_em: null })
    .in(
      'id',
      linhas.map((l) => l.id),
    );
  return linhas.length;
}
