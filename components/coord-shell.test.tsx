import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
let busca = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/coordenador',
  useSearchParams: () => busca,
}));
vi.mock('@/lib/supabase/client', async () => {
  const { fakeSupabase } = await import('./auth/fake-supabase');
  return { createClient: () => fakeSupabase() };
});

import { CoordShell } from './coord-shell';
import type { Profile } from '@/lib/supabase/types';

const user = { id: 'u1', full_name: 'Paulo Miranda', email: 'p@x.test', role: 'coordenador' } as Profile;
const stats = { campeonatos: 4, equipes: 8, jogos: 5, videos: 15, inscricoes_pendentes: 0 };

function montar() {
  return render(<CoordShell user={user} stats={stats} inscricoes={[]} patrocinadores={[]} aoVivoDetectado={false} />);
}

describe('CoordShell', () => {
  beforeEach(() => {
    replace.mockReset();
    busca = new URLSearchParams();
  });

  it('"Ver o site" leva a este site (/), nunca ao endereço oficial antigo', () => {
    montar();
    const link = screen.getByRole('link', { name: 'Ver o site' });
    expect(link).toHaveAttribute('href', '/');
    expect(document.body.innerHTML).not.toContain('arena-vale.vercel.app');
  });

  it('cabeçalho PAINEL DA COORDENAÇÃO, sem "Proprietário"', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Painel da coordenação/i);
    expect(document.body.textContent ?? '').not.toMatch(/propriet/i);
  });

  it('as 13 abas aparecem e trocar de aba grava na URL', async () => {
    montar();
    const abas = screen.getAllByRole('tab');
    expect(abas).toHaveLength(13);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Notícias' }));
    expect(replace).toHaveBeenCalledWith('/coordenador?aba=noticias', { scroll: false });
  });

  it('abre a aba que está na URL', () => {
    busca = new URLSearchParams('aba=aovivo');
    montar();
    expect(screen.getByRole('tab', { name: 'Ao Vivo' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Visão geral mostra os números da arena só para a equipe', () => {
    montar();
    expect(screen.getByText('Para conhecimento da equipe — não aparece no site.')).toBeInTheDocument();
    expect(screen.getByText('Vídeos no canal')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
