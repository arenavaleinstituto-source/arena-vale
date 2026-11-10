import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { carimbarLogo } from './marca';

async function foto(w: number, h: number) {
  return new Uint8Array(await sharp({ create: { width: w, height: h, channels: 3, background: '#2080ff' } }).jpeg().toBuffer());
}
async function cor(bytes: Uint8Array, x: number, y: number) {
  const { data, info } = await sharp(bytes).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

describe('carimbarLogo', () => {
  it('põe a logo no canto de cima à direita, devolve JPEG do mesmo tamanho', async () => {
    const saida = await carimbarLogo(await foto(1000, 800));
    const meta = await sharp(saida).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1000, 800]);
    const canto = await cor(saida, 1000 - 60, 40);
    expect(canto[2]).toBeLessThan(120); // fundo escuro da logo, não o azul da foto
    const meio = await cor(saida, 500, 600);
    expect(meio[2]).toBeGreaterThan(200); // resto da foto intacto
  });

  it('foto pequena também recebe a logo sem erro', async () => {
    const saida = await carimbarLogo(await foto(200, 150));
    expect((await sharp(saida).metadata()).width).toBe(200);
  });
});
