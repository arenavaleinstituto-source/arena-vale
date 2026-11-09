import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Patrocinadores } from './Patrocinadores';
import { ordenarPorCota, type PatrocinadorSite } from '@/lib/midia/patrocinadores';

const P = (o: Partial<PatrocinadorSite>): PatrocinadorSite => ({
  id: Math.random().toString(36).slice(2),
  nome: 'Parceiro',
  cota: 'Bronze',
  logo_url: null,
  logo_initials: 'PA',
  logo_cor: '#e50914',
  site_url: null,
  ...o,
});

describe('ordenarPorCota', () => {
  it('Master, Ouro, Prata, Bronze, Apoio — sem diferenciar maiúsculas', () => {
    const r = ordenarPorCota([P({ nome: 'B', cota: 'BRONZE' }), P({ nome: 'A', cota: 'apoio' }), P({ nome: 'M', cota: 'Master' }), P({ nome: 'O', cota: 'Ouro' })]);
    expect(r.map((p) => p.nome)).toEqual(['M', 'O', 'B', 'A']);
  });
});

describe('Patrocinadores', () => {
  it('faixa com título, um cartão por patrocinador e logo ou iniciais', () => {
    render(
      <Patrocinadores
        patrocinadores={[
          P({ nome: 'Liga Blumenauense', cota: 'Bronze', logo_initials: 'LIGA' }),
          P({ nome: 'Acadesf', cota: 'Master', logo_url: 'https://x.supabase.co/logo.png', site_url: 'https://acadesf.com.br' }),
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Patrocinadores' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Acadesf' })).toHaveAttribute('src', 'https://x.supabase.co/logo.png');
    expect(screen.getByText('LIGA')).toBeInTheDocument();
    const nomes = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(nomes).toEqual(['Acadesf', 'Liga Blumenauense']);
  });

  it('com site: abre em nova aba; sem site: leva ao Anuncie', () => {
    render(<Patrocinadores patrocinadores={[P({ nome: 'Com site', site_url: 'https://site.com' }), P({ nome: 'Sem site' })]} />);
    const comSite = screen.getByRole('link', { name: /Com site/ });
    expect(comSite).toHaveAttribute('href', 'https://site.com');
    expect(comSite).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /Sem site/ })).toHaveAttribute('href', '/patrocinio');
  });

  it('sem patrocinadores: convite para ser o primeiro', () => {
    render(<Patrocinadores patrocinadores={[]} />);
    expect(screen.getByRole('link', { name: 'Seja um patrocinador →' })).toHaveAttribute('href', '/patrocinio');
  });
});
