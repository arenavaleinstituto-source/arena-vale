import { NextResponse } from 'next/server';
import { jogosRecentes } from '@/lib/midia/agenda';

export const dynamic = 'force-dynamic';

/** GET /api/galeria/jogos — jogos dos últimos 7 dias e de hoje (para criar álbum no painel). */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ jogos: await jogosRecentes(7) });
}
