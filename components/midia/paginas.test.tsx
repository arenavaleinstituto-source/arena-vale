import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltroVideos } from './FiltroVideos';
import type { ItemVideo } from '@/components/home/UltimosVideos';

vi.mock('@/lib/midia/config', async () => {
  const p = await import('@/lib/midia/config-padrao');
  return { ...p, lerConfigSite: async () => p.CONFIG_PADRAO };
});
vi.mock('@/lib/midia/noticias-busca', () => ({ buscarNoticiasPublicadas: async () => [] }));

const v = (plataforma: ItemVideo['plataforma'], titulo: string): ItemVideo => ({
  id: titulo,
  titulo,
  capa: '/c.jpg',
  link: `https://x.test/${titulo}`,
  plataforma,
  data: '2026-11-01T00:00:00Z',
});

describe('FiltroVideos', () => {
  it('filtra por plataforma', async () => {
    render(<FiltroVideos videos={[v('youtube', 'Y1'), v('youtube', 'Y2'), v('instagram', 'I1')]} />);
    const u = userEvent.setup();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    await u.click(screen.getByRole('button', { name: 'Instagram' }));
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual([expect.stringContaining('I1')]);
    expect(screen.getByRole('button', { name: 'Instagram' })).toHaveAttribute('aria-pressed', 'true');
    await u.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('sem vídeos na plataforma: aviso', async () => {
    render(<FiltroVideos videos={[v('youtube', 'Y1')]} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Instagram' }));
    expect(screen.getByText('Nenhum vídeo por aqui ainda.')).toBeInTheDocument();
  });
});

describe('página Projeto Social', () => {
  it('mantém todo o conteúdo da página antiga', async () => {
    const { default: Pagina } = await import('@/app/projetosocial/page');
    render(await Pagina());
    const texto = document.body.textContent ?? '';
    for (const trecho of [
      'Projeto Social ARENA VALE',
      'O esporte como ferramenta de transformação social',
      '+1.200',
      '20 anos',
      '15+',
      '100%',
      'Iniciativas e apoio direto',
      'Inclusão através do esporte',
      'Educação e cidadania',
      'Infraestrutura comunitária',
      'Quer apoiar o nosso projeto social?',
    ]) {
      expect(texto).toContain(trecho);
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projeto Social ARENA VALE');
    expect(screen.getByRole('link', { name: 'Inscrever criança / atleta' })).toHaveAttribute('href', '/inscricao');
    expect(screen.getByRole('link', { name: 'Apoiar o projeto social' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5547988444404\?text=/);
  });
});

describe('página Sobre', () => {
  it('manifesto, essência, pilares e contatos', async () => {
    const { default: Pagina } = await import('@/app/sobre/page');
    render(await Pagina());
    const texto = document.body.textContent ?? '';
    for (const trecho of ['Dar palco ao esporte', 'O palco do esporte é aqui.', 'Ao vivo', 'Informação', 'Análise', 'Histórias', 'Comunidade']) {
      expect(texto).toContain(trecho);
    }
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale');
    expect(texto).not.toMatch(/sports?\b/i);
  });
});
