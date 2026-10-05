import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    const body = contentType.includes('application/json')
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    const timeId = String(body.time_id ?? '').trim();
    const campeonatoId = String(body.campeonato_id ?? '').trim();

    if (!timeId || !campeonatoId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Informe time_id e campeonato_id.',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inscricoes')
      .insert({
        time_id: timeId,
        campeonato_id: campeonatoId,
        categoria: String(body.categoria ?? 'Adulto'),
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(
        new URL('/?inscricao=sucesso#cadastro', req.url)
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao criar inscrição.';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
