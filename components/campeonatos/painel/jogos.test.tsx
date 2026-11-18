import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../../fake-consultas';
import { regulamentoPadrao } from '@/lib/campeonatos/regulamento';
import type { JogoDoPainel } from './AbaJogosCampeonato';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { AbaJogosCampeonato } from './AbaJogosCampeonato';

const CAMP = { id: 'c1', regulamento: regulamentoPadrao('gols'), ordem_sorteio: {} };
const TIMES = { t1: { nome: 'Leões' }, t2: { nome: 'Tigres' } };

function jogo(p: Partial<JogoDoPainel>): JogoDoPainel {
  return {
    id: 'j1', ordem: 1, fase: 'Pontos corridos', grupo: null, rodada: 2, casa: 't1', visitante: 't2', status: 'agendado',
    placar_casa: null, placar_visitante: null, penaltis_casa: null, penaltis_visitante: null, wo: null, parciais: null,
    vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null, data: null, local: null, delegado_id: null, ...p,
  };
}

const abrir = (jogos: JogoDoPainel[], ehCoordenacao = false) =>
  render(<AbaJogosCampeonato campeonato={CAMP} jogos={jogos} times={TIMES} grupos={{}} ehCoordenacao={ehCoordenacao} delegados={[{ id: 'd1', nome: 'Dele' }]} onMudou={vi.fn()} />);

describe('AbaJogosCampeonato', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sb = fakeConsultas({ correcoes_jogo: [] });
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, avisos: ['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 7).'] }) });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('salvar o resultado recalcula as vagas e mostra o aviso', async () => {
    abrir([jogo({})]);
    const u = userEvent.setup();
    const card = screen.getByRole('group', { name: 'Leões × Tigres' });
    await u.type(within(card).getByLabelText('Gols Leões'), '2');
    await u.type(within(card).getByLabelText('Gols Tigres'), '1');
    await u.selectOptions(within(card).getByLabelText('Status'), 'finalizado');
    await u.click(within(card).getByRole('button', { name: 'Salvar resultado' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/campeonatos/c1/recalcular', { method: 'POST' }));
    expect(await screen.findByText('Este ajuste mudaria o classificado de um jogo já disputado (Jogo 7).')).toBeInTheDocument();
    expect(sb.escritas.find((e) => e.tabela === 'jogos')?.payload).toMatchObject({ placar_casa: 2, placar_visitante: 1, status: 'finalizado' });
  });

  it('aplica a data à rodada inteira', async () => {
    abrir([jogo({})]);
    const card = screen.getByRole('group', { name: 'Leões × Tigres' });
    fireEvent.change(within(card).getByLabelText('Data e hora'), { target: { value: '2026-11-20T19:30' } });
    await userEvent.setup().click(within(card).getByRole('button', { name: 'Aplicar esta data à rodada inteira' }));
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'jogos')).toBe(true));
    const escrita = sb.escritas.find((e) => e.tabela === 'jogos')!;
    expect(escrita.payload).toEqual({ data: '2026-11-20T19:30:00' });
    expect(escrita.filtros).toContainEqual(['eq', 'campeonato_id', 'c1']);
    expect(escrita.filtros).toContainEqual(['eq', 'rodada', 2]);
    // Jogos já disputados (ou em andamento) da rodada mantêm a data em que aconteceram.
    expect(escrita.filtros).toContainEqual(['not', 'status', 'in', '("finalizado","ao_vivo")']);
  });

  it('W.O. do visitante grava o placar padrão e encerra o jogo', async () => {
    abrir([jogo({})]);
    const u = userEvent.setup();
    const card = screen.getByRole('group', { name: 'Leões × Tigres' });
    await u.click(within(card).getByRole('button', { name: 'W.O.' }));
    await u.click(within(card).getByRole('button', { name: 'Faltou Tigres' }));
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'jogos')).toBe(true));
    expect(sb.escritas.find((e) => e.tabela === 'jogos')!.payload).toEqual({ wo: 'visitante', placar_casa: 3, placar_visitante: 0, status: 'finalizado' });
  });

  it('só a coordenação escolhe o delegado', () => {
    const { unmount } = abrir([jogo({})], false);
    expect(screen.queryByLabelText('Delegado do jogo')).toBeNull();
    unmount();
    abrir([jogo({})], true);
    expect(screen.getByLabelText('Delegado do jogo')).toBeInTheDocument();
  });

  it.each([true, false])('corrigir súmula de jogo encerrado (coordenação: %s) não mexe no status e recalcula', async (coord) => {
    abrir([jogo({ status: 'finalizado', placar_casa: 1, placar_visitante: 0 })], coord);
    const u = userEvent.setup();
    const card = screen.getByRole('group', { name: 'Leões × Tigres' });
    await u.click(within(card).getByRole('button', { name: 'Corrigir súmula' }));
    expect(within(card).getByText('Correção de jogo encerrado: o delegado não volta a ter acesso.')).toBeInTheDocument();
    const casa = within(card).getByLabelText('Gols Leões');
    await u.clear(casa);
    await u.type(casa, '2');
    const fora = within(card).getByLabelText('Gols Tigres');
    await u.clear(fora);
    await u.type(fora, '2');
    await u.click(within(card).getByRole('button', { name: 'Salvar correção' }));
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'jogos')).toBe(true));
    const payload = sb.escritas.find((e) => e.tabela === 'jogos')!.payload as Record<string, unknown>;
    expect(payload).toMatchObject({ placar_casa: 2, placar_visitante: 2 });
    expect('status' in payload).toBe(false);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/campeonatos/c1/recalcular', { method: 'POST' }));
  });

  it('o "Corrigido em" aparece só para a coordenação', async () => {
    sb = fakeConsultas({ correcoes_jogo: [{ jogo_id: 'j1', corrigido_em: '2026-11-18T00:30:00Z', corrigido_por: 'p1', antes: { placar_casa: 1 }, depois: { placar_casa: 2 } }] });
    const { unmount } = abrir([jogo({ status: 'finalizado', placar_casa: 2, placar_visitante: 0 })], true);
    expect(await screen.findByText('Corrigido em 17/11 às 21:30')).toBeInTheDocument();
    unmount();
    sb = fakeConsultas({ correcoes_jogo: [{ jogo_id: 'j1', corrigido_em: '2026-11-18T00:30:00Z' }] });
    abrir([jogo({ status: 'finalizado', placar_casa: 2, placar_visitante: 0 })], false);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText(/Corrigido em/)).toBeNull();
    expect(sb.from.mock.calls.map((c) => c[0])).not.toContain('correcoes_jogo');
  });

  it('vaga ainda aberta mostra o rótulo e permite troca manual', async () => {
    abrir([jogo({ id: 'f', ordem: 3, fase: 'Final', rodada: null, casa: null, visitante: null, vaga_casa: { tipo: 'grupo', grupo: 'A', posicao: 1 }, vaga_visitante: { tipo: 'grupo', grupo: 'B', posicao: 1 } })]);
    const card = screen.getByRole('group', { name: '1º do Grupo A × 1º do Grupo B' });
    const u = userEvent.setup();
    await u.selectOptions(within(card).getByLabelText('Trocar o time da casa'), 't1');
    await u.click(within(card).getByRole('button', { name: 'Salvar troca' }));
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'jogos')).toBe(true));
    expect(sb.escritas.find((e) => e.tabela === 'jogos')!.payload).toEqual({ time_casa_id: 't1', vaga_manual: true });
    expect(screen.getByText('Troca manual: o recálculo automático não mexe mais nesta vaga.')).toBeInTheDocument();
  });
});

