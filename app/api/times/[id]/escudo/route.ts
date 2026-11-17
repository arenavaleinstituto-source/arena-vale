import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { UUID_RE } from '@/lib/midia/galeria';
import { guardarEscudo, lerArquivoDoFormulario } from '@/lib/imagem/receber-escudo';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COR_RE = /^#[0-9a-f]{6}$/i;

function erro(status: number, mensagem: string) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

/** POST /api/times/[id]/escudo (multipart: arquivo, cor opcional) — só o capitão do time. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return erro(400, 'Time inválido.');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return erro(401, 'Entre de novo no painel.');
  const { data: pode } = await supabase.rpc('pode_trocar_escudo', { t: id });
  if (pode !== true) return erro(403, 'Só o capitão do time troca o escudo.');

  const fd = await req.formData().catch(() => null);
  const lido = lerArquivoDoFormulario(fd);
  if ('erro' in lido) return erro(400, lido.erro);
  const cor = String(fd?.get('cor') ?? '');

  try {
    const admin = createAdminClient();
    const url = await guardarEscudo(admin, 'times', id, lido.arquivo);
    const mudanca: Record<string, string> = { escudo_url: url };
    if (COR_RE.test(cor)) mudanca.escudo_cor = cor.toLowerCase();
    const { error } = await admin.from('times').update(mudanca).eq('id', id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error('[times] falha ao guardar escudo', e);
    return erro(500, 'Não consegui guardar o escudo.');
  }
}
