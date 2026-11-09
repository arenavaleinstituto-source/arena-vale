import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { SiteFooter } from './SiteFooter';

const props = { whatsapp: '5547988444404', instagramUrl: 'https://www.instagram.com/arenavaleoficial' };

describe('SiteFooter', () => {
  beforeEach(() => {
    pathname = '/';
  });

  it('CNPJ, redes e links legais, sem linha de menu', () => {
    render(<SiteFooter {...props} />);
    expect(screen.getByText('CNPJ: 40.694.741/0001-34')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5547988444404/);
    expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/arenavaleoficial');
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale');
    expect(screen.getByRole('link', { name: 'Sobre a ARENA VALE' })).toHaveAttribute('href', '/sobre');
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos');
    expect(screen.getByText('© 2026 ARENA VALE · Mídia Esportiva. Todos os direitos reservados.')).toBeInTheDocument();
    expect(screen.getByText('O palco do esporte é aqui.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('usa o WhatsApp do site_config', () => {
    render(<SiteFooter whatsapp="5547900001111" instagramUrl={props.instagramUrl} />);
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5547900001111/);
  });

  it('marca sem "Sports"', () => {
    render(<SiteFooter {...props} />);
    expect(document.body.textContent ?? '').not.toMatch(/sports?\b/i);
  });

  it.each(['/coordenador', '/painel/noticias', '/moderador', '/capitao', '/proprietario'])('não aparece na área da equipe (%s)', (rota) => {
    pathname = rota;
    const { container } = render(<SiteFooter {...props} />);
    expect(container).toBeEmptyDOMElement();
  });
});
