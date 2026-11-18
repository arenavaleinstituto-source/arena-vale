import { describe, expect, it } from 'vitest';
import { areaDeRecorte } from './recorte';

describe('areaDeRecorte', () => {
  it('centro, deslocamento e zoom', () => {
    expect(areaDeRecorte(1000, 500, 1, 0, 0)).toEqual({ sx: 250, sy: 0, lado: 500 });
    expect(areaDeRecorte(1000, 500, 1, 1, 0).sx).toBe(500);
    expect(areaDeRecorte(1000, 500, 1, -1, 0).sx).toBe(0);
    expect(areaDeRecorte(1000, 500, 2, 0, 0).lado).toBe(250);
  });
  it('zoom menor que 1 vira 1; x e y limitados', () => {
    expect(areaDeRecorte(1000, 500, 0.3, 0, 0).lado).toBe(500);
    expect(areaDeRecorte(1000, 500, 1, 5, 0).sx).toBe(500);
    expect(areaDeRecorte(1000, 500, 1, -5, 0).sx).toBe(0);
    expect(areaDeRecorte(500, 1000, 1, 0, 9).sy).toBe(500);
  });
  it('arredonda e fica dentro da imagem', () => {
    const r = areaDeRecorte(1001, 333, 1.7, 0.37, -0.81);
    expect(Number.isInteger(r.sx) && Number.isInteger(r.sy) && Number.isInteger(r.lado)).toBe(true);
    expect(r.sx).toBeGreaterThanOrEqual(0);
    expect(r.sy).toBeGreaterThanOrEqual(0);
    expect(r.sx + r.lado).toBeLessThanOrEqual(1001);
    expect(r.sy + r.lado).toBeLessThanOrEqual(333);
  });
});
