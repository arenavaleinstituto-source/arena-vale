import { createPublicClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';

export const dynamic = 'force-dynamic';

function naoEncontrada() {
  return new Response('Foto não encontrada', { status: 404 });
}

/**
 * GET /api/galeria/baixar?id=<foto> — baixa a foto grande como anexo.
 * Lida com o cliente público: foto de álbum escondido não aparece (RLS) e dá 404.
 */
export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!UUID_RE.test(id)) return naoEncontrada();
  const { data: foto } = await createPublicClient().from('galeria_fotos').select('id,url').eq('id', id).maybeSingle();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!foto || !base || !String(foto.url).startsWith(`${base}/storage/v1/object/public/galeria/`)) return naoEncontrada();
  try {
    const r = await fetch(foto.url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok || !r.body) return naoEncontrada();
    return new Response(r.body, {
      headers: {
        'content-type': r.headers.get('content-type') ?? 'image/jpeg',
        'content-disposition': `attachment; filename="arena-vale-${id}.jpg"`,
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch {
    return naoEncontrada();
  }
}
