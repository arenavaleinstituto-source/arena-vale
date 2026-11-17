import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { processarMensagem } from '@/lib/whatsapp/processar';
import { portasWA } from '@/lib/whatsapp/portas';
import type { WaPayload } from '@/lib/whatsapp/extrair';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/whatsapp — verificação do webhook pela Meta (registro inicial).
 * A Meta envia hub.mode=subscribe + hub.verify_token + hub.challenge.
 * Responde com o challenge se o token conferir.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (
    sp.get('hub.mode') === 'subscribe' &&
    verifyToken &&
    sp.get('hub.verify_token') === verifyToken
  ) {
    return new NextResponse(sp.get('hub.challenge') ?? '', { status: 200 });
  }
  return NextResponse.json({ ok: false }, { status: 403 });
}

/**
 * POST /api/whatsapp — recebe eventos da Cloud API (mensagens, status).
 * Verifica a assinatura HMAC-SHA256 antes de processar.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();

  if (!verificarAssinatura(body, req.headers.get('x-hub-signature-256'), process.env.WHATSAPP_APP_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body) as WaPayload;
    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ ok: true });
    }

    const origem = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const portas = portasWA(createAdminClient());

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const msgs = change.value?.messages;
        if (!msgs?.length) continue;
        for (const msg of msgs) {
          await processarMensagem(msg, portas, origem);
        }
      }
    }
  } catch (e) {
    console.error('[whatsapp] erro no webhook', e);
    // Sempre 200 para a Meta: um erro aqui não deve fazê-la reenviar a mesma mensagem.
  }

  return NextResponse.json({ ok: true });
}

/** Verifica assinatura HMAC-SHA256: `x-hub-signature-256: sha256=<hex>`. */
function verificarAssinatura(body: string, header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const esperado = createHmac('sha256', secret).update(body).digest('hex');
  const recebido = header.replace(/^sha256=/, '');
  if (esperado.length !== recebido.length) return false;
  try {
    return timingSafeEqual(Buffer.from(esperado, 'hex'), Buffer.from(recebido, 'hex'));
  } catch {
    return false;
  }
}
