import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lerConfigSite } from '@/lib/midia/config';
import { buscarCortesYT } from '@/lib/midia/youtube';

export const dynamic = 'force-dynamic';

/** GET /api/cortes — cortes do canal para a coordenação marcar os que foram publicados deitados. */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ cortes: [], erro: 'Entre de novo no painel.' }, { status: 401 });
  const { data: staff } = await supabase.rpc('is_staff');
  if (staff !== true) return NextResponse.json({ cortes: [], erro: 'Só a coordenação.' }, { status: 403 });
  try {
    const config = await lerConfigSite();
    return NextResponse.json({ cortes: await buscarCortesYT(config.youtubeChannelId, 30) });
  } catch {
    return NextResponse.json({ cortes: [] });
  }
}
