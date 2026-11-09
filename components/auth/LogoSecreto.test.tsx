import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/noticias',
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword: vi.fn() } }),
}));

import { LogoSecreto } from './LogoSecreto';

describe('LogoSecreto', () => {
  beforeEach(() => {
    push.mockReset();
    vi.useFakeTimers();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('tem aria-label "Arena Vale — início" e touch-action manipulation', () => {
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    expect(botao).toHaveAttribute('title', 'Arena Vale — início');
    expect(botao.style.touchAction).toBe('manipulation');
  });

  it('3 cliques rápidos abrem o diálogo "Acesso restrito"', () => {
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    fireEvent.click(botao);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.click(botao);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.click(botao);
    expect(screen.getByRole('dialog', { name: 'Acesso restrito' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(push).not.toHaveBeenCalled();
  });

  it('renderiza o conteúdo recebido no lugar do logo padrão', () => {
    render(
      <LogoSecreto>
        <span>SÚMULAS DIGITAIS</span>
      </LogoSecreto>,
    );
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    expect(botao).toHaveTextContent('SÚMULAS DIGITAIS');
    expect(botao.querySelector('img')).toBeNull();
  });

  it('1 clique navega para / depois de 500 ms', () => {
    render(<LogoSecreto />);
    fireEvent.click(screen.getByRole('button', { name: 'Arena Vale — início' }));
    act(() => { vi.advanceTimersByTime(499); });
    expect(push).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(push).toHaveBeenCalledWith('/');
  });
});
