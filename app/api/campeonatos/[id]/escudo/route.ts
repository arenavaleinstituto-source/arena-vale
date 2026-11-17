import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';
import { guardarEscudo, lerArquivoDoFormulario } from '@/lib/imagem/receber-escudo';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function erro(status: number, mensagem: string) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

/** POST /api/campeonatos/[id]/escudo (multipart: arquivo) — coordenação e moderador do campeonato. */
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

  const lido = lerArquivoDoFormulario(await req.formData().catch(() => null));
  if ('erro' in lido) return erro(400, lido.erro);

  try {
    const admin = createAdminClient();
    const url = await guardarEscudo(admin, 'campeonatos', id, lido.arquivo);
    const { error } = await admin.from('campeonatos').update({ logo_url: url }).eq('id', id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error('[campeonatos] falha ao guardar escudo', e);
    return erro(500, 'Não consegui guardar o escudo.');
  }
}
