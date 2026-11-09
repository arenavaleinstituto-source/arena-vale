import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { processarUpdate } from '@/lib/telegram/processar';
import { portasBot } from '@/lib/telegram/portas';
import { segredoConfere } from '@/lib/telegram/segredo';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/telegram — webhook do bot (spec 2026-11-08, seção 4.4).
 * Só aceita pedidos com o cabeçalho secreto combinado no setWebhook.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!segredoConfere(req.headers.get('x-telegram-bot-api-secret-token'), process.env.TELEGRAM_WEBHOOK_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const update = await req.json();
    const origem = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    await processarUpdate(update, portasBot(createAdminClient()), origem);
  } catch {
    // Sempre 200 para o Telegram: um erro aqui não deve fazê-lo reenviar a mesma mensagem sem parar.
  }
  return NextResponse.json({ ok: true });
}
