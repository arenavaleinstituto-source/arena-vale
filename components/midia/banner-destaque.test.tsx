import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BannerDestaque } from './BannerDestaque';
import { mapearNoticiaMidia } from '@/lib/midia/noticias';

afterEach(() => vi.unstubAllGlobals());

describe('BannerDestaque: foto sem cortar', () => {
  it('mostra a foto inteira (contain) sobre um fundo desfocado da mesma foto', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }));
    const n = mapearNoticiaMidia({ id: 'n1', titulo: 'Bola de Ouro', imagem_url: 'https://x/foto.jpg', status: 'publicado' });
    const { container } = render(<BannerDestaque n={n} />);
    const inteira = container.querySelector('img.foto-inteira');
    const desfoque = container.querySelector('img.fundo-desfocado');
    expect(inteira?.getAttribute('src')).toBe('https://x/foto.jpg');
    expect(desfoque?.getAttribute('src')).toBe('https://x/foto.jpg');
  });
});
