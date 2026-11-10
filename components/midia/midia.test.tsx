import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('Fileira girando', () => {
  afterEach(() => vi.useRealTimers());

  function montar(posicao: { left: number }) {
    vi.useFakeTimers();
    render(
      <Fileira rotulo="Esporte Mundial" girar>
        <span>a</span>
        <span>b</span>
      </Fileira>,
    );
    const trilho = screen.getByRole('region', { name: 'Esporte Mundial' });
    Object.defineProperty(trilho, 'clientWidth', { value: 400 });
    Object.defineProperty(trilho, 'scrollWidth', { value: 1200 });
    Object.defineProperty(trilho, 'scrollLeft', { get: () => posicao.left });
    const scrollBy = vi.fn();
    const scrollTo = vi.fn();
    Object.assign(trilho, { scrollBy, scrollTo });
    return { trilho, scrollBy, scrollTo };
  }

  it('avança sozinha a cada 4 segundos', () => {
    const { scrollBy } = montar({ left: 0 });
    act(() => vi.advanceTimersByTime(4000));
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('no fim volta para o começo (as mais novas)', () => {
    const { scrollBy, scrollTo } = montar({ left: 800 });
    act(() => vi.advanceTimersByTime(4000));
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('para enquanto a pessoa está com o mouse em cima', () => {
    const { trilho, scrollBy } = montar({ left: 0 });
    fireEvent.mouseEnter(trilho.parentElement!);
    act(() => vi.advanceTimersByTime(8000));
    expect(scrollBy).not.toHaveBeenCalled();
    fireEvent.mouseLeave(trilho.parentElement!);
    act(() => vi.advanceTimersByTime(4000));
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});
