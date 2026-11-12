import sharp from 'sharp';
import { carimbarLogo } from './marca';

/**
 * Foto da galeria: gira conforme o EXIF, reduz para no máximo 2000 px (sem ampliar)
 * e carimba a logo; a miniatura (600 px no lado maior) fica sem logo.
 */
export async function prepararFotoGaleria(
  bytes: Uint8Array,
): Promise<{ grande: Uint8Array; miniatura: Uint8Array; largura: number; altura: number }> {
  const reduzida = await sharp(bytes)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .toBuffer();
  const grande = await carimbarLogo(new Uint8Array(reduzida));
  const meta = await sharp(grande).metadata();
  const miniatura = await sharp(reduzida)
    .resize({ width: 600, height: 600, fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  return {
    grande,
    miniatura: new Uint8Array(miniatura),
    largura: meta.width ?? 0,
    altura: meta.height ?? 0,
  };
}
