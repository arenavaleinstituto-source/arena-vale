/**
 * Reduz a foto no próprio navegador (lado maior até `lado` px, JPEG), respeitando a
 * rotação do EXIF. Fica abaixo do limite de 4,5 MB por envio da Vercel.
 * Sem canvas (ou em erro), devolve o arquivo original.
 */
export async function reduzirNoNavegador(arquivo: File, lado = 2400, qualidade = 0.9): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', qualidade));
    return blob ?? arquivo;
  } catch {
    return arquivo;
  }
}
