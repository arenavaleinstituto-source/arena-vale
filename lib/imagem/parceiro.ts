import path from 'node:path';
import sharp from 'sharp';
import { carimbarLogo } from './marca';

const FONTE_FORTE = path.join(process.cwd(), 'public', 'fontes', 'BarlowCondensed-Bold.ttf');
const FONTE_MEDIA = path.join(process.cwd(), 'public', 'fontes', 'BarlowCondensed-Medium.ttf');

function escaparMarkup(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Texto em PNG transparente, com a fonte do site embutida (o servidor pode não ter fontes instaladas). */
async function texto(conteudo: string, cor: string, px: number, forte: boolean, larguraMax: number): Promise<Buffer> {
  const fonte = forte ? 'Barlow Condensed Bold' : 'Barlow Condensed Medium';
  return sharp({
    text: {
      text: `<span foreground="${cor}">${escaparMarkup(conteudo)}</span>`,
      font: `${fonte} ${px}px`,
      fontfile: forte ? FONTE_FORTE : FONTE_MEDIA,
      width: larguraMax,
      dpi: 72,
      rgba: true,
      wrap: 'none',
    },
  })
    .png()
    .toBuffer();
}

/**
 * Arte do parceiro: a imagem original inteira (com a marca do autor), a logo da
 * ARENA VALE no canto e, embaixo, a faixa "Foto e arte: @perfil / Publicado com autorização".
 * Devolve JPEG.
 */
export async function montarParceiro(bytes: Uint8Array, perfil: string): Promise<Uint8Array> {
  const comLogo = await carimbarLogo(bytes);
  const meta = await sharp(comLogo).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const alt = Math.round(w * 0.11);
  const linha = Math.max(1, Math.round(alt * 0.05));
  const margem = Math.round(w * 0.037);
  const px1 = Math.round(alt * 0.28);
  const px2 = Math.round(alt * 0.21);
  const largura = Math.max(10, w - margem * 2);

  const [t1, t2] = await Promise.all([
    texto(`Foto e arte: @${perfil}`, '#ffffff', px1, true, largura),
    texto('Publicado com autorização · ARENA VALE', '#a1a1aa', px2, false, largura),
  ]);
  const [m1, m2] = await Promise.all([sharp(t1).metadata(), sharp(t2).metadata()]);
  const h1 = m1.height ?? px1;
  const h2 = m2.height ?? px2;
  const vao = Math.round(alt * 0.04);
  const topo1 = h + linha + Math.max(0, Math.round((alt - linha - h1 - vao - h2) / 2));
  const faixaVermelha = await sharp({ create: { width: w, height: linha, channels: 3, background: '#e50914' } }).png().toBuffer();

  const saida = await sharp(comLogo)
    .extend({ bottom: alt, background: '#0b0b0c' })
    .composite([
      { input: faixaVermelha, top: h, left: 0 },
      { input: t1, top: topo1, left: margem },
      { input: t2, top: topo1 + h1 + vao, left: margem },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();
  return new Uint8Array(saida);
}
