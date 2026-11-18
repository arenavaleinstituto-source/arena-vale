export type OpcoesEscudo = {
  formato: 'classico' | 'redondo' | 'losango' | 'moderno';
  cor1: string;
  cor2: string;
  texto: string;
  detalhe: 'nenhum' | 'faixa' | 'listras' | 'estrela' | 'taca';
  /** Contorno do escudo (opcional). */
  borda?: string;
};

// Time sem cor usa o vermelho da marca (av-vermelho); o dourado antigo não é mais usado no site.
const COR1_PADRAO = '#e50914';
const COR2_PADRAO = '#ffffff';
const ESCURO = '#0b0b0d';
const CLARO = '#ffffff';
const FONTE = "Saira, 'Barlow Condensed', Arial, Helvetica, sans-serif";

const corOu = (c: string, padrao: string) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c.toLowerCase() : padrao);

function luminancia(hex: string): number {
  const canal = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(1) + 0.0722 * canal(2);
}

function corDoTexto(fundo: string): string {
  const l = luminancia(fundo);
  const comBranco = 1.05 / (l + 0.05);
  const comEscuro = (l + 0.05) / (luminancia(ESCURO) + 0.05);
  return comBranco >= comEscuro ? CLARO : ESCURO;
}

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function forma(formato: OpcoesEscudo['formato'], atributos: string): string {
  switch (formato) {
    case 'redondo':
      return `<circle cx="256" cy="256" r="224" ${atributos}/>`;
    case 'losango':
      return `<polygon points="256,32 480,256 256,480 32,256" ${atributos}/>`;
    case 'moderno':
      return `<path d="M256 40 L448 96 V260 L256 480 L64 260 V96 Z" ${atributos}/>`;
    default:
      return `<path d="M64 48 H448 V250 C448 360 360 440 256 488 C152 440 64 360 64 250 Z" ${atributos}/>`;
  }
}

function estrela(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.4;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + raio * Math.cos(ang)).toFixed(1)},${(cy + raio * Math.sin(ang)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Taça centrada em (256, 150): copa, alças, haste e base. */
function taca(cor: string): string {
  return (
    `<g data-detalhe="taca" fill="${cor}">` +
    `<path d="M200 92 H312 V128 C312 162 288 182 256 182 C224 182 200 162 200 128 Z"/>` +
    `<path d="M200 104 H176 C176 140 192 154 208 156" fill="none" stroke="${cor}" stroke-width="12" stroke-linecap="round"/>` +
    `<path d="M312 104 H336 C336 140 320 154 304 156" fill="none" stroke="${cor}" stroke-width="12" stroke-linecap="round"/>` +
    `<rect x="246" y="180" width="20" height="22"/>` +
    `<rect x="218" y="200" width="76" height="18" rx="4"/>` +
    `</g>`
  );
}

export function desenharEscudo(o: OpcoesEscudo): string {
  const cor1 = corOu(o.cor1, COR1_PADRAO);
  const cor2 = corOu(o.cor2, COR2_PADRAO);
  const texto = o.texto.trim().toUpperCase().slice(0, 4);
  const clipId = `av-escudo-${o.formato}`;

  let detalhe = '';
  if (o.detalhe === 'faixa') {
    detalhe = `<rect x="-40" y="215" width="592" height="90" fill="${cor2}" transform="rotate(-18 256 256)"/>`;
  } else if (o.detalhe === 'listras') {
    detalhe = [110, 216, 322].map((x) => `<rect x="${x}" y="0" width="80" height="512" fill="${cor2}"/>`).join('');
  } else if (o.detalhe === 'estrela') {
    detalhe = `<polygon points="${estrela(256, 150, 62)}" fill="${cor2}"/>`;
  } else if (o.detalhe === 'taca') {
    detalhe = taca(cor2);
  }

  // Com a taça, as letras ficam menores e mais altas para caber dentro do contorno.
  const comTaca = o.detalhe === 'taca';
  const tamanho = comTaca
    ? texto.length <= 2 ? 150 : texto.length === 3 ? 118 : 94
    : texto.length <= 2 ? 190 : texto.length === 3 ? 150 : 118;
  const y = comTaca ? 318 : o.detalhe === 'estrela' ? 365 : 290;
  const marcaTexto = texto
    ? `<text x="256" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONTE.replace(/'/g, '&apos;')}" ` +
      `font-weight="800" font-size="${tamanho}" fill="${corDoTexto(cor1)}">${escapar(texto)}</text>`
    : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">` +
    `<defs><clipPath id="${clipId}">${forma(o.formato, '')}</clipPath></defs>` +
    forma(o.formato, `fill="${cor1}"` + (o.borda ? ` stroke="${corOu(o.borda, COR1_PADRAO)}" stroke-width="20" stroke-linejoin="round"` : '')) +
    (detalhe ? `<g clip-path="url(#${clipId})">${detalhe}</g>` : '') +
    marcaTexto +
    `</svg>`
  );
}

export function escudoPadrao(sigla: string, cor: string | null): string {
  return desenharEscudo({ formato: 'classico', cor1: cor ?? COR1_PADRAO, cor2: COR2_PADRAO, texto: sigla, detalhe: 'nenhum' });
}
