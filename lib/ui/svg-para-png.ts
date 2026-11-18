/** Desenha um SVG numa Image e num canvas e devolve um PNG quadrado de `lado` px (só no navegador). */
export function svgParaPng(svg: string, lado = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = lado;
      canvas.height = lado;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Este navegador não consegue gerar a imagem.'));
      ctx.drawImage(img, 0, 0, lado, lado);
      canvas.toBlob((png) => (png ? resolve(png) : reject(new Error('Não consegui gerar a imagem do escudo.'))), 'image/png');
    };
    img.onerror = () => reject(new Error('Não consegui desenhar o escudo.'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
