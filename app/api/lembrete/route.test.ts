import { beforeEach, describe, expect, it, vi } from 'vitest';

const buscar = vi.fn();
vi.mock('@/lib/midia/agenda', () => ({ buscarItemAgenda: (...a: unknown[]) => buscar(...a) }));

import { GET } from './route';

const ID = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
const pedido = (q: string) => new Request(`https://site.test/api/lembrete?${q}`) as never;

describe('GET /api/lembrete', () => {
  beforeEach(() => buscar.mockReset());

  it('item existente: 200 com arquivo de calendário', async () => {
    buscar.mockResolvedValue({
      id: ID, origem: 'agenda', modalidade: null, fase: null, casa: 'A', fora: 'B',
      dataHora: '2026-11-15T22:30:00.000Z', local: null, transmissao: true,
    });
    const r = await GET(pedido(`origem=agenda&id=${ID}`));
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/calendar');
    expect(r.headers.get('content-disposition')).toContain('attachment');
    expect(await r.text()).toContain('BEGIN:VEVENT');
    expect(buscar).toHaveBeenCalledWith('agenda', ID);
  });

  it('item inexistente: 404', async () => {
    buscar.mockResolvedValue(null);
    expect((await GET(pedido(`origem=jogos&id=${ID}`))).status).toBe(404);
  });

  it('origem inválida: 400', async () => {
    expect((await GET(pedido(`origem=xyz&id=${ID}`))).status).toBe(400);
    expect(buscar).not.toHaveBeenCalled();
  });

  it('id que não é uuid: 400', async () => {
    expect((await GET(pedido('origem=agenda&id=1;drop'))).status).toBe(400);
  });
});