describe('AbaJogosCampeonato — desempate na volta', () => {
  beforeEach(() => {
    sb = fakeConsultas();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, avisos: [] }) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  const idaVolta = (tipo: 'gols' | 'sets', ida: [number, number]) => {
    const campeonato = { id: 'c1', regulamento: regulamentoPadrao(tipo), ordem_sorteio: {} };
    const jogos = [
      jogo({ id: 'ida', ordem: 1, fase: 'Semifinal', rodada: null, casa: 't1', visitante: 't2', status: 'finalizado', placar_casa: ida[0], placar_visitante: ida[1] }),
      jogo({ id: 'volta', ordem: 2, fase: 'Semifinal', rodada: null, casa: 't2', visitante: 't1', jogo_volta_de: 'ida' }),
    ];
    render(<AbaJogosCampeonato campeonato={campeonato} jogos={jogos} times={TIMES} grupos={{}} ehCoordenacao={false} delegados={[]} onMudou={vi.fn()} />);
    return screen.getByRole('group', { name: 'Tigres × Leões' });
  };

  it('gols: pênaltis só aparecem quando a soma empata', async () => {
    const card = idaVolta('gols', [2, 1]); // Leões 2 x 1 Tigres na ida
    const u = userEvent.setup();
    await u.type(within(card).getByLabelText('Gols Tigres'), '1');
    await u.type(within(card).getByLabelText('Gols Leões'), '0');
    expect(within(card).getByLabelText('Pênaltis Tigres')).toBeInTheDocument(); // 2 x 2 no agregado
    await u.clear(within(card).getByLabelText('Gols Tigres'));
    await u.type(within(card).getByLabelText('Gols Tigres'), '3');
    expect(within(card).queryByLabelText('Pênaltis Tigres')).toBeNull();
  });

  it('sets: set de ouro quando cada time vence um jogo', async () => {
    const card = idaVolta('sets', [2, 0]); // Leões venceu a ida
    const u = userEvent.setup();
    await u.type(within(card).getByLabelText('Sets Tigres'), '2');
    await u.type(within(card).getByLabelText('Sets Leões'), '1');
    expect(within(card).getByLabelText('Set de ouro Tigres')).toBeInTheDocument();
    await u.clear(within(card).getByLabelText('Sets Tigres'));
    await u.type(within(card).getByLabelText('Sets Tigres'), '0');
    await u.clear(within(card).getByLabelText('Sets Leões'));
    await u.type(within(card).getByLabelText('Sets Leões'), '2');
    expect(within(card).queryByLabelText('Set de ouro Tigres')).toBeNull();
  });
});
