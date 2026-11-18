import { describe, expect, it } from 'vitest';
import { aplicarGiros, buscarGirosDosCortes, capaVertical } from './cortes';
import type { VideoYT } from './youtube';

const v = (id: string): VideoYT => ({ id, titulo: id, publicadoEm: '2026-11-10T10:00:00Z', capa: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, link: '' });

describe('cortes deitados', () => {
  it('aplicarGiros marca só os cortes que a coordenação deitou', () => {
    expect(aplicarGiros([v('a'), v('b')], { b: -90 }).map((c) => [c.id, c.giro ?? null])).toEqual([['a', null], ['b', -90]]);
  });

  it('capaVertical usa a imagem em pé do Short (1080×1920), sem tarjas', () => {
    expect(capaVertical('abc')).toBe('https://i.ytimg.com/vi/abc/oardefault.jpg');
  });

  it('buscarGirosDosCortes devolve o mapa e, se o banco falhar, vazio', async () => {
    const ok = { from: () => ({ select: () => Promise.resolve({ data: [{ video_id: 'x', giro: 90 }], error: null }) }) };
    expect(await buscarGirosDosCortes(ok as never)).toEqual({ x: 90 });
    const falha = { from: () => ({ select: () => Promise.reject(new Error('fora do ar')) }) };
    expect(await buscarGirosDosCortes(falha as never)).toEqual({});
    const semTabela = { from: () => ({ select: () => Promise.resolve({ data: null, error: { message: 'relation does not exist' } }) }) };
    expect(await buscarGirosDosCortes(semTabela as never)).toEqual({});
  });
});
