import type { FormaDisputa } from '@/lib/campeonatos/tipos';
import type { JogoDaPagina } from '@/lib/campeonatos/busca';

/** `jogos.data` é horário de Brasília sem fuso: "2026-11-20T19:30:00" → "20/11 · 19:30". */
export function dataDoJogo(data: string | null): string {
  const m = data?.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]} · ${m[4]}:${m[5]}` : 'A definir';
}

export function nomeDaForma(f: FormaDisputa): string {
  if (f.tipo === 'mata_mata') return 'Mata-mata';
  if (f.tipo === 'grupos_mata_mata') return 'Grupos + mata-mata';
  return f.final_entre ? 'Pontos corridos + final' : 'Pontos corridos';
}

/** "2 x 1", "1 x 1 (4 x 3)" nos pênaltis, ou null se o jogo ainda não começou. */
export function placarDoJogo(j: JogoDaPagina): string | null {
  if ((j.status !== 'finalizado' && j.status !== 'ao_vivo') || j.placar_casa == null || j.placar_visitante == null) return null;
  const pen = j.penaltis_casa != null && j.penaltis_visitante != null ? ` (${j.penaltis_casa} x ${j.penaltis_visitante})` : '';
  return `${j.placar_casa} x ${j.placar_visitante}${pen}`;
}
