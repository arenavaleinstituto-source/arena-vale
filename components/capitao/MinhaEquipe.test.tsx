import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../fake-consultas';

let sb = fakeConsultas();
const refresh = vi.fn();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/components/capitao-elenco', () => ({
  CapitaoElenco: ({ timeId, inscricaoId, outrasInscricoes }: { timeId: string; inscricaoId: string; outrasInscricoes: unknown[] }) => (
    <div>Elenco do time {timeId} na inscrição {inscricaoId} ({outrasInscricoes.length} outras)</div>
  ),
}));
vi.mock('@/components/campeonatos/painel/EscudoDoTime', () => ({ EscudoDoTime: ({ time }: { time: { id: string } }) => <div>Escudo do time {time.id}</div> }));

import { MinhaEquipe } from './MinhaEquipe';

describe('MinhaEquipe', () => {
  it('capitão sem equipe vê o formulário e chama criar_minha_equipe', async () => {
    sb = fakeConsultas({}, { data: 'novo-time' });
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa Arena Vale', time: null, inscricaoId: null, outrasInscricoes: [], elenco: [] }]} />);
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
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa', time: null, inscricaoId: null, outrasInscricoes: [], elenco: [] }]} />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Nome da equipe'), 'X');
    await u.type(screen.getByLabelText('Sigla'), 'X');
    await u.click(screen.getByRole('button', { name: 'Cadastrar equipe' }));
    expect(await screen.findByText('Você já cadastrou sua equipe neste campeonato.')).toBeInTheDocument();
  });

  const TIME = { id: 't9', nome: 'Leões', sigla: 'LEO', escudo_url: null, escudo_cor: null };

  it('com equipe mostra o escudo e o elenco daquele campeonato', () => {
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa', time: TIME, inscricaoId: 'i1', outrasInscricoes: [{ id: 'i0', campeonatoNome: 'Copa 2025' }], elenco: [] }]} />);
    expect(screen.getByText('Elenco do time t9 na inscrição i1 (1 outras)')).toBeInTheDocument();
    expect(screen.getByText('Escudo do time t9')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CADASTRAR MINHA EQUIPE' })).toBeNull();
  });

  it('equipe sem inscrição no campeonato explica o que fazer', () => {
    render(<MinhaEquipe convites={[{ campeonatoId: 'c1', campeonatoNome: 'Copa', time: TIME, inscricaoId: null, outrasInscricoes: [], elenco: [] }]} />);
    expect(screen.getByText('A inscrição da sua equipe neste campeonato ainda não apareceu. Fale com a coordenação.')).toBeInTheDocument();
  });

  it('sem convite explica o que fazer', () => {
    render(<MinhaEquipe convites={[]} />);
    expect(screen.getByText('Você ainda não foi convidado como capitão em nenhum campeonato. Fale com a coordenação.')).toBeInTheDocument();
  });
});
