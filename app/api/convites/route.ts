import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { convidar, portasSupabase, type EntradaConvite } from '@/lib/auth/convites';

/** POST /api/convites — { email, cargo, campeonatoId? } (spec 5.3). */
export async function POST(req: NextRequest) {
  let corpo: Partial<EntradaConvite>;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: 'Pedido inválido.' }, { status: 400 });
  }
  if (!corpo.email || !corpo.cargo || !['coordenador', 'moderador', 'capitao'].includes(corpo.cargo)) {
    return NextResponse.json({ ok: false, erro: 'Informe o e-mail e o cargo.' }, { status: 400 });
  }

  const quemChama = await lerCargo(await createClient());
  try {
    const resultado = await convidar(
      { email: corpo.email, cargo: corpo.cargo, campeonatoId: corpo.campeonatoId ?? null },
      { quemChama, origem: req.nextUrl.origin, ...portasSupabase(createAdminClient()) },
    );
    if (!resultado.ok) return NextResponse.json(resultado, { status: resultado.status });
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: (e as Error).message || 'Não foi possível enviar o convite.' }, { status: 500 });
  }
}
