// API: criar inscrição pública (sem login necessário)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data, error } = await supabase.from('inscricoes').insert({
      // TODO: resolver time_id a partir do body ou criar novo time
      time_id: body.time_id,
      campeonato_id: body.campeonato_id,
      categoria: body.categoria || 'Adulto',
      status: 'pendente',
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
