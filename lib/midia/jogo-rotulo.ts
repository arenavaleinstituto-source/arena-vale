import type { ItemAgenda } from './agenda';

const TRES_HORAS_MS = 3 * 3600 * 1000;

/** Dia (AAAA-MM-DD) no horário de Brasília (UTC−3, sem horário de verão). */
export function diaBrasilia(t: number): string {
  return new Date(t - TRES_HORAS_MS).toISOString().slice(0, 10);
}

/** "Casa x Fora · 15/11" (data de Brasília). */
export function rotuloJogo(item: ItemAgenda): string {
  const [, mes, dia] = diaBrasilia(Date.parse(item.dataHora)).split('-');
  return `${item.casa} x ${item.fora} · ${dia}/${mes}`;
}
