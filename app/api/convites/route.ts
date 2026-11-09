import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { lerCargo } from '@/lib/auth/cargo';
import { convidar, portasSupabase, type EntradaConvite } from '@/lib/auth/convites';

type Corpo = { ok: boolean; erro?: string; jaTinhaConta?: boolean };

function responder(corpo: Corpo, status = 200): NextResponse {
  return NextResponse.json(corpo, { status });
}

/**
 * POST /api/convites — { email, cargo, campeonatoId? } (spec 5.3).
 * O tipo de retorno é explícito: sem ele, a checagem de tipos do `next build`
 * estourava a memória tentando inferir a união das respostas.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let corpo: Partial<EntradaConvite>;
  try {
    corpo = await req.json();
  } catch {
    return responder({ ok: false, erro: 'Pedido inválido.' }, 400);
  }
  if (!corpo.email || !corpo.cargo || !['coordenador', 'moderador', 'capitao'].includes(corpo.cargo)) {
    return responder({ ok: false, erro: 'Informe o e-mail e o cargo.' }, 400);
  }

  const quemChama = await lerCargo(await createClient());
  try {
    const resultado = await convidar(
      { email: corpo.email, cargo: corpo.cargo, campeonatoId: corpo.campeonatoId ?? null },
      { quemChama, origem: req.nextUrl.origin, ...portasSupabase(createAdminClient()) },
    );
    if (!resultado.ok) return responder({ ok: false, erro: resultado.erro }, resultado.status);
    return responder({ ok: true, jaTinhaConta: resultado.jaTinhaConta });
  } catch (e) {
    return responder({ ok: false, erro: (e as Error).message || 'Não foi possível enviar o convite.' }, 500);
  }
}
