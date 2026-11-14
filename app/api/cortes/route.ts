import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { buscarCortesYT } from '@/lib/midia/youtube';
import { lerConfigSite } from '@/lib/midia/config';

/** Lista de Shorts do canal + IDs ocultos — usada pela aba Cortes do painel. */
export async function GET() {
  try {
    const config = await lerConfigSite();
    const [cortes, { data }] = await Promise.all([
      buscarCortesYT(config.youtubeChannelId),
      createPublicClient().from('cortes_ocultos').select('video_id'),
    ]);
    const ocultos = (data ?? []).map((r: { video_id: string }) => r.video_id);
    return NextResponse.json({ cortes, ocultos });
  } catch {
    return NextResponse.json({ cortes: [], ocultos: [] });
  }
}
