import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from './fake-consultas';

const sb = fakeConsultas({ atletas_destaque: [{ id: 'd1', atleta_nome: 'JOAO', time_nome: 'BRUSQUE', campeonato_nome: 'CATARINENSE SUB 20', foto_url: 'https://x/j.jpg' }] });
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { CoordDestaques } from './coord-destaques';

describe('CoordDestaques (aba Atletas destaque do painel)', () => {
  it('lista os destaques do banco e exclui', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CoordDestaques userId="u1" />);
    expect(await screen.findByText('JOAO')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Excluir/ }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'atletas_destaque' && e.op === 'delete')?.filtros).toContainEqual(['eq', 'id', 'd1']));
  });

  it('puxa foto, nome, time e campeonato da inscrição pelo CPF e salva sem novo envio', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ atleta: { nome: 'Maria Souza', foto_url: 'https://x/m.jpg', time: 'Real', campeonato: 'Interblu' } }), { status: 200 }),
    );
    render(<CoordDestaques userId="u1" />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText(/Puxar da inscrição/), '52998224725');
    await u.click(screen.getByRole('button', { name: 'Buscar atleta' }));
    expect(await screen.findByRole('img', { name: 'Foto da inscrição' })).toHaveAttribute('src', 'https://x/m.jpg');
    expect(fetchMock).toHaveBeenCalledWith('/api/atletas/por-cpf?cpf=52998224725');
    expect(screen.getByPlaceholderText('Nome do atleta')).toHaveValue('Maria Souza');
    await u.click(screen.getByRole('button', { name: '+ Adicionar destaque' }));
    await waitFor(() =>
      expect(sb.escritas.find((e) => e.tabela === 'atletas_destaque' && e.op === 'insert')?.payload).toMatchObject({
        foto_url: 'https://x/m.jpg', atleta_nome: 'Maria Souza', time_nome: 'Real', campeonato_nome: 'Interblu',
      }),
    );
    fetchMock.mockRestore();
  });
});
