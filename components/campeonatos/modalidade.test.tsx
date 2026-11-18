import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ResumoCampeonato } from '@/lib/campeonatos/busca';

const resumo: ResumoCampeonato = {
  id: 'c1', slug: 'copa-futsal-2026', nome: 'Copa Futsal', ano: 2026, categoria: null, modalidade: 'futsal',
  logo_url: null, status: 'em_andamento', fase_atual: 'Rodada 2', encerrado: false,
};

vi.mock('@/lib/midia/modalidades-busca', () => ({ buscarModalidades: async () => [{ slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.' }] }));
vi.mock('@/lib/midia/agenda', () => ({ buscarAgenda: async () => [] }));
vi.mock('@/lib/midia/noticias-busca', () => ({ buscarNoticiasPublicadas: async () => [] }));
vi.mock('@/lib/midia/campeonatos', () => ({ buscarCampeonatosDaModalidade: async () => [resumo], filtrarPorModalidade: () => [] }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));

import Pagina from '@/app/modalidades/[slug]/page';

describe('/modalidades/[slug]', () => {
  it('os campeonatos aparecem como cartões que levam à página do campeonato', async () => {
    render(await Pagina({ params: Promise.resolve({ slug: 'futsal' }) }));
    expect(screen.getByRole('link', { name: /Copa Futsal/ })).toHaveAttribute('href', '/campeonatos/copa-futsal-2026');
    expect(screen.queryByRole('table')).toBeNull();
  });
});
