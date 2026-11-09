import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';

const replace = vi.fn();
let sb = fakeSupabase();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { RedirecionarSeLogado } from './RedirecionarSeLogado';

describe('RedirecionarSeLogado', () => {
  it('quem já entrou (ex.: pelo link do e-mail) vai direto ao painel', async () => {
    sb = fakeSupabase({ role: 'moderador', userId: 'm1' });
    render(<RedirecionarSeLogado />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/moderador'));
  });

  it('respeita o next permitido', async () => {
    replace.mockReset();
    sb = fakeSupabase({ role: 'coordenador', userId: 'c1' });
    render(<RedirecionarSeLogado next="/painel/noticias" />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/painel/noticias'));
  });

  it('visitante fica na página de login', async () => {
    replace.mockReset();
    sb = fakeSupabase();
    render(<RedirecionarSeLogado />);
    await new Promise((r) => setTimeout(r, 20));
    expect(replace).not.toHaveBeenCalled();
  });
});
