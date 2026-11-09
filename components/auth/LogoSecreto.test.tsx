import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';

const push = vi.fn();
let sb = fakeSupabase();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/noticias',
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

/** Deixa as promessas pendentes (getUser/is_proprietario) terminarem. */
const esperar = () => act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

import { LogoSecreto } from './LogoSecreto';

describe('LogoSecreto', () => {
  beforeEach(() => {
    push.mockReset();
    sb = fakeSupabase();
    vi.useFakeTimers();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('tem aria-label "Arena Vale — início" e touch-action manipulation', () => {
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    expect(botao).toHaveAttribute('title', 'Arena Vale — início');
    expect(botao.style.touchAction).toBe('manipulation');
  });

  it('3 cliques rápidos abrem o diálogo "Acesso restrito"', async () => {
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    fireEvent.click(botao);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.click(botao);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.click(botao);
    await esperar();
    expect(screen.getByRole('dialog', { name: 'Acesso restrito' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(push).not.toHaveBeenCalled();
  });

  it('o diálogo não fica preso dentro do header (backdrop-filter quebra position:fixed)', async () => {
    render(
      <header style={{ backdropFilter: 'blur(8px)' }}>
        <LogoSecreto />
      </header>,
    );
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    fireEvent.click(botao);
    fireEvent.click(botao);
    fireEvent.click(botao);
    await esperar();
    const dialogo = screen.getByRole('dialog', { name: 'Acesso restrito' });
    expect(dialogo.closest('header')).toBeNull();
  });

  it('um 4º toque logo depois de abrir não fecha o diálogo', async () => {
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    fireEvent.click(botao);
    fireEvent.click(botao);
    fireEvent.click(botao);
    await esperar();
    const fundo = screen.getByTestId('acesso-restrito-fundo');
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.mouseDown(fundo);
    expect(screen.getByRole('dialog', { name: 'Acesso restrito' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(400); });
    fireEvent.mouseDown(fundo);
    expect(screen.queryByRole('dialog', { name: 'Acesso restrito' })).toBeNull();
  });

  it('dono já logado: 3 toques vão direto para /proprietario, sem diálogo', async () => {
    sb = fakeSupabase({ role: 'coordenador', userId: 'dono', dono: true });
    render(<LogoSecreto />);
    const botao = screen.getByRole('button', { name: 'Arena Vale — início' });
    fireEvent.click(botao);
    fireEvent.click(botao);
    fireEvent.click(botao);
    await esperar();
    expect(push).toHaveBeenCalledWith('/proprietario');
    expect(screen.queryByRole('dialog')).toBeNull();
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
