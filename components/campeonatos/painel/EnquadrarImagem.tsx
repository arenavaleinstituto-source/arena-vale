'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { areaDeRecorte } from '@/lib/ui/recorte';

const LADO_SAIDA = 512;
const LADO_AREA = 240;

type Props = { arquivo: File; onPronto: (png: Blob) => void; textoBotao?: string };

/** Enquadra uma imagem num quadrado: aproximar, arrastar (mouse ou dedo) e prévia nos tamanhos da tabela e do cartão. */
export function EnquadrarImagem({ arquivo, onPronto, textoBotao = 'Usar este enquadramento' }: Props) {
  const src = useMemo(() => URL.createObjectURL(arquivo), [arquivo]);
  const [dim, setDim] = useState({ w: LADO_SAIDA, h: LADO_SAIDA });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [gerando, setGerando] = useState(false);
  const arrasto = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // Para trocar de imagem, quem usa o componente muda a `key` (o enquadramento recomeça do zero).
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const area = areaDeRecorte(dim.w, dim.h, zoom, pos.x, pos.y);

  /** Fundo que mostra só o quadrado escolhido, num quadro de `lado` px. */
  function estilo(lado: number) {
    const k = lado / area.lado;
    return {
      width: lado,
      height: lado,
      backgroundImage: src ? `url("${src}")` : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${dim.w * k}px ${dim.h * k}px`,
      backgroundPosition: `${-area.sx * k}px ${-area.sy * k}px`,
    };
  }

  function comecar(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    arrasto.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  }
  function mover(e: PointerEvent<HTMLDivElement>) {
    const a = arrasto.current;
    if (!a) return;
    // Arrastar para a direita mostra o que está à esquerda: o centro anda no sentido contrário.
    const passo = 2 / LADO_AREA;
    const lim = (v: number) => Math.max(-1, Math.min(1, v));
    setPos({ x: lim(a.x - (e.clientX - a.px) * passo), y: lim(a.y - (e.clientY - a.py) * passo) });
  }

  async function pronto() {
    setGerando(true);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      const r = areaDeRecorte(img.naturalWidth, img.naturalHeight, zoom, pos.x, pos.y);
      const canvas = document.createElement('canvas');
      canvas.width = LADO_SAIDA;
      canvas.height = LADO_SAIDA;
      canvas.getContext('2d')?.drawImage(img, r.sx, r.sy, r.lado, r.lado, 0, 0, LADO_SAIDA, LADO_SAIDA);
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
      if (blob) onPronto(blob);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
      <div
        role="img"
        aria-label="Área de enquadramento: arraste para centralizar"
        className="cursor-grab touch-none rounded-xl border border-av-linha bg-[#08080a] active:cursor-grabbing"
        style={estilo(LADO_AREA)}
        onPointerDown={comecar}
        onPointerMove={mover}
        onPointerUp={() => (arrasto.current = null)}
        onPointerCancel={() => (arrasto.current = null)}
      />
      {/* imagem escondida só para saber o tamanho real */}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" hidden onLoad={(e) => setDim({ w: e.currentTarget.naturalWidth || LADO_SAIDA, h: e.currentTarget.naturalHeight || LADO_SAIDA })} />
      )}
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-sm text-av-cinza">
          Aproximar
          <input type="range" min={1} max={3} step={0.05} value={zoom} aria-label="Aproximar" onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        <div className="flex items-end gap-4">
          <div className="grid justify-items-center gap-1 text-xs text-av-cinza">
            <div role="img" aria-label="Prévia na tabela (24 px)" className="rounded" style={estilo(24)} />
            Tabela
          </div>
          <div className="grid justify-items-center gap-1 text-xs text-av-cinza">
            <div role="img" aria-label="Prévia no cartão (96 px)" className="rounded-lg" style={estilo(96)} />
            Cartão
          </div>
        </div>
        <button type="button" className="btn-forte w-fit" disabled={!src || gerando} onClick={pronto}>
          {gerando ? 'Preparando…' : textoBotao}
        </button>
      </div>
    </div>
  );
}
