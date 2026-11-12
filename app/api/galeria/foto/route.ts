import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { prepararFotoGaleria } from '@/lib/imagem/galeria';
import { deFoto, SELECT_FOTO, UUID_RE, type LinhaFoto } from '@/lib/midia/galeria';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LIMITE_BYTES = 10 * 1024 * 1024;

function erro(status: number, mensagem: string) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

/** POST /api/galeria/foto (multipart: album_id, arquivo) — só a coordenação. */
export async function POST(req: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return erro(401, 'Entre de novo no painel.');
  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (perfil?.role !== 'coordenador') return erro(403, 'Sem permissão.');

  const fd = await req.formData().catch(() => null);
  const albumId = String(fd?.get('album_id') ?? '');
  const campo = fd?.get('arquivo');
  if (!UUID_RE.test(albumId)) return erro(400, 'Álbum não informado.');
  const arquivo = campo && typeof campo === 'object' && 'arrayBuffer' in campo ? (campo as Blob) : null;
  if (!arquivo || arquivo.size === 0) return erro(400, 'Envie uma foto.');
  if (arquivo.size > LIMITE_BYTES) return erro(400, 'A foto passa de 10 MB.');
  if (arquivo.type && !arquivo.type.startsWith('image/')) return erro(400, 'O arquivo precisa ser uma foto.');

  const admin = createAdminClient();
  const { data: album } = await admin.from('galeria_albuns').select('id,capa_url').eq('id', albumId).maybeSingle();
  if (!album) return erro(400, 'Álbum não encontrado.');

  try {
    const p = await prepararFotoGaleria(new Uint8Array(await arquivo.arrayBuffer()));
    const nome = crypto.randomUUID();
    const caminho = `${albumId}/${nome}.jpg`;
    const caminhoMini = `${albumId}/${nome}-m.jpg`;
    const bucket = admin.storage.from('galeria');
    const r1 = await bucket.upload(caminho, p.grande, { contentType: 'image/jpeg' });
    if (r1.error) throw r1.error;
    const r2 = await bucket.upload(caminhoMini, p.miniatura, { contentType: 'image/jpeg' });
    if (r2.error) throw r2.error;
    const url = bucket.getPublicUrl(caminho).data.publicUrl;
    const miniatura = bucket.getPublicUrl(caminhoMini).data.publicUrl;

    const { data: linha, error } = await admin
      .from('galeria_fotos')
      .insert({ album_id: albumId, url, miniatura_url: miniatura, largura: p.largura, altura: p.altura, enviado_por: user.id })
      .select(SELECT_FOTO)
      .single();
    if (error || !linha) throw error ?? new Error('insert sem retorno');
    if (!album.capa_url) await admin.from('galeria_albuns').update({ capa_url: url }).eq('id', albumId);
    return NextResponse.json({ ok: true, foto: deFoto(linha as unknown as LinhaFoto) });
  } catch (e) {
    console.error('[galeria] falha ao guardar foto', e);
    return erro(500, 'Não consegui guardar a foto.');
  }
}
