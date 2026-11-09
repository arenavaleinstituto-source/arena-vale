import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../fake-consultas';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ResultadosCampeonato, type CampeonatoDoModerador } from './ResultadosCampeonato';

const CAMP: CampeonatoDoModerador = {
  id: 'c1',
  nome: 'Copa Arena Vale',
  jogos: [{
    id: 'j1', data: '2026-11-15T22:00:00Z', local: 'Ginásio', status: 'agendado',
    placar_casa: 0, placar_visitante: 0, placar_casa_1t: null, placar_visitante_1t: null,
    casa: { id: 't1', nome: 'Metro' }, fora: { id: 't2', nome: 'Vale FC' },
  }],
  classificacao: [{ time_id: 't1', time_nome: 'Metro', jogos: 0, pontos: 0, saldo: 0, vitorias: 0, empates: 0, derrotas: 0 }],
};

describe('ResultadosCampeonato', () => {
  it('moderador sem campeonato vê a mensagem', () => {
    render(<ResultadosCampeonato campeonatos={[]} />);
    expect(screen.getByText('Nenhum campeonato liberado para você ainda. Fale com a coordenação.')).toBeInTheDocument();
  });

  it('salva placar com update apenas de placar/status', async () => {
    sb = fakeConsultas();
    render(<ResultadosCampeonato campeonatos={[CAMP]} />);
    const jogo = screen.getByRole('group', { name: 'Metro × Vale FC' });
    const u = userEvent.setup();
    const casa = within(jogo).getByLabelText('Gols Metro');
    await u.clear(casa);
    await u.type(casa, '3');
    const fora = within(jogo).getByLabelText('Gols Vale FC');
    await u.clear(fora);
    await u.type(fora, '1');
    await u.selectOptions(within(jogo).getByLabelText('Status'), 'finalizado');
    await u.click(within(jogo).getByRole('button', { name: 'Salvar resultado' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'jogos')).toBeTruthy());
    const escrita = sb.escritas.find((e) => e.tabela === 'jogos')!;
    expect(escrita.op).toBe('update');
    expect(Object.keys(escrita.payload as object).sort()).toEqual(['placar_casa', 'placar_casa_1t', 'placar_visitante', 'placar_visitante_1t', 'status']);
    expect(escrita.payload).toMatchObject({ placar_casa: 3, placar_visitante: 1, status: 'finalizado' });
    expect(escrita.filtros).toContainEqual(['eq', 'id', 'j1']);
  });

  it('adiciona um gol como evento do jogo', async () => {
    sb = fakeConsultas();
    render(<ResultadosCampeonato campeonatos={[CAMP]} />);
    const jogo = screen.getByRole('group', { name: 'Metro × Vale FC' });
    const u = userEvent.setup();
    await u.selectOptions(within(jogo).getByLabelText('Tipo de evento'), 'gol');
    await u.type(within(jogo).getByLabelText('Minuto'), '27');
    await u.selectOptions(within(jogo).getByLabelText('Time do evento'), 't2');
    await u.click(within(jogo).getByRole('button', { name: 'Adicionar evento' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'eventos_jogo')).toBeTruthy());
    expect(sb.escritas.find((e) => e.tabela === 'eventos_jogo')!.payload).toEqual({ jogo_id: 'j1', tipo: 'gol', minuto: 27, time_id: 't2' });
  });

  it('mostra a classificação calculada', () => {
    render(<ResultadosCampeonato campeonatos={[CAMP]} />);
    expect(screen.getByRole('table', { name: 'Classificação — Copa Arena Vale' })).toBeInTheDocument();
  });
});
