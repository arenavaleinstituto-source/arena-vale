import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../fake-consultas';

let sb = fakeConsultas();
const refresh = vi.fn();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/components/capitao-elenco', () => ({ CapitaoElenco: ({ timeId }: { timeId: string }) => <div>Elenco do time {timeId}</div> }));

import { MinhaEquipe } from './MinhaEquipe';

describe('MinhaEquipe', () => {
  it('capitão sem equipe vê o formulário e chama criar_minha_equipe', async () => {
    sb = fakeConsultas({}, { data: 'novo-time' });
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa Arena Vale', time: null, jogadores: [] }]} />);
    expect(screen.getByRole('heading', { name: 'CADASTRAR MINHA EQUIPE' })).toBeInTheDocument();
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Nome da equipe'), 'Leões do Vale');
    await u.type(screen.getByLabelText('Sigla'), 'leo');
    await u.click(screen.getByRole('button', { name: 'Cadastrar equipe' }));
    await waitFor(() => expect(sb.rpc).toHaveBeenCalledWith('criar_minha_equipe', { campeonato: 'c1', nome: 'Leões do Vale', sigla: 'leo', escudo_url: null }));
    expect(refresh).toHaveBeenCalled();
  });

  it('capitão vê a mensagem do banco quando já tem equipe', async () => {
    sb = fakeConsultas({}, { error: { message: 'Você já cadastrou sua equipe neste campeonato.' } });
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa', time: null, jogadores: [] }]} />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Nome da equipe'), 'X');
    await u.type(screen.getByLabelText('Sigla'), 'X');
    await u.click(screen.getByRole('button', { name: 'Cadastrar equipe' }));
    expect(await screen.findByText('Você já cadastrou sua equipe neste campeonato.')).toBeInTheDocument();
  });

  it('com equipe mostra o elenco', () => {
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa', time: { id: 't9', nome: 'Leões' }, jogadores: [] }]} />);
    expect(screen.getByText('Elenco do time t9')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CADASTRAR MINHA EQUIPE' })).toBeNull();
  });

  it('sem convite explica o que fazer', () => {
    render(<MinhaEquipe convites={[]} />);
    expect(screen.getByText('Você ainda não foi convidado como capitão em nenhum campeonato. Fale com a coordenação.')).toBeInTheDocument();
  });
});
