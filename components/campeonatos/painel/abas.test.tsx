import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../../fake-consultas';
import { regulamentoPadrao } from '@/lib/campeonatos/regulamento';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('@/lib/midia/useModalidades', () => ({ useModalidades: () => [{ slug: 'futsal', nome: 'Futsal', frase: '' }] }));

import { AbaTimesCampeonato } from './AbaTimesCampeonato';
import { AbaFormaCampeonato } from './AbaFormaCampeonato';
import { AbaDadosCampeonato } from './AbaDadosCampeonato';

const TIMES = [
  { id: 't1', nome: 'Leões', sigla: 'LEO', escudo_url: null, escudo_cor: null },
  { id: 't2', nome: 'Tigres', sigla: 'TIG', escudo_url: null, escudo_cor: null },
];

describe('AbaTimesCampeonato', () => {
  it('sem permissão para editar o time, não aparece o botão Editar', async () => {
    sb = fakeConsultas({}, { data: false });
    render(<AbaTimesCampeonato campeonatoId="c1" times={TIMES} temJogos={false} ehCoordenacao={false} onMudou={vi.fn()} />);
    await waitFor(() => expect(sb.rpc).toHaveBeenCalledWith('pode_editar_time_cadastrado', { t: 't1' }));
    expect(screen.queryByRole('button', { name: /Editar/ })).toBeNull();
  });

  it('com permissão, edita nome e sigla', async () => {
    sb = fakeConsultas({}, { data: true });
    render(<AbaTimesCampeonato campeonatoId="c1" times={TIMES} temJogos={false} ehCoordenacao={false} onMudou={vi.fn()} />);
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Editar Leões' }));
    const nome = screen.getByLabelText('Novo nome de Leões');
    await u.clear(nome);
    await u.type(nome, 'Leões FC');
    await u.click(screen.getByRole('button', { name: 'Salvar time' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'times')?.payload).toEqual({ nome: 'Leões FC', sigla: 'LEO' }));
  });
});

describe('AbaFormaCampeonato', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sb = fakeConsultas();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });
  afterEach(() => vi.unstubAllGlobals());

  const abrir = () =>
    render(<AbaFormaCampeonato campeonatoId="c1" regulamento={regulamentoPadrao('gols')} times={TIMES} temJogos travada={false} onMudou={vi.fn()} />);

  it('com jogos gerados, pergunta e recria com formaMudou', async () => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, jogos: [], avisos: ['O Jogo 3 já foi disputado e foi mantido.'] }) });
    vi.stubGlobal('fetch', fetchMock);
    abrir();
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Mata-mata' }));
    await u.click(screen.getByRole('button', { name: 'Salvar forma de disputa' }));
    expect(window.confirm).toHaveBeenCalledWith('Recriar os jogos que ainda não foram disputados?');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/campeonatos/c1/gerar', expect.anything()));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ formaMudou: true, simular: false, forma: { tipo: 'mata_mata' } });
    expect(await screen.findByText('O Jogo 3 já foi disputado e foi mantido.')).toBeInTheDocument();
  });

  it('mostra o erro da trava', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false, erro: 'A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.' }) }));
    abrir();
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Mata-mata' }));
    await u.click(screen.getByRole('button', { name: 'Salvar forma de disputa' }));
    expect(await screen.findByText('A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.')).toBeInTheDocument();
  });

  it('se a pessoa não confirmar, nada é recriado', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    abrir();
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Mata-mata' }));
    await u.click(screen.getByRole('button', { name: 'Salvar forma de disputa' }));
    expect(f).not.toHaveBeenCalled();
  });
});

describe('AbaDadosCampeonato', () => {
  it('salva nome, ano, categoria, modalidade e situação', async () => {
    sb = fakeConsultas();
    const campeonato = { id: 'c1', nome: 'Copa X', ano: 2026, categoria: null, modalidade: 'futsal', status: 'em_andamento', logo_url: null };
    render(<AbaDadosCampeonato campeonato={campeonato} onMudou={vi.fn()} />);
    const u = userEvent.setup();
    await u.clear(screen.getByLabelText('Nome do campeonato'));
    await u.type(screen.getByLabelText('Nome do campeonato'), 'Copa Y');
    await u.selectOptions(screen.getByLabelText('Situação'), 'finalizado');
    await u.click(screen.getByRole('button', { name: 'Salvar dados' }));
    await waitFor(() => expect(sb.escritas.find((e) => e.tabela === 'campeonatos')?.payload).toMatchObject({ nome: 'Copa Y', status: 'finalizado', ano: 2026 }));
  });
});
