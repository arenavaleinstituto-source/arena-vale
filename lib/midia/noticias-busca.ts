import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/server';
import { mapearNoticiaMidia, type Aba, type CategoriaMidia, type NoticiaMidia } from './noticias';

type Opcoes = { aba?: Aba; categoria?: CategoriaMidia; modalidade?: string; limite?: number };

/** O banco oficial ainda sem a 0011 não tem as colunas novas (erro 42703 / PGRST204). */
function faltaColuna(e: { code?: string; message?: string } | null): boolean {
  return !!e && (e.code === '42703' || e.code === 'PGRST204' || /column .* does not exist/i.test(e.message ?? ''));
}

/** Notícias publicadas, das mais recentes para as mais antigas. Funciona com o banco novo e com o antigo. */
export async function buscarNoticiasPublicadas(o: Opcoes = {}, sb: SupabaseClient = createPublicClient()): Promise<NoticiaMidia[]> {
  const limite = o.limite ?? 60;
  try {
    let q = sb.from('noticias').select('*').eq('status', 'publicado');
    if (o.aba) q = q.eq('aba', o.aba);
    if (o.categoria) q = q.eq('categoria', o.categoria);
    if (o.modalidade) q = q.eq('modalidade', o.modalidade);
    const r = await q.order('publicado_em', { ascending: false }).limit(limite);
    if (!r.error) return (r.data ?? []).map((row) => mapearNoticiaMidia(row as Record<string, unknown>));
    if (!faltaColuna(r.error)) return [];

    // Banco antigo: só existe `ativo`, e tudo é da aba ARENA VALE, sem modalidade.
    if (o.aba === 'mundo' || o.modalidade) return [];
    const antigo = await sb.from('noticias').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(limite);
    if (antigo.error) return [];
    return (antigo.data ?? [])
      .map((row) => mapearNoticiaMidia(row as Record<string, unknown>))
      .filter((n) => !o.categoria || n.categoria === o.categoria);
  } catch {
    return [];
  }
}

/** Uma notícia publicada (ou null). */
export async function buscarNoticia(id: string, sb: SupabaseClient = createPublicClient()): Promise<NoticiaMidia | null> {
  try {
    const { data, error } = await sb.from('noticias').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    const n = mapearNoticiaMidia(data as Record<string, unknown>);
    return n.status === 'publicado' ? n : null;
  } catch {
    return null;
  }
}
