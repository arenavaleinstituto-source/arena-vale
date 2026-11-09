import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';

const push = vi.fn();
let sb = fakeSupabase();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }), usePathname: () => '/' }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { FormEntrarEquipe } from './FormEntrarEquipe';

async function entrar() {
  const u = userEvent.setup();
  await u.type(screen.getByLabelText('E-mail'), 'pessoa@exemplo.com');
  await u.type(screen.getByLabelText('Senha'), 'segredo123');
  await u.click(screen.getByRole('button', { name: 'Entrar' }));
}

function loginOk(role: string | null) {
  sb = fakeSupabase({ role, userId: 'u1' });
  sb.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
}

describe('FormEntrarEquipe', () => {
  beforeEach(() => { push.mockReset(); });

  it.each([
    ['coordenador', '/coordenador'],
    ['moderador', '/moderador'],
    ['capitao', '/capitao'],
  ])('%s entra e vai para %s', async (role, destino) => {
    loginOk(role);
    render(<FormEntrarEquipe />);
    await entrar();
    await waitFor(() => expect(push).toHaveBeenCalledWith(destino));
  });

  it('respeita o next permitido', async () => {
    loginOk('coordenador');
    render(<FormEntrarEquipe next="/painel/noticias" />);
    await entrar();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/painel/noticias'));
  });

  it('sem cargo vê a mensagem e é deslogado', async () => {
    loginOk('autenticado');
    render(<FormEntrarEquipe />);
    await entrar();
    expect(await screen.findByText('Sua conta ainda não tem acesso à área da equipe. Fale com a coordenação.')).toBeInTheDocument();
    expect(sb.auth.signOut).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('senha errada mostra "E-mail ou senha inválidos"', async () => {
    sb = fakeSupabase();
    sb.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: { code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' } });
    render(<FormEntrarEquipe />);
    await entrar();
    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument();
  });

  it('email_not_confirmed mostra "Confirme seu e-mail antes de entrar."', async () => {
    sb = fakeSupabase();
    sb.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: { code: 'email_not_confirmed', status: 400, message: 'Email not confirmed' } });
    render(<FormEntrarEquipe />);
    await entrar();
    expect(await screen.findByText('Confirme seu e-mail antes de entrar.')).toBeInTheDocument();
  });

  it('erro retornado com status 0 mostra a mensagem de conexão', async () => {
    sb = fakeSupabase();
    sb.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' } });
    render(<FormEntrarEquipe />);
    await entrar();
    expect(await screen.findByText('Não foi possível entrar. Verifique sua conexão e tente de novo.')).toBeInTheDocument();
  });

  it('link de acesso por e-mail', async () => {
    sb = fakeSupabase();
    render(<FormEntrarEquipe />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('E-mail'), 'pessoa@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Receber link de acesso por e-mail' }));
    expect(await screen.findByText('Link enviado — confira seu e-mail')).toBeInTheDocument();
    expect(sb.auth.signInWithOtp).toHaveBeenCalledWith(expect.objectContaining({ email: 'pessoa@exemplo.com' }));
  });

  it('esqueci minha senha sem e-mail pede o e-mail', async () => {
    sb = fakeSupabase();
    render(<FormEntrarEquipe />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(sb.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});
