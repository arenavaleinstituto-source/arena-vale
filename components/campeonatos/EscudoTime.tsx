import { escudoPadrao } from '@/lib/campeonatos/escudo-svg';

export type TimeComEscudo = { nome: string; sigla: string | null; escudo_url: string | null; escudo_cor: string | null };

export function svgComoSrc(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Escudo do time; sem escudo enviado, o escudo padrão desenhado com a sigla e a cor do time. */
export function EscudoTime({ time, tamanho = 40, className = '' }: { time: TimeComEscudo; tamanho?: 24 | 40 | 96; className?: string }) {
  const src = time.escudo_url || svgComoSrc(escudoPadrao(time.sigla || time.nome.slice(0, 3), time.escudo_cor));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={time.nome} width={tamanho} height={tamanho} className={`shrink-0 object-contain ${className}`} style={{ width: tamanho, height: tamanho }} />
  );
}
