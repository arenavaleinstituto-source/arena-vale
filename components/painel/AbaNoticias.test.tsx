import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const LINHAS = [
  { id: 'a', titulo: 'Final da Copa', status: 'publicado', aba: 'arena', origem: 'manual', created_at: '2026-11-03T00:00:00Z', imagem_url: 'https://x/a.jpg' },
  { id: 'b', titulo: 'Golaço na Itália', status: 'rascunho', aba: 'mundo', origem: 'telegram', created_at: '2026-11-02T00:00:00Z', imagem_url: null },
  { id: 'c', titulo: 'Rascunho manual', status: 'rascunho', aba: 'arena', origem: 'manual', created_at: '2026-11-01T00:00:00Z', imagem_url: null },
];
function consulta() {
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order', 'limit']) q[m] = () => q;
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: LINHAS, error: null }).then(ok);
  return q;
}
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: consulta, rpc: () => Promise.resolve({ data: [{ modo: 'guardar_arquivo', dias: 30 }], error: null }), storage: { from: () => ({}) } }),
}));
const replace = vi.fn();
let busca = new URLSearchParams();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), usePathname: () => '/coordenador', useSearchParams: () => busca }));

import { AbaNoticias } from './AbaNoticias';

describe('AbaNoticias', () => {
  it('lista todas e destaca os rascunhos do Telegram', async () => {
    busca = new URLSearchParams('aba=noticias');
    render(<AbaNoticias />);
    expect(await screen.findByText('Final da Copa')).toBeInTheDocument();
    const botao = screen.getByRole('button', { name: 'Rascunhos do Telegram (1)' });
    await userEvent.setup().click(botao);
    const lista = screen.getByRole('list', { name: 'Notícias' });
    expect(within(lista).getAllByRole('listitem').map((li) => li.textContent)).toEqual([expect.stringContaining('Golaço na Itália')]);
  });

  it('?editar=<id> abre o editor daquela notícia', async () => {
    busca = new URLSearchParams('aba=noticias&editar=b');
    render(<AbaNoticias />);
    expect(await screen.findByRole('heading', { name: 'Editar notícia' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Golaço na Itália');
  });

  it('"Nova notícia" abre o editor vazio', async () => {
    busca = new URLSearchParams('aba=noticias');
    render(<AbaNoticias />);
    await userEvent.setup().click(await screen.findByRole('button', { name: '+ Nova notícia' }));
    expect(screen.getByRole('heading', { name: 'Nova notícia' })).toBeInTheDocument();
  });
});
