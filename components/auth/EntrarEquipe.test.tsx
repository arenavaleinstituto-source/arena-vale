import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeSupabase } from './fake-supabase';

let sb = fakeSupabase();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }), usePathname: () => '/' }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { EntrarEquipe } from './EntrarEquipe';

describe('EntrarEquipe', () => {
  it('visitante vê "Entrar" e abre a área da equipe', async () => {
    sb = fakeSupabase();
    render(<EntrarEquipe />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Entrar na área da equipe' }));
    expect(screen.getByRole('dialog', { name: 'ÁREA DA EQUIPE' })).toBeInTheDocument();
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
