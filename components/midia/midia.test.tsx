import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Cartaz } from './Cartaz';
import { Faixa } from './Faixa';
import { Fileira } from './Fileira';

describe('Cartaz', () => {
  it('sem imagem usa a padrão, com alt igual ao título e o link certo', () => {
    render(<Cartaz href="/noticias/1" titulo="Final da Copa" imagem={null} selo="Foto" />);
    const img = screen.getByRole('img', { name: 'Final da Copa' });
    expect(img.getAttribute('src')).toContain('og-banner.jpg');
    expect(screen.getByRole('link').getAttribute('href')).toBe('/noticias/1');
  });

  it('mostra NOVO só quando é novo', () => {
    const { rerender } = render(<Cartaz href="/x" titulo="A" imagem="/a.jpg" selo="Foto" novo />);
    expect(screen.getByText('NOVO')).toBeTruthy();
    rerender(<Cartaz href="/x" titulo="A" imagem="/a.jpg" selo="Foto" />);
    expect(screen.queryByText('NOVO')).toBeNull();
  });

  it('externo abre em nova aba com rel seguro', () => {
    render(<Cartaz href="https://www.instagram.com/reel/x/" titulo="Reel" imagem="/a.jpg" selo="Instagram" externo />);
    const a = screen.getByRole('link');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('vídeo mostra o ícone de play e aplica o enquadramento', () => {
    render(<Cartaz href="/x" titulo="Gol" imagem="/a.jpg" selo="Vídeo" video enquadramento="50% 30%" />);
    expect(screen.getByLabelText('Vídeo')).toBeTruthy();
    expect((screen.getByRole('img', { name: 'Gol' }) as HTMLImageElement).style.objectPosition).toBe('50% 30%');
  });
});

describe('Faixa', () => {
  it('título h2 e link Ver todos', () => {
    render(
      <Faixa id="videos" titulo="Últimos vídeos" subtitulo="Do canal" verTodos={{ href: '/videos' }}>
        <p>conteúdo</p>
      </Faixa>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Últimos vídeos' })).toBeTruthy();
    const ver = screen.getByRole('link', { name: 'Ver todos →' });
    expect(ver.getAttribute('href')).toBe('/videos');
    expect(document.getElementById('videos')?.tagName).toBe('SECTION');
  });

  it('sem verTodos não há link', () => {
    render(<Faixa titulo="Agenda">x</Faixa>);
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('Fileira', () => {
  it('tem as setas com aria-label', () => {
    render(
      <Fileira rotulo="Mais recentes">
        <span>a</span>
      </Fileira>,
    );
    expect(screen.getByRole('button', { name: 'Anterior Mais recentes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Próximo Mais recentes' })).toBeTruthy();
  });
});
