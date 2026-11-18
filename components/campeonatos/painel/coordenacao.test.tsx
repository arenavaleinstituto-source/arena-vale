import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../../fake-consultas';

let sb: ReturnType<typeof fakeConsultas> | Record<string, unknown> = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('./GerenciarCampeonato', () => ({ GerenciarCampeonato: ({ id }: { id: string }) => <p>Gerenciando {id}</p> }));

import { ControlesCoordenacao } from './ControlesCoordenacao';
import { CoordCampeonatos } from '@/components/coord-campeonatos';

const CAMP = { id: 'c1', nome: 'Copa X', slug: 'copa-x-2026', visivel: false, fases_destravadas: [] as string[] };
const MODS = (n: number) => Array.from({ length: n }, (_, i) => ({ profile_id: `m${i}`, profiles: { full_name: `Moderador ${i}`, email: `m${i}@x` } }));

describe('CoordCampeonatos', () => {
  it('a lista "Aguardando liberação" mostra só os escondidos', async () => {
    sb = fakeConsultas({
      campeonatos: [
        { id: 'c1', nome: 'Copa Escondida', ano: 2026, slug: 'copa-escondida-2026', visivel: false, modalidade: 'futsal' },
        { id: 'c2', nome: 'Liga Liberada', ano: 2026, slug: 'liga-liberada-2026', visivel: true, modalidade: 'futsal' },
      ],
    });
    render(<CoordCampeonatos />);
    const lista = await screen.findByRole('region', { name: 'Aguardando liberação' });
    expect(within(lista).getByText('Copa Escondida')).toBeInTheDocument();
    expect(within(lista).queryByText('Liga Liberada')).toBeNull();
  });
});

describe('ControlesCoordenacao', () => {
  beforeEach(() => {
    sb = fakeConsultas({ campeonato_moderadores: MODS(1), profiles: [{ id: 'm9', full_name: 'Novo Mod', email: 'n@x' }] });
  });

  it('ligar "Visível no site" grava visivel = true', async () => {
    render(<ControlesCoordenacao campeonato={CAMP} fasesComResultado={[]} onMudou={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Visível no site' }));
    const s = sb as ReturnType<typeof fakeConsultas>;
    await waitFor(() => expect(s.escritas.find((e) => e.tabela === 'campeonatos')?.payload).toEqual({ visivel: true }));
  });

  it('endereço repetido mostra a mensagem', async () => {
    const cadeia: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'in', 'order']) cadeia[m] = () => cadeia;
    cadeia.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
    sb = {
      from: () => ({
        ...cadeia,
        update: () => ({ eq: () => Promise.resolve({ error: { code: '23505', message: 'duplicate key' } }) }),
      }),
      rpc: vi.fn(),
    };
    render(<ControlesCoordenacao campeonato={CAMP} fasesComResultado={[]} onMudou={vi.fn()} />);
    const u = userEvent.setup();
    const campo = screen.getByLabelText('Endereço no site');
    await u.clear(campo);
    await u.type(campo, 'copa-y');
    await u.click(screen.getByRole('button', { name: 'Salvar endereço' }));
    expect(await screen.findByText('Este endereço já é de outro campeonato.')).toBeInTheDocument();
  });

  it('"Apagar campeonato" só com o nome digitado igual', async () => {
    render(<ControlesCoordenacao campeonato={CAMP} fasesComResultado={[]} onMudou={vi.fn()} />);
    const u = userEvent.setup();
    const botao = screen.getByRole('button', { name: 'Apagar campeonato' });
    expect(botao).toBeDisabled();
    await u.type(screen.getByLabelText('Para apagar, digite o nome do campeonato'), 'Copa');
    expect(botao).toBeDisabled();
    await u.type(screen.getByLabelText('Para apagar, digite o nome do campeonato'), ' X');
    expect(botao).toBeEnabled();
  });

  it('com 3 moderadores, não oferece adicionar outro', async () => {
    sb = fakeConsultas({ campeonato_moderadores: MODS(3), profiles: [{ id: 'm9', full_name: 'Novo Mod', email: 'n@x' }] });
    render(<ControlesCoordenacao campeonato={CAMP} fasesComResultado={[]} onMudou={vi.fn()} />);
    expect(await screen.findByText('3 de 3 moderadores')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar' })).toBeNull();
  });

  it('destravar uma fase com resultado grava em fases_destravadas', async () => {
    render(<ControlesCoordenacao campeonato={CAMP} fasesComResultado={['Fase de grupos']} onMudou={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Destravar Fase de grupos' }));
    const s = sb as ReturnType<typeof fakeConsultas>;
    await waitFor(() => expect(s.escritas.find((e) => e.tabela === 'campeonatos')?.payload).toEqual({ fases_destravadas: ['Fase de grupos'] }));
  });
});
