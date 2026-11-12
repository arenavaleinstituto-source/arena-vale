import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { prepararFotoGaleria } from './galeria';

describe('prepararFotoGaleria', () => {
  it('foto deitada com EXIF de rotação sai em pé, 2000 px e miniatura de 600 px', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 4000, height: 3000, channels: 3, background: '#2080ff' } })
        .jpeg()
        .withMetadata({ orientation: 6 })
        .toBuffer(),
    );
    const r = await prepararFotoGaleria(entrada);
    const g = await sharp(r.grande).metadata();
    const m = await sharp(r.miniatura).metadata();
    expect([g.format, g.width, g.height]).toEqual(['jpeg', 1500, 2000]);
    expect([r.largura, r.altura]).toEqual([1500, 2000]);
    expect(m.format).toBe('jpeg');
    expect(Math.max(m.width ?? 0, m.height ?? 0)).toBe(600);
    expect(m.height).toBeGreaterThan(m.width ?? 0);
  });

  it('PNG pequeno não é ampliado', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 800, height: 600, channels: 4, background: '#ffffff' } }).png().toBuffer(),
    );
    const r = await prepararFotoGaleria(entrada);
    const g = await sharp(r.grande).metadata();
    expect([g.format, g.width, g.height]).toEqual(['jpeg', 800, 600]);
    expect((await sharp(r.miniatura).metadata()).width).toBe(600);
  });
});
