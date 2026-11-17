const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Quadrado de recorte dentro da imagem. zoom 1 = maior quadrado que cabe; x e y deslocam o centro (-1 a 1).
export function areaDeRecorte(
  largura: number, altura: number, zoom: number, x: number, y: number,
): { sx: number; sy: number; lado: number } {
  const z = Number.isFinite(zoom) ? Math.max(1, zoom) : 1;
  const dx = limitar(Number.isFinite(x) ? x : 0, -1, 1);
  const dy = limitar(Number.isFinite(y) ? y : 0, -1, 1);
  const lado = Math.max(1, Math.min(Math.round(Math.min(largura, altura) / z), Math.min(largura, altura)));
  const sx = limitar(Math.round(((largura - lado) / 2) * (1 + dx)), 0, Math.max(0, largura - lado));
  const sy = limitar(Math.round(((altura - lado) / 2) * (1 + dy)), 0, Math.max(0, altura - lado));
  return { sx, sy, lado };
}
