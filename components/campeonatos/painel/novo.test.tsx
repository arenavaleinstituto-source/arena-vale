import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../../fake-consultas';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('@/lib/midia/useModalidades', () => ({ useModalidades: () => [{ slug: 'futsal', nome: 'Futsal', frase: '' }] }));
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { NovoCampeonato } from './NovoCampeonato';
import { EnquadrarImagem } from './EnquadrarImagem';
import { MeusCampeonatos } from './MeusCampeonatos';

const TIMES = [
  { id: 't1', nome: 'Leões', sigla: 'LEO', escudo_url: null, escudo_cor: null },
  { id: 't2', nome: 'Tigres', sigla: 'TIG', escudo_url: null, escudo_cor: null },
];
const JOGOS = [{ ordem: 1, fase: 'Pontos corridos', rodada: 1, grupo: null, casa: 't1', visitante: 't2', vaga_casa: null, vaga_visitante: null, volta_de: null }];

describe('NovoCampeonato', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sb = fakeConsultas({ times: TIMES, inscricoes: [] }, { data: 'c1' });
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, jogos: JOGOS, avisos: [] }) });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('passo 1 sem nome avisa e não cria nada', async () => {
    render(<NovoCampeonato onCriado={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Informe o nome do campeonato.')).toBeInTheDocument();
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it('do passo 1 ao 5: cria, inscreve, revisa os jogos e gera para valer', async () => {
    const onCriado = vi.fn();
    const u = userEvent.setup();
    render(<NovoCampeonato onCriado={onCriado} />);

    await u.type(screen.getByLabelText('Nome do campeonato'), 'Copa X');
    await u.selectOptions(screen.getByLabelText('Modalidade'), 'futsal');
    await u.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(sb.rpc).toHaveBeenCalledWith('criar_campeonato', expect.objectContaining({ p_nome: 'Copa X', p_modalidade: 'futsal' })));

    expect(await screen.findByText('O escudo do time é colocado pelo capitão.')).toBeInTheDocument();
    await u.type(screen.getByLabelText('Buscar time pelo nome'), 'e');
    await u.click(screen.getByRole('button', { name: 'Buscar' }));
    await u.click(await screen.findByRole('button', { name: 'Inscrever Leões' }));
    await u.click(await screen.findByRole('button', { name: 'Inscrever Tigres' }));
    expect(sb.escritas.filter((e) => e.tabela === 'inscricoes' && e.op === 'insert')).toHaveLength(2);
    expect(sb.escritas.find((e) => e.tabela === 'inscricoes')?.payload).toMatchObject({ campeonato_id: 'c1', time_id: 't1', status: 'aprovada' });
    await u.click(screen.getByRole('button', { name: 'Continuar' }));

    await u.click(await screen.findByRole('button', { name: 'Continuar' })); // forma de disputa (pontos corridos)
    await u.click(await screen.findByRole('button', { name: 'Continuar' })); // regulamento padrão
    await waitFor(() => expect(sb.escritas.some((e) => e.tabela === 'campeonatos' && e.op === 'update')).toBe(true));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/campeonatos/c1/gerar', expect.objectContaining({ method: 'POST' })));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ simular: true, forma: { tipo: 'pontos_corridos' } });
    expect(await screen.findByText('Leões x Tigres')).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: 'Gerar os jogos' }));
    await waitFor(() => expect(onCriado).toHaveBeenCalledWith('c1'));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ simular: false });
    // A prévia e a geração usam o mesmo sorteio (a mesma semente), para sair igual ao que foi revisado.
    const semente = JSON.parse(fetchMock.mock.calls[0][1].body).semente;
    expect(Number.isInteger(semente)).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).semente).toBe(semente);
  });
});

describe('EnquadrarImagem', () => {
  it('mudar o zoom atualiza a prévia', () => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:teste', revokeObjectURL: () => undefined });
    render(<EnquadrarImagem arquivo={new File([new Uint8Array(4)], 'escudo.png', { type: 'image/png' })} onPronto={vi.fn()} />);
    const previa = screen.getByRole('img', { name: 'Prévia no cartão (96 px)' });
    const antes = previa.getAttribute('style');
    fireEvent.change(screen.getByLabelText('Aproximar'), { target: { value: '2' } });
    expect(previa.getAttribute('style')).not.toBe(antes);
    vi.unstubAllGlobals();
  });
});

describe('MeusCampeonatos', () => {
  it('mostra o selo nos escondidos e o link de pré-visualização', () => {
    render(
      <MeusCampeonatos
        ehCoordenacao={false}
        campeonatos={[
          { id: 'c1', nome: 'Copa X', ano: 2026, slug: 'copa-x-2026', visivel: false, modalidade: 'futsal' },
          { id: 'c2', nome: 'Liga Y', ano: 2026, slug: 'liga-y-2026', visivel: true, modalidade: 'futsal' },
        ]}
      />,
    );
    expect(screen.getAllByText('Aguardando liberação da ARENA VALE')).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: 'Pré-visualizar' })[0]).toHaveAttribute('href', '/campeonatos/copa-x-2026');
    expect(screen.getAllByRole('link', { name: 'Abrir' })[0]).toHaveAttribute('href', '?campeonato=c1');
  });
});
