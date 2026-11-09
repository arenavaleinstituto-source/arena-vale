import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTripleTap } from './useTripleTap';

function setup() {
  const onTriple = vi.fn();
  const onSingle = vi.fn();
  const { result } = renderHook(() => useTripleTap({ onTriple, onSingle }));
  const tap = () => act(() => result.current());
  const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
  return { onTriple, onSingle, tap, advance };
}

describe('useTripleTap', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('3 toques em menos de 500 ms chamam onTriple uma vez e onSingle nunca', () => {
    const { onTriple, onSingle, tap, advance } = setup();
    tap(); advance(200); tap(); advance(200); tap();
    advance(1000);
    expect(onTriple).toHaveBeenCalledTimes(1);
    expect(onSingle).toHaveBeenCalledTimes(0);
  });

  it('1 toque chama onSingle depois de 500 ms', () => {
    const { onSingle, tap, advance } = setup();
    tap();
    advance(499);
    expect(onSingle).toHaveBeenCalledTimes(0);
    advance(1);
    expect(onSingle).toHaveBeenCalledTimes(1);
  });

  it('2 toques e pausa chamam onSingle uma única vez', () => {
    const { onTriple, onSingle, tap, advance } = setup();
    tap(); advance(300); tap();
    advance(2000);
    expect(onSingle).toHaveBeenCalledTimes(1);
    expect(onTriple).toHaveBeenCalledTimes(0);
  });

  it('3 toques lentos não chamam onTriple', () => {
    const { onTriple, onSingle, tap, advance } = setup();
    tap(); advance(600); tap(); advance(600); tap();
    advance(2000);
    expect(onTriple).toHaveBeenCalledTimes(0);
    expect(onSingle).toHaveBeenCalledTimes(3);
  });

  it('onSingle não dispara entre o 1º e o 3º toque rápido', () => {
    const { onTriple, onSingle, tap, advance } = setup();
    tap(); advance(450); tap(); advance(450);
    expect(onSingle).toHaveBeenCalledTimes(0);
    tap();
    advance(1000);
    expect(onSingle).toHaveBeenCalledTimes(0);
    expect(onTriple).toHaveBeenCalledTimes(1);
  });
});
