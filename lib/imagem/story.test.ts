import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { montarStory } from './story';

describe('montarStory', () => {
  it('foto deitada vira imagem em pé 1080x1920 (JPEG), foto inteira no meio', async () => {
    const foto = new Uint8Array(await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#ff2020' } }).jpeg().toBuffer());
    const saida = await montarStory(foto);
    const meta = await sharp(saida).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1080, 1920]);
    const { data, info } = await sharp(saida).raw().toBuffer({ resolveWithObject: true });
    const cor = (x: number, y: number) => data[(y * info.width + x) * info.channels];
    expect(cor(540, 960)).toBeGreaterThan(200); // meio: a foto, vermelha e nítida
    expect(cor(540, 60)).toBeLessThan(200); // topo: fundo desfocado e escurecido
  });
});
