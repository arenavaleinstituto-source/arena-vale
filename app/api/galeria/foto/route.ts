import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';
import { guardarFotoNoAlbum } from '@/lib/midia/galeria-guardar';

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
    const foto = await guardarFotoNoAlbum(admin, album as { id: string; capa_url: string | null }, new Uint8Array(await arquivo.arrayBuffer()), user.id);
    return NextResponse.json({ ok: true, foto });
  } catch (e) {
    console.error('[galeria] falha ao guardar foto', e);
    return erro(500, 'Não consegui guardar a foto.');
  }
}
