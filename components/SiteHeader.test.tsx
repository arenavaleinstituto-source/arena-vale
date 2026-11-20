import { act, render, screen } from '@testing-library/react';
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
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Início', 'Campeonatos', 'Notícias', 'Agenda', 'Modalidades', 'Projeto Social']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/campeonatos', '/noticias', '/agenda', '/modalidades', '/projetosocial']);
  });

  it('Ao Vivo fica ao lado da logo, fora do menu', () => {
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(menu.querySelector('a[href="/ao-vivo"]')).toBeNull();
    const vivo = screen.getByRole('link', { name: 'Ao Vivo' });
    expect(vivo).toHaveAttribute('href', '/ao-vivo');
    const logo = screen.getByRole('button', { name: 'Arena Vale: início' });
    expect(logo.compareDocumentPosition(vivo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(vivo.compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('Atletas Destaques sai da barra do topo e fica no ☰', async () => {
    const u = userEvent.setup();
    render(<SiteHeader />);
    expect(screen.getByRole('navigation', { name: 'Menu principal' }).querySelector('a[href="/atletasdestaques"]')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('navigation', { name: 'Menu do celular' }).querySelector('a[href="/atletasdestaques"]')).not.toBeNull();
  });

  it('sem Vídeos nem Sobre no menu; Anuncie leva ao /patrocinio', () => {
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(menu.textContent).not.toMatch(/Vídeos|Sobre/);
    expect(screen.getByRole('link', { name: 'Anuncie' })).toHaveAttribute('href', '/patrocinio');
  });

  it('sem botão Contato no cabeçalho (o contato fica no fim da página inicial)', async () => {
    const u = userEvent.setup();
    render(<SiteHeader />);
    expect(screen.queryByRole('link', { name: 'Contato' })).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.queryByRole('link', { name: 'Contato' })).toBeNull();
  });

  it('logo do cabeçalho é a versão sem fundo, com o efeito 3D', () => {
    render(<SiteHeader />);
    const img = screen.getByRole('button', { name: 'Arena Vale: início' }).querySelector('img');
    expect(img).toHaveAttribute('src', '/logo-3d.png');
    expect(img).toHaveAttribute('alt', 'ARENA VALE');
    expect(img?.closest('.logo-3d')).not.toBeNull();
  });

  it('ao rolar a página, o cabeçalho ganha o fundo de vidro mais forte', () => {
    render(<SiteHeader />);
    const header = screen.getByRole('banner');
    expect(header.className).not.toMatch(/\brolou\b/);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(header.className).toMatch(/\brolou\b/);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(header.className).not.toMatch(/\brolou\b/);
  });

  it('a marca nunca aparece com "Sports"', () => {
    render(<SiteHeader />);
    expect(document.body.textContent ?? '').not.toMatch(/sports?\b/i);
  });

  it('tem o logo com toque triplo', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('button', { name: 'Arena Vale: início' })).toBeInTheDocument();
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
    expect(textos).toEqual(['Início', 'Campeonatos', 'Notícias', 'Agenda', 'Modalidades', 'Projeto Social', 'Atletas Destaques', 'Galeria', 'Anuncie']);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Galeria fica fora da barra do topo e aparece só no menu ☰', async () => {
    const u = userEvent.setup();
    render(<SiteHeader />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(menu.querySelector('a[href="/galeria"]')).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const cel = screen.getByRole('navigation', { name: 'Menu do celular' });
    const galeria = cel.querySelector('a[href="/galeria"]');
    expect(galeria).not.toBeNull();
    expect(galeria?.className ?? '').not.toMatch(/tambem-no-topo/);
    expect(cel.querySelector('a[href="/agenda"]')?.className).toMatch(/tambem-no-topo/);
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
