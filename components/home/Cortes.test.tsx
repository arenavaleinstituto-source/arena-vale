import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Cortes } from './Cortes';
import type { VideoYT } from '@/lib/midia/youtube';

const corte = (id: string, titulo: string): VideoYT => ({
  id,
  titulo,
  publicadoEm: '2026-11-10T10:00:00Z',
  capa: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  link: `https://www.youtube.com/watch?v=${id}`,
});
const TRES = [corte('a1', 'Golaço de bicicleta'), corte('b2', 'Defesa incrível'), corte('c3', 'Virada no fim')];

describe('Cortes', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('lista vazia não mostra nada', () => {
    const { container } = render(<Cortes cortes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o título e um botão por corte', () => {
    render(<Cortes cortes={TRES} />);
    expect(screen.getByRole('heading', { name: 'Cortes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Golaço de bicicleta/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Defesa incrível/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Virada no fim/ })).toBeInTheDocument();
  });

  it('clique abre o player sem cookies e trava a rolagem', () => {
    render(<Cortes cortes={TRES} />);
    fireEvent.click(screen.getByRole('button', { name: /Defesa incrível/ }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo.querySelector('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/b2?autoplay=1&playsinline=1');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Esc fecha e devolve o foco ao botão do corte', () => {
    render(<Cortes cortes={TRES} />);
    const botao = screen.getByRole('button', { name: /Defesa incrível/ });
    botao.focus();
    fireEvent.click(botao);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(botao);
    expect(document.body.style.overflow).toBe('');
  });

  it('✕ fecha', () => {
    render(<Cortes cortes={TRES} />);
    fireEvent.click(screen.getByRole('button', { name: /Golaço/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clique no fundo fecha', () => {
    render(<Cortes cortes={TRES} />);
    fireEvent.click(screen.getByRole('button', { name: /Golaço/ }));
    fireEvent.click(document.querySelector('.fundo-corte') as Element);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('capa em pé do Short; se ela não existir, volta para a capa comum', () => {
    render(<Cortes cortes={TRES} />);
    const img = screen.getByRole('button', { name: /Golaço de bicicleta/ }).querySelector('img')!;
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/a1/oardefault.jpg');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/a1/hqdefault.jpg');
  });

  it('se o YouTube devolver a imagem genérica (120×90) no lugar da capa em pé, usa a capa comum', () => {
    render(<Cortes cortes={TRES} />);
    const img = screen.getByRole('button', { name: /Defesa incrível/ }).querySelector('img')!;
    Object.defineProperty(img, 'naturalWidth', { value: 120 });
    fireEvent.load(img);
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/b2/hqdefault.jpg');
  });

  it('corte deitado: cartão horizontal com a capa girada, e o player abre na horizontal', () => {
    render(<Cortes cortes={[{ ...corte('d4', 'Grande defesa'), giro: -90 }, corte('e5', 'Em pé')]} />);
    const cartao = screen.getByRole('button', { name: /Grande defesa/ });
    expect(cartao).toHaveClass('deitado');
    expect(cartao.querySelector('img')!.style.transform).toContain('rotate(-90deg)');
    expect(screen.getByRole('button', { name: /Em pé/ })).not.toHaveClass('deitado');

    fireEvent.click(cartao);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveClass('deitado');
    expect(dialogo.querySelector('iframe')!.style.transform).toContain('rotate(-90deg)');
  });
});
