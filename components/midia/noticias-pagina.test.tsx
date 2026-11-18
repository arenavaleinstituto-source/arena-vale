import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mapearNoticiaMidia } from '@/lib/midia/noticias';

const vale = mapearNoticiaMidia({ id: 'v1', titulo: 'Final no Vale', status: 'publicado', aba: 'arena', imagem_url: 'https://x/v.jpg', created_at: '2026-11-10T00:00:00Z' });
const mundo = mapearNoticiaMidia({ id: 'm1', titulo: 'Golaço na Itália', status: 'publicado', aba: 'mundo', imagem_url: 'https://x/m.jpg', created_at: '2026-11-10T00:00:00Z' });
vi.mock('@/lib/midia/noticias-busca', () => ({
  buscarNoticiasPublicadas: async ({ aba }: { aba: string }) => (aba === 'mundo' ? [mundo] : [vale]),
}));

import Pagina from '@/app/noticias/page';

describe('/noticias', () => {
  it('Notícias do Vale e Esporte Mundial na mesma página', async () => {
    render(await Pagina());
    expect(screen.getByRole('heading', { name: 'Notícias do Vale' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Esporte Mundial' })).toBeInTheDocument();
    expect(screen.getAllByText('Final no Vale').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Golaço na Itália').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Esporte Mundial' })).toHaveAttribute('href', '#mundo');
  });
});
