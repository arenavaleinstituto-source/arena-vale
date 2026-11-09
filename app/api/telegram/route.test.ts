import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const processar = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/telegram/processar', () => ({ processarUpdate: (...a: unknown[]) => processar(...a) }));
vi.mock('@/lib/telegram/portas', () => ({ portasBot: () => ({}) }));
vi.mock('@/lib/supabase/server', () => ({ createAdminClient: () => ({}) }));

import { POST } from './route';

function pedido(cabecalho?: string) {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (cabecalho) headers.set('x-telegram-bot-api-secret-token', cabecalho);
  return new Request('https://site.test/api/telegram', { method: 'POST', headers, body: JSON.stringify({ message: { text: 'oi' } }) }) as never;
}

describe('POST /api/telegram', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'segredo-certo');
    processar.mockClear();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('sem o cabeçalho do segredo: 401 e não processa', async () => {
    const r = await POST(pedido());
    expect(r.status).toBe(401);
    expect(processar).not.toHaveBeenCalled();
  });

  it('segredo errado: 401', async () => {
    expect((await POST(pedido('outro'))).status).toBe(401);
  });

  it('sem segredo configurado no servidor: 401 (nunca aceita qualquer um)', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', '');
    expect((await POST(pedido(''))).status).toBe(401);
  });

  it('segredo certo: processa e responde 200', async () => {
    const r = await POST(pedido('segredo-certo'));
    expect(r.status).toBe(200);
    expect(processar).toHaveBeenCalledTimes(1);
  });

  it('erro no processamento: ainda 200 (o Telegram não reenvia sem parar)', async () => {
    processar.mockRejectedValueOnce(new Error('x'));
    expect((await POST(pedido('segredo-certo'))).status).toBe(200);
  });
});
