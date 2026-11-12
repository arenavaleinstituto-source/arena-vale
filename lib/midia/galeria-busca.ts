import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import {
  deAlbum,
  deFoto,
  SELECT_ALBUM,
  SELECT_FOTO,
  UUID_RE,
  type AlbumGaleria,
  type FotoGaleria,
  type LinhaAlbum,
  type LinhaFoto,
} from './galeria';

/**
 * Álbuns ativos com pelo menos 1 foto, do mais novo ao mais antigo.
 * `pagina` começa em 1. Sem a tabela (SQL ainda não rodado) devolve vazio.
 */
export async function buscarAlbuns(
  limite: number,
  pagina = 1,
  sb: SupabaseClient = createPublicClient(),
): Promise<AlbumGaleria[]> {
  try {
    const { data, error } = await sb
      .from('galeria_albuns')
      .select(SELECT_ALBUM)
      .eq('ativo', true)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500);
    if (error || !data) return [];
    const inicio = (Math.max(1, pagina) - 1) * limite;
    return (data as unknown as LinhaAlbum[])
      .map(deAlbum)
      .filter((a) => a.totalFotos > 0)
      .slice(inicio, inicio + limite);
  } catch {
    return [];
  }
}

/** Um álbum ativo e as fotos dele; inexistente ou escondido → null. */
export async function buscarAlbum(
  id: string,
  sb: SupabaseClient = createPublicClient(),
): Promise<{ album: AlbumGaleria; fotos: FotoGaleria[] } | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    const [rAlbum, rFotos] = await Promise.all([
      sb.from('galeria_albuns').select(SELECT_ALBUM).eq('id', id).eq('ativo', true).maybeSingle(),
      sb.from('galeria_fotos').select(SELECT_FOTO).eq('album_id', id).order('created_at'),
    ]);
    if (rAlbum.error || !rAlbum.data) return null;
    const fotos = rFotos.error || !rFotos.data ? [] : (rFotos.data as unknown as LinhaFoto[]).map(deFoto);
    return { album: deAlbum(rAlbum.data as unknown as LinhaAlbum), fotos };
  } catch {
    return null;
  }
}

/** "origem-jogoRef" → id do álbum, só dos álbuns ativos com foto (para o "Ver fotos" da agenda). */
export async function albunsDosJogos(sb: SupabaseClient = createPublicClient()): Promise<Record<string, string>> {
  try {
    const { data, error } = await sb
      .from('galeria_albuns')
      .select(SELECT_ALBUM)
      .eq('ativo', true)
      .not('jogo_ref', 'is', null)
      .order('data', { ascending: false })
      .limit(200);
    if (error || !data) return {};
    const mapa: Record<string, string> = {};
    for (const a of (data as unknown as LinhaAlbum[]).map(deAlbum)) {
      if (a.origem && a.jogoRef && a.totalFotos > 0) mapa[`${a.origem}-${a.jogoRef}`] = a.id;
    }
    return mapa;
  } catch {
    return {};
  }
}
