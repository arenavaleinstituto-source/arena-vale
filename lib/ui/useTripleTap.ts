'use client';

import { useCallback, useEffect, useRef } from 'react';

type Options = {
  onTriple: () => void;
  onSingle: () => void;
  windowMs?: number;
};

/**
 * Distingue 3 toques rápidos (cada um a menos de `windowMs` do anterior)
 * de 1 ou 2 toques. `onSingle` só dispara depois de `windowMs` sem novo
 * toque, então uma sequência de 3 nunca navega no meio do caminho.
 */
export function useTripleTap({ onTriple, onSingle, windowMs = 500 }: Options): () => void {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlers = useRef({ onTriple, onSingle });
  handlers.current = { onTriple, onSingle };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    count.current += 1;

    if (count.current >= 3) {
      count.current = 0;
      timer.current = null;
      handlers.current.onTriple();
      return;
    }

    timer.current = setTimeout(() => {
      count.current = 0;
      timer.current = null;
      handlers.current.onSingle();
    }, windowMs);
  }, [windowMs]);
}
