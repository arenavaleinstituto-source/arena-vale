import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';
import { portasCampeonato } from '@/lib/campeonatos/portas';
import { recalcular } from '@/lib/campeonatos/servico';

export const dynamic = 'force-dynamic';

/**
 * POST /api/campeonatos/[id]/recalcular — recalcula as vagas a partir dos jogos do banco.
 * Basta estar logado: o delegado perde o cargo no instante em que finaliza o jogo, e o
 * recálculo não recebe nada além do id (só deriva dos dados já gravados).
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ ok: false, erro: 'Campeonato inválido.' }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, erro: 'Entre de novo no painel.' }, { status: 401 });
  try {
    const { avisos } = await recalcular(id, portasCampeonato(createAdminClient()));
    return NextResponse.json({ ok: true, avisos });
  } catch (e) {
    console.error('[campeonatos] falha ao recalcular', e);
    return NextResponse.json({ ok: false, erro: 'Não consegui atualizar a classificação.' }, { status: 500 });
  }
}
