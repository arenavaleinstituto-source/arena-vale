import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from './fake-consultas';

const JOGO = { id: 'j1', campeonato_id: 'c1', time_casa_id: 't1', time_visitante_id: 't2', status: 'agendado', placar_casa: 1, placar_visitante: 0, data: '2026-11-20T20:00:00Z', local: 'Ginásio', delegado_id: null };
const sb = fakeConsultas({ jogos: [JOGO], times: [{ id: 't1', nome: 'Leões' }, { id: 't2', nome: 'Tigres' }], campeonatos: [{ id: 'c1', nome: 'Copa' }], profiles: [{ id: 'd1', full_name: 'Carlos Delegado', email: 'c@x' }] });
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
const recalcularVagas = vi.fn(async (_id: string) => [] as string[]);
vi.mock('@/components/campeonatos/painel/api', () => ({ recalcularVagas: (id: string) => recalcularVagas(id) }));

import { CoordJogos } from './coord-jogos';

describe('CoordJogos', () => {
  it('finalizar um jogo recalcula as vagas do campeonato', async () => {
    render(<CoordJogos />);
    await userEvent.setup().click(await screen.findByRole('button', { name: '✓ Finalizar jogo' }));
    await waitFor(() => expect(recalcularVagas).toHaveBeenCalledWith('c1'));
  });

  it('mudar o placar também recalcula', async () => {
    recalcularVagas.mockClear();
    render(<CoordJogos />);
    const mais = await screen.findAllByRole('button', { name: '+' });
    await userEvent.setup().click(mais[0]);
    await waitFor(() => expect(recalcularVagas).toHaveBeenCalledWith('c1'));
  });

  it('cadastrar jogo já com o delegado escolhido', async () => {
    render(<CoordJogos />);
    const u = userEvent.setup();
    await u.selectOptions(await screen.findByDisplayValue('Selecione o campeonato'), 'c1');
    fireEvent.change(document.querySelector('input[type="datetime-local"]')!, { target: { value: '2026-11-25T20:00' } });
    await u.selectOptions(screen.getByDisplayValue('Time da casa'), 't1');
    await u.selectOptions(screen.getByDisplayValue('Time visitante'), 't2');
    await u.selectOptions(screen.getByLabelText('Delegado (opcional)'), 'd1');
    await u.click(screen.getByRole('button', { name: '+ Criar jogo' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'jogos' && e.op === 'insert')?.payload).toMatchObject({ campeonato_id: 'c1', delegado_id: 'd1' }));
  });

  it('marcar "Terá transmissão" num jogo cadastrado grava em transmissoes', async () => {
    render(<CoordJogos />);
    await userEvent.setup().click(await screen.findByRole('checkbox', { name: /📺 Terá transmissão$/ }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'transmissoes' && e.op === 'insert')?.payload).toMatchObject({ jogo_id: 'j1', plataforma: 'youtube' }));
  });

  it('transmissão avulsa: cadastra na agenda_jogos', async () => {
    render(<CoordJogos />);
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText('Equipe da casa'), 'Real Blumenau');
    await u.type(screen.getByLabelText('Equipe visitante'), 'Sede');
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2026-11-20T12:30' } });
    await u.click(screen.getByRole('button', { name: '+ Adicionar transmissão' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'agenda_jogos' && e.op === 'insert')?.payload).toMatchObject({ equipe_casa: 'Real Blumenau', equipe_fora: 'Sede', status: 'Agendado' }));
  });
});
