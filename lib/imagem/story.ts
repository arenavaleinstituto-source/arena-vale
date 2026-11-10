import sharp from 'sharp';

const W = 1080;
const H = 1920;

/** Imagem em pé para o Story (1080x1920, JPEG): a foto inteira no meio e ela mesma, desfocada e escura, no fundo. */
export async function montarStory(bytes: Uint8Array): Promise<Uint8Array> {
  const fonte = await sharp(bytes).rotate().toBuffer();
  const fundo = await sharp(fonte).resize(W, H, { fit: 'cover' }).blur(40).modulate({ brightness: 0.45 }).toBuffer();
  const frente = await sharp(fonte).resize(W, Math.round(H * 0.78), { fit: 'inside' }).toBuffer();
  const { width = W, height = H } = await sharp(frente).metadata();
  const saida = await sharp(fundo)
    .composite([{ input: frente, left: Math.round((W - width) / 2), top: Math.round((H - height) / 2) }])
    .jpeg({ quality: 88 })
    .toBuffer();
  return new Uint8Array(saida);
}
