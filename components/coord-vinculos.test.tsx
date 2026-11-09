import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from './fake-consultas';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { CoordVinculos } from './coord-vinculos';

const CAMPS = [{ id: 'c1', nome: 'Copa Arena Vale', ano: 2026 }, { id: 'c2', nome: 'Liga Blumenau', ano: 2026 }];

describe('CoordVinculos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, jaTinhaConta: false }) }));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('coordenação convida moderador chamando /api/convites com cargo moderador e campeonatoId', async () => {
    sb = fakeConsultas({ campeonatos: CAMPS, campeonato_moderadores: [] });
    render(<CoordVinculos cargo="moderador" />);
    const u = userEvent.setup();
    await u.selectOptions(await screen.findByLabelText('Campeonato'), 'c2');
    await u.type(screen.getByLabelText('E-mail'), 'mesa@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Convidar moderador' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const corpo = JSON.parse((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(corpo).toEqual({ email: 'mesa@exemplo.com', cargo: 'moderador', campeonatoId: 'c2' });
    expect(await screen.findByText('Convite enviado para mesa@exemplo.com.')).toBeInTheDocument();
  });

  it('mostra o erro do servidor', async () => {
    sb = fakeConsultas({ campeonatos: CAMPS, campeonato_moderadores: [] });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false, erro: 'Essa pessoa já faz parte da coordenação.' }) }));
    render(<CoordVinculos cargo="moderador" />);
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText('E-mail'), 'x@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Convidar moderador' }));
    expect(await screen.findByText('Essa pessoa já faz parte da coordenação.')).toBeInTheDocument();
  });

  it('lista capitães com o status da equipe', async () => {
    sb = fakeConsultas({
      campeonatos: CAMPS,
      time_capitaes: [
        { id: 't1', profile_id: 'p1', campeonato_id: 'c1', time_id: 'x', profiles: { full_name: 'Carlos', email: 'carlos@e.com' }, times: { nome: 'Leões' } },
        { id: 't2', profile_id: 'p2', campeonato_id: 'c1', time_id: null, profiles: { full_name: 'Duda', email: 'duda@e.com' }, times: null },
      ],
    });
    render(<CoordVinculos cargo="capitao" />);
    expect(await screen.findByText('Equipe cadastrada: Leões')).toBeInTheDocument();
    expect(screen.getByText('Aguardando equipe')).toBeInTheDocument();
  });

  it('remover vínculo de moderador apaga a linha do campeonato', async () => {
    sb = fakeConsultas({
      campeonatos: CAMPS,
      campeonato_moderadores: [{ profile_id: 'm1', campeonato_id: 'c1', profiles: { full_name: 'Mesa 1', email: 'm@e.com' } }],
    });
    render(<CoordVinculos cargo="moderador" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Remover vínculo de Mesa 1' }));
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'campeonato_moderadores' && e.op === 'delete')).toBe(true));
  });
});
