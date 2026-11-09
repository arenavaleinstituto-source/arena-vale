import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { apagarVideosVencidos } from '@/lib/telegram/limpeza';
import { segredoConfere } from '@/lib/telegram/segredo';

export const dynamic = 'force-dynamic';

/** GET /api/cron/videos — rotina diária da Vercel: apaga os vídeos vencidos (spec 2026-11-08, 4.5). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('authorization') ?? '';
  if (!segredoConfere(auth.replace(/^Bearer /, ''), process.env.CRON_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const removidos = await apagarVideosVencidos(createAdminClient());
  return NextResponse.json({ removidos });
}
