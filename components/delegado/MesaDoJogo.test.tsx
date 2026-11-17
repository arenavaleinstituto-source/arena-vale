import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ update: () => ({ eq: () => Promise.resolve({ error: null }) }) }) }),
}));

import { MesaDoJogo, type JogoDelegado } from './MesaDoJogo';

const base: JogoDelegado = {
  id: 'j1', campeonato_id: 'c1', data: '2026-11-20T19:00:00', local: 'Ginásio', status: 'ao_vivo',
  placar_casa: 1, placar_visitante: 0, nome_casa_custom: null, nome_visitante_custom: null,
  casa: { id: 't1', nome: 'Leões' }, fora: { id: 't2', nome: 'Tigres' },
};

describe('MesaDoJogo', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ao finalizar, pede o recálculo das vagas do campeonato', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, avisos: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<MesaDoJogo jogos={[base]} ehCoordenador={false} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Finalizar jogo/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/campeonatos/c1/recalcular', { method: 'POST' }));
    expect(await screen.findByText('Jogo finalizado!')).toBeInTheDocument();
  });

  it('falha no recálculo não trava a tela', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sem rede')));
    render(<MesaDoJogo jogos={[base]} ehCoordenador={false} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Finalizar jogo/ }));
    expect(await screen.findByText('Jogo finalizado!')).toBeInTheDocument();
  });

  it('time ainda não definido aparece como "A definir"', () => {
    render(<MesaDoJogo jogos={[{ ...base, fora: null, data: null }]} ehCoordenador={false} />);
    expect(screen.getAllByText('A definir').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Invalid Date/)).toBeNull();
  });
});
