import sharp from 'sharp';

/**
 * Escudo de time ou de campeonato: gira conforme o EXIF e encaixa num quadrado de 512 px
 * sem cortar nada, com o fundo transparente preservado (PNG).
 */
export async function prepararEscudo(bytes: Uint8Array): Promise<Uint8Array> {
  const saida = await sharp(bytes)
    .rotate()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return new Uint8Array(saida);
}
