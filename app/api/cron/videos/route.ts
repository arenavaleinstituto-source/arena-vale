import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { apagarVideosVencidos } from '@/lib/telegram/limpeza';
import { segredoConfere } from '@/lib/telegram/segredo';
import { renovarChaveInstagram } from '@/lib/instagram/portas';

export const dynamic = 'force-dynamic';

/** GET /api/cron/videos — rotina diária da Vercel: apaga os vídeos vencidos (spec 2026-11-08, 4.5) e renova a chave do Instagram. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('authorization') ?? '';
  if (!segredoConfere(auth.replace(/^Bearer /, ''), process.env.CRON_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const admin = createAdminClient();
  const removidos = await apagarVideosVencidos(admin);
  const instagram = await renovarChaveInstagram(admin).catch((e) => {
    console.error('[instagram] falha ao renovar a chave', e);
    return 'erro';
  });
  return NextResponse.json({ removidos, instagram });
}
