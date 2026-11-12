import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/noticias';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
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

  it('menu principal da mídia esportiva, nesta ordem', () => {
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    const links = Array.from(menu.querySelectorAll('a'));
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Início',
      'Ao Vivo',
      'Notícias do Vale',
      'Esporte Mundial',
      'Agenda',
      'Modalidades',
      'Projeto Social',
      'Atletas Destaques',
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/',
      '/ao-vivo',
      '/noticias',
      '/noticias?aba=mundo',
      '/agenda',
      '/modalidades',
      '/projetosocial',
      '/atletasdestaques',
    ]);
  });

  it('sem Vídeos nem Sobre no menu; Anuncie leva ao /patrocinio', () => {
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(menu.textContent).not.toMatch(/Vídeos|Sobre/);
    expect(screen.getByRole('link', { name: 'Anuncie' })).toHaveAttribute('href', '/patrocinio');
  });

  it('a marca nunca aparece com "Sports"', () => {
    render(<SiteHeader />);
    expect(document.body.textContent ?? '').not.toMatch(/sports?\b/i);
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

  it('celular: botão ☰ abre o menu com todas as páginas e o Anuncie', async () => {
    const u = userEvent.setup();
    render(<SiteHeader />);
    const botao = screen.getByRole('button', { name: 'Abrir menu' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Menu do celular' })).toBeNull();
    await u.click(botao);
    const cel = screen.getByRole('navigation', { name: 'Menu do celular' });
    const textos = Array.from(cel.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(textos).toEqual(['Início', 'Ao Vivo', 'Notícias do Vale', 'Esporte Mundial', 'Agenda', 'Modalidades', 'Projeto Social', 'Atletas Destaques', 'Anuncie']);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('celular: tocar numa página, no X ou apertar Esc fecha o menu', async () => {
    const u = userEvent.setup();
    render(<SiteHeader />);
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await u.click(screen.getByRole('navigation', { name: 'Menu do celular' }).querySelector('a[href="/agenda"]')!);
    expect(screen.queryByRole('navigation', { name: 'Menu do celular' })).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: 'Menu do celular' })).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await u.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(screen.queryByRole('navigation', { name: 'Menu do celular' })).toBeNull();
    expect(document.body.style.overflow).toBe('');
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
