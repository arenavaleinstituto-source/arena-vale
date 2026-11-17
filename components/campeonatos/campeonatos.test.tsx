import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ResumoCampeonato } from '@/lib/campeonatos/busca';

const resumo = (p: Partial<ResumoCampeonato>): ResumoCampeonato => ({
  id: 'c1', slug: 'copa-x-2026', nome: 'Copa X', ano: 2026, categoria: null, modalidade: 'futsal',
  logo_url: null, status: 'em_andamento', fase_atual: 'Quartas de final', encerrado: false, ...p,
});

let lista: ResumoCampeonato[] = [];
vi.mock('@/lib/campeonatos/busca', () => ({ buscarCampeonatosPublicos: async () => lista }));
vi.mock('@/lib/midia/config', async () => {
  const p = await import('@/lib/midia/config-padrao');
  return { ...p, lerConfigSite: async () => p.CONFIG_PADRAO };
});
vi.mock('@/lib/midia/modalidades-busca', () => ({
  buscarModalidades: async () => [
    { slug: 'futsal', nome: 'Futsal', frase: '' },
    { slug: 'volei', nome: 'Vôlei', frase: '' },
  ],
}));

import { EscudoTime } from './EscudoTime';
import { EscudoCampeonato } from './EscudoCampeonato';
import { CartaoCampeonato } from './CartaoCampeonato';
import Pagina from '@/app/campeonatos/page';

describe('EscudoTime', () => {
  it('sem escudo enviado, mostra o escudo padrão desenhado com a sigla', () => {
    render(<EscudoTime time={{ nome: 'Leões', sigla: 'LEO', escudo_url: null, escudo_cor: null }} tamanho={40} />);
    expect(screen.getByRole('img', { name: 'Leões' }).getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });
  it('com escudo enviado, usa a imagem', () => {
    render(<EscudoTime time={{ nome: 'Leões', sigla: 'LEO', escudo_url: 'https://x/e.png', escudo_cor: null }} tamanho={24} />);
    expect(screen.getByRole('img', { name: 'Leões' })).toHaveAttribute('src', 'https://x/e.png');
  });
});

describe('EscudoCampeonato', () => {
  it('sem foto, usa as iniciais do nome', () => {
    render(<EscudoCampeonato campeonato={{ nome: 'Copa do Vale Futsal', logo_url: null }} tamanho={96} />);
    const src = decodeURIComponent(screen.getByRole('img', { name: 'Copa do Vale Futsal' }).getAttribute('src') ?? '');
    expect(src).toContain('CVF');
  });
});

describe('CartaoCampeonato', () => {
  it('leva à página do campeonato e mostra modalidade, ano e fase', () => {
    render(<CartaoCampeonato c={resumo({})} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/campeonatos/copa-x-2026');
    expect(link.textContent).toContain('Copa X');
    expect(link.textContent).toContain('2026');
    expect(link.textContent).toContain('Quartas de final');
  });
});

describe('/campeonatos', () => {
  it('por padrão mostra só os em andamento', async () => {
    lista = [resumo({ id: 'a', nome: 'Copa Viva' }), resumo({ id: 'b', slug: 'liga-velha-2025', nome: 'Liga Velha', encerrado: true, status: 'finalizado' })];
    render(await Pagina({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Copa Viva')).toBeInTheDocument();
    expect(screen.queryByText('Liga Velha')).toBeNull();
  });
  it('a aba Encerrados mostra os encerrados', async () => {
    lista = [resumo({ id: 'a', nome: 'Copa Viva' }), resumo({ id: 'b', nome: 'Liga Velha', encerrado: true })];
    render(await Pagina({ searchParams: Promise.resolve({ situacao: 'encerrados' }) }));
    expect(screen.getByText('Liga Velha')).toBeInTheDocument();
    expect(screen.queryByText('Copa Viva')).toBeNull();
  });
  it('tem a entrada para os Atletas Destaques', async () => {
    lista = [];
    render(await Pagina({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('link', { name: /Atletas Destaques/ })).toHaveAttribute('href', '/atletasdestaques');
  });
  it('filtra por modalidade', async () => {
    lista = [resumo({ id: 'a', nome: 'Copa Futsal' }), resumo({ id: 'b', nome: 'Copa Vôlei', modalidade: 'volei' })];
    render(await Pagina({ searchParams: Promise.resolve({ modalidade: 'volei' }) }));
    expect(screen.getByText('Copa Vôlei')).toBeInTheDocument();
    expect(screen.queryByText('Copa Futsal')).toBeNull();
  });
});
