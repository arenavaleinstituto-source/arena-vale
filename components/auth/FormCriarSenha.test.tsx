import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';

const push = vi.fn();
let sb = fakeSupabase();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/criar-senha' }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { FormCriarSenha } from './FormCriarSenha';

async function preencher(senha: string, confirma = senha) {
  const u = userEvent.setup();
  await u.type(await screen.findByLabelText('Nova senha'), senha);
  await u.type(screen.getByLabelText('Repita a senha'), confirma);
  await u.click(screen.getByRole('button', { name: 'Salvar senha' }));
}

describe('FormCriarSenha', () => {
  it('senha curta mostra erro e não salva', async () => {
    sb = fakeSupabase({ role: 'capitao', userId: 'c1' });
    render(<FormCriarSenha />);
    await preencher('1234567');
    expect(await screen.findByText('A senha precisa ter pelo menos 8 caracteres.')).toBeInTheDocument();
    expect(sb.auth.updateUser).not.toHaveBeenCalled();
  });

  it('senhas diferentes mostram erro', async () => {
    sb = fakeSupabase({ role: 'capitao', userId: 'c1' });
    render(<FormCriarSenha />);
    await preencher('senhaboa123', 'outrasenha1');
    expect(await screen.findByText('As duas senhas não são iguais.')).toBeInTheDocument();
  });

  it('salva e leva o capitão ao painel dele', async () => {
    sb = fakeSupabase({ role: 'capitao', userId: 'c1' });
    render(<FormCriarSenha />);
    await preencher('senhaboa123');
    await waitFor(() => expect(push).toHaveBeenCalledWith('/capitao'));
    expect(sb.auth.updateUser).toHaveBeenCalledWith({ password: 'senhaboa123' });
  });

  it('sem sessão (link vencido) explica o que fazer', async () => {
    sb = fakeSupabase();
    render(<FormCriarSenha />);
    expect(await screen.findByText(/O link expirou/)).toBeInTheDocument();
  });
});
