/**
 * Reduz a imagem para no máximo `max` px no lado maior, em JPEG (spec 2026-11-08, 4.2).
 * No navegador sem canvas (ou em erro), devolve o arquivo original.
 */
export async function reduzirImagem(arquivo: File, max = 1200): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
    return blob ?? arquivo;
  } catch {
    return arquivo;
  }
}

/** Captura o quadro atual de um <video> como JPEG (capa do vídeo escolhida pelo editor). */
export async function capturarQuadro(video: HTMLVideoElement, max = 1200): Promise<Blob | null> {
  const escala = Math.min(1, max / Math.max(video.videoWidth || 1, video.videoHeight || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * escala);
  canvas.height = Math.round(video.videoHeight * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.width) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
}
