import { desenharEscudo } from '@/lib/campeonatos/escudo-svg';
import { svgComoSrc } from './EscudoTime';

const PEQUENAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e']);

/** "Copa do Vale Futsal 2026" → "CVF" (até 3 letras, sem números e sem "de/do/da"). */
export function iniciaisDoCampeonato(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((p) => p && !PEQUENAS.has(p.toLowerCase()) && !/^\d+$/.test(p))
    .map((p) => p[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

/** Escudo do campeonato; sem foto, o escudo padrão com as iniciais nas cores da ARENA VALE. */
export function EscudoCampeonato({ campeonato, tamanho = 96, className = '' }: { campeonato: { nome: string; logo_url: string | null }; tamanho?: number; className?: string }) {
  const src =
    campeonato.logo_url ||
    svgComoSrc(desenharEscudo({ formato: 'classico', cor1: '#e50914', cor2: '#ffffff', texto: iniciaisDoCampeonato(campeonato.nome), detalhe: 'estrela' }));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={campeonato.nome} width={tamanho} height={tamanho} className={`shrink-0 object-contain ${className}`} style={{ width: tamanho, height: tamanho }} />
  );
}
