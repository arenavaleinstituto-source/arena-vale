import { createHash, timingSafeEqual } from 'node:crypto';

/** Compara segredos em tempo constante. Segredo esperado vazio nunca confere. */
export function segredoConfere(recebido: string | null | undefined, esperado: string | undefined): boolean {
  if (!esperado || !recebido) return false;
  const a = createHash('sha256').update(recebido).digest();
  const b = createHash('sha256').update(esperado).digest();
  return timingSafeEqual(a, b);
}
