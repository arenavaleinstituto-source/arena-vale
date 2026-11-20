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
});
