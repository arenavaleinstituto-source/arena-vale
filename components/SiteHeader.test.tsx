import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/noticias';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => pathname,
}));
vi.mock('@/lib/supabase/client', async () => {
  const { fakeSupabase } = await import('./auth/fake-supabase');
  return { createClient: () => fakeSupabase() };
});

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  beforeEach(() => { pathname = '/noticias'; });

  it('aparece nas páginas públicas, preso no topo', () => {
    render(<SiteHeader />);
    const header = screen.getByRole('banner');
    expect(header.className).toMatch(/\bsticky\b/);
    expect(header.className).toMatch(/\btop-0\b/);
  });

  it('o menu leva aos blocos da página inicial a partir de qualquer página', () => {
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    const link = (nome: string) =>
      Array.from(menu.querySelectorAll('a')).find((a) => a.textContent?.trim() === nome);
    expect(link('Início')).toHaveAttribute('href', '/#inicio');
    expect(link('Notícias')).toHaveAttribute('href', '/#noticias');
    expect(link('Campeonatos')).toHaveAttribute('href', '/#campeonatos');
    expect(link('Agenda')).toHaveAttribute('href', '/agenda');
  });

  it('tem o logo com toque triplo', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('button', { name: 'Arena Vale — início' })).toBeInTheDocument();
  });

  it('tem o botão "Entrar" da equipe no lugar do "Painel"', async () => {
    render(<SiteHeader />);
    expect((await screen.findAllByRole('button', { name: 'Entrar na área da equipe' })).length).toBeGreaterThan(0);
    expect(screen.queryByText('Painel')).toBeNull();
  });

  it.each(['/painel', '/painel/noticias', '/coordenador', '/proprietario', '/moderador', '/capitao'])(
    'não aparece na área da equipe (%s)',
    (rota) => {
      pathname = rota;
      const { container } = render(<SiteHeader />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});
