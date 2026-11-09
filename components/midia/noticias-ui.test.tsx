import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerNoticia } from './PlayerNoticia';
import { BannerDestaque } from './BannerDestaque';
import { CartazNoticia } from './CartazNoticia';
import { mapearNoticiaMidia, type NoticiaMidia } from '@/lib/midia/noticias';

const n = (p: Record<string, unknown> = {}): NoticiaMidia =>
  mapearNoticiaMidia({ id: 'n1', titulo: 'Golaço', descricao: 'Texto', imagem_url: '/c.jpg', status: 'publicado', publicado_em: '2026-11-01T00:00:00Z', ...p });

function reduzMovimento(reduz: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduz && q.includes('reduce'), media: q, addEventListener: () => {}, removeEventListener: () => {} }));
}

afterEach(() => vi.unstubAllGlobals());

describe('PlayerNoticia', () => {
  it('arquivo guardado: player próprio com controles', () => {
    const { container } = render(<PlayerNoticia n={n({ tipo_midia: 'video', video_url: 'https://x/v.mp4' })} />);
    expect(container.querySelector('video')?.hasAttribute('controls')).toBe(true);
  });

  it('só link do YouTube: player embutido sem cookies', () => {
    render(<PlayerNoticia n={n({ tipo_midia: 'video', video_link: 'https://youtu.be/dQw4w9WgXcQ' })} />);
    expect(screen.getByTitle('Golaço').getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('link do Instagram: cartaz com "▶ Assistir no Instagram" em nova aba', () => {
    render(<PlayerNoticia n={n({ tipo_midia: 'video', video_link: 'https://www.instagram.com/reel/a/' })} />);
    const a = screen.getByRole('link', { name: '▶ Assistir no Instagram' });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('href', 'https://www.instagram.com/reel/a/');
  });

  it('foto: imagem grande', () => {
    render(<PlayerNoticia n={n()} />);
    expect(screen.getByRole('img', { name: 'Golaço' })).toHaveAttribute('src', '/c.jpg');
  });
});

describe('BannerDestaque', () => {
  it('com "reduzir movimento": só o cartaz, sem vídeo', () => {
    reduzMovimento(true);
    const { container } = render(<BannerDestaque n={n({ tipo_midia: 'video', video_url: 'https://x/v.mp4' })} />);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByRole('link', { name: '▶ Assistir' })).toHaveAttribute('href', '/noticias/n1');
  });

  it('foto: botão "Ver"', () => {
    reduzMovimento(false);
    render(<BannerDestaque n={n()} />);
    expect(screen.getByRole('link', { name: 'Ver' })).toBeInTheDocument();
  });
});

describe('CartazNoticia', () => {
  it('notícia antiga sem cartaz usa a imagem padrão', () => {
    render(<CartazNoticia n={n({ imagem_url: null })} />);
    expect(screen.getByRole('img', { name: 'Golaço' }).getAttribute('src')).toContain('og-banner.jpg');
  });

  it('vídeo com link vira selo VÍDEO; foto vira FOTO', () => {
    const { rerender } = render(<CartazNoticia n={n({ tipo_midia: 'video', video_link: 'https://youtu.be/dQw4w9WgXcQ' })} />);
    expect(screen.getByText('Vídeo')).toBeInTheDocument();
    rerender(<CartazNoticia n={n()} />);
    expect(screen.getByText('Foto')).toBeInTheDocument();
  });

  it('Esporte Mundial mostra a fonte', () => {
    render(<CartazNoticia n={n({ aba: 'mundo', fonte: 'Canal do Gol' })} />);
    expect(screen.getByText('Fonte: Canal do Gol')).toBeInTheDocument();
  });
});
