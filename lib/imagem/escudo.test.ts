import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { prepararEscudo } from './escudo';

/** 800×400 com fundo transparente e um quadrado vermelho opaco no meio. */
async function imagemDeTeste(): Promise<Uint8Array> {
  const quadrado = await sharp({ create: { width: 200, height: 200, channels: 4, background: { r: 229, g: 9, b: 20, alpha: 1 } } }).png().toBuffer();
  const buf = await sharp({ create: { width: 800, height: 400, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: quadrado, left: 300, top: 100 }])
    .png()
    .toBuffer();
  return new Uint8Array(buf);
}

describe('prepararEscudo', () => {
  it('sai quadrado de 512 px em PNG, com o fundo transparente preservado', async () => {
    const saida = await prepararEscudo(await imagemDeTeste());
    const meta = await sharp(saida).metadata();
    expect(meta.width).toBe(512);
    expect(meta.height).toBe(512);
    expect(meta.format).toBe('png');
    expect(meta.hasAlpha).toBe(true);

    const { data, info } = await sharp(saida).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(data[3]).toBe(0); // canto (0,0) transparente
    const centro = (256 * info.width + 256) * info.channels;
    expect(data[centro + 3]).toBe(255); // o desenho continua opaco no meio
  });
});
