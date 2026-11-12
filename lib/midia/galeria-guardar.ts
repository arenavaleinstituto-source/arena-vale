import type { SupabaseClient } from '@supabase/supabase-js';
import { prepararFotoGaleria } from '@/lib/imagem/galeria';
import { deFoto, SELECT_FOTO, type FotoGaleria, type LinhaFoto } from './galeria';

/**
 * Prepara a foto (gira, reduz, logo), guarda os dois tamanhos no bucket `galeria`,
 * registra a linha e, se o álbum ainda não tem capa, usa esta. Só no servidor (service role).
 */
export async function guardarFotoNoAlbum(
  admin: SupabaseClient,
  album: { id: string; capa_url: string | null },
  bytes: Uint8Array,
  perfilId: string | null,
): Promise<FotoGaleria> {
  const p = await prepararFotoGaleria(bytes);
  const nome = crypto.randomUUID();
  const caminho = `${album.id}/${nome}.jpg`;
  const caminhoMini = `${album.id}/${nome}-m.jpg`;
  const bucket = admin.storage.from('galeria');
  const r1 = await bucket.upload(caminho, p.grande, { contentType: 'image/jpeg' });
  if (r1.error) throw new Error(r1.error.message);
  const r2 = await bucket.upload(caminhoMini, p.miniatura, { contentType: 'image/jpeg' });
  if (r2.error) throw new Error(r2.error.message);
  const url = bucket.getPublicUrl(caminho).data.publicUrl;
  const miniatura = bucket.getPublicUrl(caminhoMini).data.publicUrl;

  const { data: linha, error } = await admin
    .from('galeria_fotos')
    .insert({ album_id: album.id, url, miniatura_url: miniatura, largura: p.largura, altura: p.altura, enviado_por: perfilId })
    .select(SELECT_FOTO)
    .single();
  if (error || !linha) throw new Error(error?.message ?? 'insert sem retorno');
  if (!album.capa_url) await admin.from('galeria_albuns').update({ capa_url: url }).eq('id', album.id);
  return deFoto(linha as unknown as LinhaFoto);
}
