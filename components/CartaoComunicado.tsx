import Link from 'next/link';
import type { Noticia } from '@/lib/content';
import { formatarDataBR, imagemNoticia } from '@/lib/content';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  CARTÃO DE COMUNICADO — componente único do padrão editorial
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Este é O cartão de comunicado do Arena Vale. A Home, o mural /noticias
 *  e qualquer outra tela que mostre comunicados DEVEM usar este
 *  componente. Antes, cada tela tinha o seu markup — a Home não mostrava
 *  a data e usava o CTA "EXPLORAR COBERTURA" apontando sempre para
 *  #campeonatos; o mural usava "LER COMUNICADO" num botão que não fazia
 *  nada. Mesmo conteúdo, dois respaldos diferentes.
 *
 *  @see lib/content — tipos, vocabulário e normalização
 */

interface CartaoComunicadoProps {
  noticia: Noticia;
  /** Posição no mural (1-based). Usado no número decorativo. */
  indice?: number;
  /** Rótulo do CTA. Padrão: "LER COMUNICADO". */
  rotuloCta?: string;
  /** Mostra o número decorativo (01, 02, 03...). */
  mostrarNumero?: boolean;
  /** Mostra a data de publicação. */
  mostrarData?: boolean;
  className?: string;
}

export default function CartaoComunicado({
  noticia,
  indice,
  rotuloCta = 'LER COMUNICADO',
  mostrarNumero = true,
  mostrarData = true,
  className = '',
}: CartaoComunicadoProps) {
  const data = formatarDataBR(noticia.created_at);

  return (
    <article
      className={`group relative min-h-[430px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagemNoticia(noticia)}
        alt={noticia.titulo}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:opacity-55 group-hover:mix-blend-normal"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/15 via-transparent to-black/80 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

      {/* Categoria em marca-d'água */}
      <span className="pointer-events-none select-none absolute -right-3 top-10 text-7xl font-black italic uppercase tracking-tighter text-white/[0.04] transition-transform duration-500 group-hover:-translate-x-3">
        {noticia.categoria}
      </span>

      {/* Cantos estilizados */}
      <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-white/30 transition-colors group-hover:border-[#e50914]" />
      <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-white/30 transition-colors group-hover:border-[#e50914]" />

      {/* Selos */}
      <div className="relative z-10 p-6 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block -skew-x-12 bg-[#e50914] px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]">
            <span className="inline-block skew-x-12">{noticia.categoria}</span>
          </span>
          {noticia.tag && (
            <span className="inline-block -skew-x-12 border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#cad0e0]">
              <span className="inline-block skew-x-12">{noticia.tag}</span>
            </span>
          )}
        </div>
        {mostrarNumero && typeof indice === 'number' && (
          <span
            className="text-4xl font-black italic leading-none text-transparent select-none"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}
          >
            {String(indice + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 p-6 pt-0 mt-auto">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-8 bg-[#e50914] transition-all duration-300 group-hover:w-14" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">
            ARENA PRESS
          </span>
          {mostrarData && data && (
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              · {data}
            </span>
          )}
        </div>

        <h3 className="text-2xl sm:text-[26px] font-black italic uppercase leading-[1.08] tracking-tight text-white drop-shadow-md group-hover:text-[#ff2a35] transition-colors">
          {noticia.titulo}
        </h3>

        <p className="mt-3 text-xs sm:text-sm text-[#b8c0d4] leading-relaxed line-clamp-3 font-medium">
          {noticia.descricao}
        </p>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <Link
            href={`/noticias/${noticia.id}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-[#e50914] transition"
          >
            <span>{rotuloCta}</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] group-hover:bg-[#e50914] group-hover:text-white group-hover:translate-x-1 transition-all">
              ↗
            </span>
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="AV"
            className="h-10 w-auto object-contain opacity-80 mix-blend-lighten group-hover:opacity-100 transition"
          />
        </div>
      </div>

      <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-[#e50914] via-[#ff4b52] to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
    </article>
  );
}
