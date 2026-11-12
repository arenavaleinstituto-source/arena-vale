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
});
