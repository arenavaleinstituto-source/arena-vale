import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TOKENS } from './tokens';

describe('tokens da mídia esportiva', () => {
  it('tem os 8 valores do spec', () => {
    expect(TOKENS).toEqual({
      preto: '#0b0b0c',
      grafite: '#141417',
      grafite2: '#1d1d22',
      linha: '#2a2a30',
      branco: '#f4f4f5',
      cinza: '#a1a1aa',
      vermelho: '#e50914',
      amarelo: '#facc15',
    });
  });

  it('globals.css usa o vermelho da marca e não tem mais o dourado antigo', () => {
    const css = fs.readFileSync(path.join(import.meta.dirname, '../../app/globals.css'), 'utf8');
    expect(css).toContain('--vermelho: #e50914');
    expect(css).not.toContain('#f5d76e');
  });
});
