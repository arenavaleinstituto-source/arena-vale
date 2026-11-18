import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from './fake-consultas';

type Sb = ReturnType<typeof fakeConsultas> & { storage?: unknown };
let sb: Sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { CapitaoElenco, type AtletaDoElenco } from './capitao-elenco';

const T = '11111111-2222-3333-4444-555555555555';
const ATLETA: AtletaDoElenco = { linha: 'l1', id: 'j1', nome: 'Ana Souza', numero_camisa: 7, posicao: 'Ala', foto_url: null };

async function preencher(cpf = '52998224725') {
  const u = userEvent.setup();
  await u.type(screen.getByLabelText('Nome completo do atleta'), 'Bruno Lima');
  await u.type(screen.getByLabelText('CPF'), cpf);
  return u;
}
const adicionar = (u: ReturnType<typeof userEvent.setup>) => u.click(screen.getByRole('button', { name: '+ Adicionar atleta' }));

describe('CapitaoElenco', () => {
  it('lista o elenco com o CPF mascarado', async () => {
    sb = fakeConsultas({}, { data: [{ id: 'j1', cpf: '52998224725' }] });
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[ATLETA]} outrasInscricoes={[]} />);
    expect(await screen.findByText('CPF 529...')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
  });

  it('CPF inválido não chama o banco', async () => {
    sb = fakeConsultas();
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[]} />);
    await adicionar(await preencher('52998224724'));
    expect(screen.getByText('CPF inválido. Confira os números.')).toBeInTheDocument();
    expect(sb.rpc).not.toHaveBeenCalledWith('inscrever_atleta', expect.anything());
  });

  it('adicionar atleta inscreve no campeonato pelo inscrever_atleta', async () => {
    sb = fakeConsultas({}, { data: 'nova-linha' });
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[]} />);
    const u = await preencher();
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25');
    await u.type(screen.getByLabelText('Número da camisa'), '10');
    await adicionar(u);
    await waitFor(() =>
      expect(sb.rpc).toHaveBeenCalledWith('inscrever_atleta', { p_inscricao: 'i1', p_cpf: '52998224725', p_nome: 'Bruno Lima', p_posicao: null, p_numero: 10, p_foto_url: null }),
    );
    expect(sb.from).not.toHaveBeenCalledWith('jogadores');
    expect(await screen.findByText('Atleta adicionado.')).toBeInTheDocument();
  });

  it('foto vai para a pasta da própria equipe', async () => {
    const uploads: string[] = [];
    sb = fakeConsultas({}, { data: 'nova-linha' });
    sb.storage = {
      from: () => ({
        upload: (caminho: string) => (uploads.push(caminho), Promise.resolve({ error: null })),
        getPublicUrl: (caminho: string) => ({ data: { publicUrl: `https://cdn.test/${caminho}` } }),
      }),
    };
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[]} />);
    const u = await preencher();
    await u.upload(screen.getByLabelText('Foto do atleta'), new File(['x'], 'rosto.png', { type: 'image/png' }));
    await adicionar(u);
    await waitFor(() => expect(uploads[0]).toMatch(new RegExp(`^${T}/`)));
    expect(sb.rpc).toHaveBeenCalledWith('inscrever_atleta', expect.objectContaining({ p_foto_url: expect.stringContaining(`https://cdn.test/${T}/`) }));
  });

  it('mostra a mensagem do banco quando o atleta já está em outro time', async () => {
    sb = fakeConsultas({}, { error: { message: 'Este atleta já está inscrito neste campeonato pelo time Leões.' } });
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[]} />);
    await adicionar(await preencher());
    expect(await screen.findByText('Este atleta já está inscrito neste campeonato pelo time Leões.')).toBeInTheDocument();
  });

  it('"Copiar elenco" chama copiar_elenco e diz quantos vieram', async () => {
    sb = fakeConsultas({}, { data: 3 });
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[{ id: 'i0', campeonatoNome: 'Copa 2025' }]} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Copiar elenco de outro campeonato' }));
    await waitFor(() => expect(sb.rpc).toHaveBeenCalledWith('copiar_elenco', { p_destino: 'i1', p_origem: 'i0' }));
    expect(await screen.findByText('3 atletas copiados.')).toBeInTheDocument();
  });

  it('sem outra inscrição do time, não oferece copiar', () => {
    sb = fakeConsultas();
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[]} outrasInscricoes={[]} />);
    expect(screen.queryByRole('button', { name: 'Copiar elenco de outro campeonato' })).toBeNull();
  });

  it('tirar do elenco apaga só a linha de inscricao_atletas', async () => {
    sb = fakeConsultas();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CapitaoElenco timeId={T} inscricaoId="i1" elencoInicial={[ATLETA]} outrasInscricoes={[]} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tirar do elenco' }));
    await waitFor(() => expect(sb.escritas).toEqual([{ tabela: 'inscricao_atletas', op: 'delete', payload: undefined, filtros: [['eq', 'id', 'l1']] }]));
    expect(await screen.findByText('Nenhum atleta no elenco deste campeonato.')).toBeInTheDocument();
  });
});
