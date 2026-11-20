import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  beforeEach(() => {
    pathname = '/';
  });

  it('CNPJ e links legais, sem botões de redes nem linha de menu', () => {
    render(<SiteFooter />);
    expect(screen.getByText('CNPJ: 40.694.741/0001-34')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /WhatsApp|Instagram|YouTube/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Sobre a ARENA VALE' })).toHaveAttribute('href', '/sobre');
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos');
    expect(screen.getByText('© 2026 ARENA VALE · Mídia Esportiva. Todos os direitos reservados.')).toBeInTheDocument();
    expect(screen.getByText('O palco do esporte é aqui.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('marca sem "Sports"', () => {
    render(<SiteFooter />);
    expect(document.body.textContent ?? '').not.toMatch(/sports?\b/i);
  });

  it.each(['/coordenador', '/painel/noticias', '/moderador', '/capitao', '/proprietario'])('não aparece na área da equipe (%s)', (rota) => {
    pathname = rota;
    const { container } = render(<SiteFooter />);
    expect(container).toBeEmptyDOMElement();
  });
});
