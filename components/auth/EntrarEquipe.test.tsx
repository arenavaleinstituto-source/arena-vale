import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';
import { destinoPorCargo } from '@/lib/auth/rotas';

let sb = fakeSupabase();
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }), usePathname: () => '/' }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { EntrarEquipe } from './EntrarEquipe';

async function abrirMenu() {
  const u = userEvent.setup();
  await u.click(await screen.findByRole('button', { name: 'Entrar na área da equipe' }));
  return u;
}

describe('EntrarEquipe', () => {
  it('visitante: "Entrar" abre o menu com Coordenação, Moderador e Capitão', async () => {
    sb = fakeSupabase();
    render(<EntrarEquipe />);
    await abrirMenu();
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['Coordenação', 'Moderador', 'Capitão']);
  });

  it('cada opção abre o login com o rótulo do cargo; Esc fecha', async () => {
    sb = fakeSupabase();
    render(<EntrarEquipe />);
    const u = await abrirMenu();
    await u.click(screen.getByRole('menuitem', { name: 'Moderador' }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.textContent).toContain('Área da equipe · Moderador');
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('o login fica num portal no body (fora do cabeçalho com blur)', async () => {
    sb = fakeSupabase();
    const { container } = render(<EntrarEquipe />);
    const u = await abrirMenu();
    await u.click(screen.getByRole('menuitem', { name: 'Capitão' }));
    expect(container.contains(screen.getByRole('dialog'))).toBe(false);
  });

  it('menu aberto fecha com Esc e com clique fora', async () => {
    sb = fakeSupabase();
    render(<EntrarEquipe />);
    const u = await abrirMenu();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Entrar na área da equipe' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await u.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('toque fora (iPhone: só pointerdown, sem click) fecha o menu', async () => {
    sb = fakeSupabase();
    render(<EntrarEquipe />);
    await abrirMenu();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('o destino vem do cargo no banco, não da opção clicada', async () => {
    sb = fakeSupabase({ role: 'capitao', userId: 'u1' });
    sb.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    sb.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    push.mockReset();
    render(<EntrarEquipe />);
    const u = await abrirMenu();
    await u.click(screen.getByRole('menuitem', { name: 'Coordenação' }));
    await u.type(screen.getByLabelText('E-mail'), 'cap@exemplo.com');
    await u.type(screen.getByLabelText('Senha'), 'segredo123');
    await u.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(destinoPorCargo('capitao')));
  });

  it('logado mostra "Coordenador" e nunca "Proprietário" (mesmo sendo o dono)', async () => {
    sb = fakeSupabase({ role: 'coordenador', nome: 'Paulo Miranda', userId: 'dono', dono: true });
    render(<EntrarEquipe />);
    expect(await screen.findByText('Coordenador')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toMatch(/propriet/i);
  });

  it('moderador logado vê o próprio cargo', async () => {
    sb = fakeSupabase({ role: 'moderador', nome: 'Ana', userId: 'm1' });
    render(<EntrarEquipe />);
    expect(await screen.findByText('Moderador')).toBeInTheDocument();
  });
});
