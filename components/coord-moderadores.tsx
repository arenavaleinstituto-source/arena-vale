'use client';

import { CoordVinculos } from './coord-vinculos';

/** Aba "Moderadores" da coordenação: convites por campeonato (substitui usuário/senha próprios). */
export function CoordModeradores() {
  return <CoordVinculos cargo="moderador" />;
}
