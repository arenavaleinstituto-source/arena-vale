import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ rpc }) }));

import { GestaoCoordenadores } from './GestaoCoordenadores';

const DONO = { id: 'dono', nome: 'Paulo Miranda', email: 'pmmiranda2017@gmail.com' };
const ANA = { id: 'ana', nome: 'Ana Lima', email: 'ana@exemplo.com' };
const BETO = { id: 'beto', nome: 'Beto Reis', email: 'beto@exemplo.com' };

describe('GestaoCoordenadores', () => {
  beforeEach(() => {
    rpc.mockClear();
    refresh.mockClear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, jaTinhaConta: false }) }));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('mostra o dono como "Você" e nunca "Proprietário"', () => {
    render(<GestaoCoordenadores coordenadores={[DONO, ANA]} limite={3} donoId="dono" />);
    const linhaDono = screen.getByText('Paulo Miranda').closest('li')!;
    expect(within(linhaDono).getByText('Você')).toBeInTheDocument();
    expect(within(linhaDono).queryByRole('button', { name: /Remover/ })).toBeNull();
    expect(document.body.textContent ?? '').not.toMatch(/propriet/i);
  });

  it('convidar desabilitado no limite', () => {
    render(<GestaoCoordenadores coordenadores={[DONO, ANA, BETO]} limite={3} donoId="dono" />);
    expect(screen.getByRole('button', { name: 'Convidar coordenador' })).toBeDisabled();
    expect(screen.getByText('Limite de 3 coordenadores atingido — aumente o limite para convidar mais.')).toBeInTheDocument();
  });

  it('convidar envia o pedido para /api/convites como coordenador', async () => {
    render(<GestaoCoordenadores coordenadores={[DONO]} limite={3} donoId="dono" />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('E-mail do novo coordenador'), 'novo@exemplo.com');
    await u.click(screen.getByRole('button', { name: 'Convidar coordenador' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/convites', expect.objectContaining({ method: 'POST' })));
    const corpo = JSON.parse((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(corpo).toEqual({ email: 'novo@exemplo.com', cargo: 'coordenador' });
    expect(await screen.findByText('Convite enviado para novo@exemplo.com.')).toBeInTheDocument();
  });

  it('remover chama definir_cargo com autenticado depois de confirmar', async () => {
    render(<GestaoCoordenadores coordenadores={[DONO, ANA]} limite={3} donoId="dono" />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Remover Ana Lima' }));
    expect(rpc).not.toHaveBeenCalled();
    await u.click(screen.getByRole('button', { name: 'Confirmar remoção' }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('definir_cargo', { perfil: 'ana', cargo: 'autenticado' }));
    expect(refresh).toHaveBeenCalled();
  });

  it('baixar o limite pede para escolher quem sai e envia remover', async () => {
    render(<GestaoCoordenadores coordenadores={[DONO, ANA, BETO]} limite={3} donoId="dono" />);
    const u = userEvent.setup();
    const campo = screen.getByLabelText('Limite de coordenadores');
    await u.clear(campo);
    await u.type(campo, '2');
    await u.click(screen.getByRole('button', { name: 'Salvar limite' }));
    expect(rpc).not.toHaveBeenCalled();
    expect(screen.getByText('Marque quem deixa de ser coordenador (1 pessoa).')).toBeInTheDocument();
    await u.click(screen.getByLabelText('Beto Reis'));
    await u.click(screen.getByRole('button', { name: 'Confirmar novo limite' }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('definir_limite_coordenadores', { n: 2, remover: ['beto'] }));
  });

  it('subir o limite salva direto', async () => {
    render(<GestaoCoordenadores coordenadores={[DONO, ANA, BETO]} limite={3} donoId="dono" />);
    const u = userEvent.setup();
    const campo = screen.getByLabelText('Limite de coordenadores');
    await u.clear(campo);
    await u.type(campo, '5');
    await u.click(screen.getByRole('button', { name: 'Salvar limite' }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('definir_limite_coordenadores', { n: 5, remover: [] }));
  });
});
