import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();
const signInWithPassword = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/noticias',
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword } }),
}));

import { OwnerLoginModal } from './OwnerLoginModal';

async function preencherEEntrar() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-mail'), 'dono@exemplo.com');
  await user.type(screen.getByLabelText('Senha'), 'segredo123');
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('OwnerLoginModal', () => {
  beforeEach(() => {
    push.mockReset();
    signInWithPassword.mockReset();
  });

  it('não renderiza nada com open=false', () => {
    const { container } = render(<OwnerLoginModal open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra título "Acesso restrito" e não contém a palavra proprietário', () => {
    render(<OwnerLoginModal open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Acesso restrito' })).toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toMatch(/propriet/i);
    const attrs = Array.from(document.body.querySelectorAll('*'))
      .flatMap((el) => [el.getAttribute('title'), el.getAttribute('aria-label')])
      .filter(Boolean)
      .join(' ');
    expect(attrs).not.toMatch(/propriet/i);
  });

  it('login certo leva a /proprietario', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/proprietario'));
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'dono@exemplo.com', password: 'segredo123' });
  });

  it('senha errada mostra mensagem genérica', async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials', status: 400 },
    });
    render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('falha de rede mostra mensagem de conexão', async () => {
    signInWithPassword.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    expect(
      await screen.findByText('Não foi possível entrar. Verifique sua conexão e tente de novo.'),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('e-mail não confirmado mostra a mensagem certa', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { code: 'email_not_confirmed', status: 400, message: 'Email not confirmed' } });
    render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    expect(await screen.findByText('Confirme seu e-mail antes de entrar.')).toBeInTheDocument();
  });

  it('erro retornado com status 0 mostra a mensagem de conexão', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' } });
    render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    expect(await screen.findByText('Não foi possível entrar. Verifique sua conexão e tente de novo.')).toBeInTheDocument();
  });

  it('reabrir não mostra a senha antiga', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { code: 'invalid_credentials', status: 400 } });
    const { rerender } = render(<OwnerLoginModal open onClose={() => {}} />);
    await preencherEEntrar();
    rerender(<OwnerLoginModal open={false} onClose={() => {}} />);
    rerender(<OwnerLoginModal open onClose={() => {}} />);
    expect(screen.getByLabelText('Senha')).toHaveValue('');
    expect(screen.queryByText('E-mail ou senha inválidos')).toBeNull();
  });

  it('Esc chama onClose', async () => {
    const onClose = vi.fn();
    render(<OwnerLoginModal open onClose={onClose} />);
    await userEvent.setup().keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
