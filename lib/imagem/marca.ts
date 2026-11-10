import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

let logoCache: Buffer | null = null;
async function logo(): Promise<Buffer> {
  logoCache ??= await readFile(path.join(process.cwd(), 'public', 'logo.png'));
  return logoCache;
}

/**
 * Carimba a logo da ARENA VALE no canto de cima, à direita (como a marca de um canal de TV).
 * A logo ocupa ~17% da largura, com cantos arredondados. Devolve sempre JPEG.
 */
export async function carimbarLogo(bytes: Uint8Array): Promise<Uint8Array> {
  const base = sharp(bytes).rotate();
  const { width = 0, height = 0 } = await base.metadata();
  // Depois do rotate() a largura/altura podem trocar (fotos de celular "deitadas").
  const girada = await base.jpeg({ quality: 90 }).toBuffer();
  const meta = await sharp(girada).metadata();
  const w = meta.width ?? width;
  const h = meta.height ?? height;

  const larg = Math.max(70, Math.round(Math.min(w, h * 1.4) * 0.17));
  const alt = Math.round((larg * 276) / 614);
  const raio = Math.round(alt * 0.14);
  const margem = Math.max(8, Math.round(w * 0.025));
  const mascara = Buffer.from(`<svg width="${larg}" height="${alt}"><rect width="${larg}" height="${alt}" rx="${raio}" ry="${raio}" fill="#fff" fill-opacity="0.92"/></svg>`);
  const selo = await sharp(await logo())
    .resize(larg, alt)
    .ensureAlpha()
    .composite([{ input: mascara, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const saida = await sharp(girada)
    .composite([{ input: selo, top: margem, left: Math.max(0, w - larg - margem) }])
    .jpeg({ quality: 88 })
    .toBuffer();
  return new Uint8Array(saida);
}
