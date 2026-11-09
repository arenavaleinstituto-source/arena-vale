import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const inserts: unknown[] = [];
const uploads: string[] = [];
let erroInsert: { code: string; message: string } | null = null;
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: (v: Record<string, unknown>) => {
        inserts.push(v);
        return { select: () => ({ single: () => Promise.resolve(erroInsert ? { data: null, error: erroInsert } : { data: { id: 'j-novo', ...v, cpf: undefined }, error: null }) }) };
      },
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
    rpc: () => Promise.resolve({ data: [{ id: 'j1', cpf: '52998224725' }], error: null }),
    storage: {
      from: () => ({
        upload: (caminho: string) => {
          uploads.push(caminho);
          return Promise.resolve({ error: null });
        },
        getPublicUrl: (caminho: string) => ({ data: { publicUrl: `https://cdn.test/${caminho}` } }),
      }),
    },
  }),
}));

import { CapitaoElenco } from './capitao-elenco';

const T = '11111111-2222-3333-4444-555555555555';

async function preencher(cpf: string) {
  const u = userEvent.setup();
  await u.type(screen.getByLabelText('Nome completo do atleta'), 'Gabriel Mendes');
  await u.type(screen.getByLabelText('CPF'), cpf);
  await u.type(screen.getByLabelText('Número da camisa'), '10');
  return u;
}

describe('CapitaoElenco', () => {
  beforeEach(() => {
    inserts.length = 0;
    uploads.length = 0;
    erroInsert = null;
  });

  it('lista os atletas com o CPF mascarado', async () => {
    render(<CapitaoElenco timeId={T} jogadoresIniciais={[{ id: 'j1', nome: 'Atleta Um', numero_camisa: 7, posicao: 'Pivô', foto_url: null }]} />);
    expect(await screen.findByText('CPF ***.***.***-25')).toBeInTheDocument();
    expect(screen.getByText('Atleta Um')).toBeInTheDocument();
  });

  it('CPF inválido não é gravado', async () => {
    render(<CapitaoElenco timeId={T} jogadoresIniciais={[]} />);
    const u = await preencher('52998224724');
    await u.click(screen.getByRole('button', { name: '+ Adicionar atleta' }));
    expect(screen.getByText('CPF inválido. Confira os números.')).toBeInTheDocument();
    expect(inserts).toEqual([]);
  });

  it('grava nome, CPF só com números e a equipe; o CPF aparece mascarado', async () => {
    render(<CapitaoElenco timeId={T} jogadoresIniciais={[]} />);
    const u = await preencher('52998224725');
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25');
    await u.click(screen.getByRole('button', { name: '+ Adicionar atleta' }));
    await waitFor(() => expect(inserts[0]).toMatchObject({ nome: 'Gabriel Mendes', cpf: '52998224725', time_id: T, numero_camisa: 10 }));
    expect(await screen.findByText('CPF ***.***.***-25')).toBeInTheDocument();
  });

  it('foto vai para a pasta da própria equipe', async () => {
    render(<CapitaoElenco timeId={T} jogadoresIniciais={[]} />);
    const u = await preencher('52998224725');
    await u.upload(screen.getByLabelText('Foto do atleta'), new File(['x'], 'rosto.png', { type: 'image/png' }));
    await u.click(screen.getByRole('button', { name: '+ Adicionar atleta' }));
    await waitFor(() => expect(uploads[0]).toMatch(new RegExp(`^${T}/`)));
    expect(inserts[0]).toMatchObject({ foto_url: expect.stringContaining(`https://cdn.test/${T}/`) });
  });

  it('CPF já usado em outra equipe: aviso claro', async () => {
    erroInsert = { code: '23505', message: 'duplicate key value violates unique constraint "jogadores_cpf_key"' };
    render(<CapitaoElenco timeId={T} jogadoresIniciais={[]} />);
    const u = await preencher('52998224725');
    await u.click(screen.getByRole('button', { name: '+ Adicionar atleta' }));
    expect(await screen.findByText('Este CPF já está cadastrado em outra equipe. Fale com a coordenação.')).toBeInTheDocument();
  });
});
