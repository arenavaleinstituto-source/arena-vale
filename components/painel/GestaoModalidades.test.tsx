import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const escritas: { op: string; valor: unknown }[] = [];
const LISTA = [
  { slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.', ordem: 1, ativo: true },
  { slug: 'volei', nome: 'Vôlei', frase: 'O palco do vôlei é aqui.', ordem: 4, ativo: true },
];
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {};
      q.select = () => q;
      q.order = () => Promise.resolve({ data: LISTA, error: null });
      q.insert = (v: unknown) => {
        escritas.push({ op: 'insert', valor: v });
        return { select: () => ({ single: () => Promise.resolve({ data: v, error: null }) }) };
      };
      q.update = (v: unknown) => {
        escritas.push({ op: 'update', valor: v });
        return { eq: () => Promise.resolve({ error: null }) };
      };
      return q;
    },
  }),
}));

import { GestaoModalidades } from './GestaoModalidades';

describe('GestaoModalidades', () => {
  beforeEach(() => {
    escritas.length = 0;
  });

  it('lista as modalidades cadastradas', async () => {
    render(<GestaoModalidades />);
    expect(await screen.findByText('Futsal')).toBeInTheDocument();
    expect(screen.getByText('Vôlei')).toBeInTheDocument();
  });

  it('adiciona modalidade nova com identificador e frase automáticos, no fim da lista', async () => {
    render(<GestaoModalidades />);
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText('Nome da nova modalidade'), 'Beach Tennis');
    await u.click(screen.getByRole('button', { name: 'Adicionar modalidade' }));
    await waitFor(() =>
      expect(escritas[0]).toEqual({ op: 'insert', valor: { slug: 'beach-tennis', nome: 'Beach Tennis', frase: 'O palco do beach tennis é aqui.', ordem: 5, ativo: true } }),
    );
    expect(await screen.findByText('Beach Tennis')).toBeInTheDocument();
  });

  it('não repete uma modalidade que já existe', async () => {
    render(<GestaoModalidades />);
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText('Nome da nova modalidade'), 'vôlei');
    await u.click(screen.getByRole('button', { name: 'Adicionar modalidade' }));
    expect(await screen.findByText('Essa modalidade já existe.')).toBeInTheDocument();
    expect(escritas).toEqual([]);
  });

  it('esconde uma modalidade do site sem apagar', async () => {
    render(<GestaoModalidades />);
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Esconder Vôlei do site' }));
    await waitFor(() => expect(escritas[0]).toEqual({ op: 'update', valor: { ativo: false } }));
  });
});
