import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { montarParceiro } from './parceiro';

async function cor(bytes: Uint8Array, x: number, y: number) {
  const { data, info } = await sharp(bytes).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

describe('montarParceiro', () => {
  it('mantém a imagem e acrescenta a faixa de crédito embaixo', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#2080ff' } }).jpeg().toBuffer(),
    );
    const saida = await montarParceiro(entrada, 'egidio');
    const meta = await sharp(saida).metadata();
    const faixa = Math.round(1080 * 0.11);
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1080, 1080 + faixa]);
    const [r, g, b] = await cor(saida, 1080 / 2, 1080 + Math.round(faixa / 2));
    expect(Math.max(r, g, b)).toBeLessThan(40);
    const topo = await cor(saida, 540, 1080 + 1);
    expect(topo[0]).toBeGreaterThan(180);
    expect(topo[1]).toBeLessThan(60);
    const foto = await cor(saida, 300, 700);
    expect(foto[2]).toBeGreaterThan(200);
  });

  it('não cobre nenhum canto da imagem do parceiro (a marca do autor fica visível)', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#2080ff' } }).jpeg().toBuffer(),
    );
    const saida = await montarParceiro(entrada, 'egidio');
    for (const [x, y] of [[1080 - 60, 40], [40, 40], [40, 1040], [1040, 1040]]) {
      const [, , b] = await cor(saida, x, y);
      expect(b).toBeGreaterThan(200);
    }
  });

  it('a logo da ARENA VALE fica dentro da faixa, à direita', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#000000' } }).jpeg().toBuffer(),
    );
    const saida = await montarParceiro(entrada, 'egidio');
    const faixa = Math.round(1080 * 0.11);
    const { data, info } = await sharp(saida)
      .extract({ left: 1080 - 300, top: 1080 + Math.round(faixa * 0.15), width: 300, height: Math.round(faixa * 0.7) })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let claros = 0;
    for (let i = 0; i < data.length; i += info.channels) if (data[i] > 150) claros += 1;
    expect(claros).toBeGreaterThan(300);
  });

  it('o texto do crédito aparece na faixa (pixels claros)', async () => {
    const entrada = new Uint8Array(
      await sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#000000' } }).jpeg().toBuffer(),
    );
    const saida = await montarParceiro(entrada, 'egidiobeckhausersc');
    const faixa = Math.round(1080 * 0.11);
    const { data, info } = await sharp(saida)
      .extract({ left: 0, top: 1080 + Math.round(faixa * 0.1), width: 1080, height: faixa - Math.round(faixa * 0.1) })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let claros = 0;
    for (let i = 0; i < data.length; i += info.channels) if (data[i] > 200) claros += 1;
    expect(claros).toBeGreaterThan(500);
  });
});
