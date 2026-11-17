import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';
import { portasCampeonato } from '@/lib/campeonatos/portas';
import { gerar } from '@/lib/campeonatos/servico';
import type { FormaDisputa } from '@/lib/campeonatos/tipos';

export const dynamic = 'force-dynamic';

type Corpo = {
  forma?: FormaDisputa;
  grupos?: Record<string, string[]>;
  sementes?: string[];
  formaMudou?: boolean;
  simular?: boolean;
};

function erro(status: number, mensagem: string) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

/** POST /api/campeonatos/[id]/gerar — cria (ou recria) os jogos. Só coordenação e moderador do campeonato. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return erro(400, 'Campeonato inválido.');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return erro(401, 'Entre de novo no painel.');
  const { data: pode } = await supabase.rpc('pode_editar_campeonato', { c: id });
  if (pode !== true) return erro(403, 'Sem permissão.');

  const corpo = (await req.json().catch(() => null)) as Corpo | null;
  if (!corpo?.forma || typeof corpo.forma !== 'object') return erro(400, 'Escolha a forma de disputa.');

  try {
    const r = await gerar(id, portasCampeonato(createAdminClient()), {
      forma: corpo.forma,
      grupos: corpo.grupos,
      sementes: corpo.sementes,
      formaMudou: corpo.formaMudou === true,
      aleatorio: Math.random,
      simular: corpo.simular !== false,
    });
    if ('erro' in r) return erro(400, r.erro);
    return NextResponse.json({ ok: true, jogos: r.jogos, avisos: r.avisos });
  } catch (e) {
    console.error('[campeonatos] falha ao gerar jogos', e);
    return erro(500, 'Não consegui gerar os jogos.');
  }
}
