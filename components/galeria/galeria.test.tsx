import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GradeAlbuns } from './GradeAlbuns';
import { Visualizador } from './Visualizador';
import { FotosDosJogos } from '@/components/home/FotosDosJogos';
import type { AlbumGaleria, FotoGaleria } from '@/lib/midia/galeria';

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({ notFound: () => notFound() }));
const buscarAlbum = vi.fn();
vi.mock('@/lib/midia/galeria-busca', () => ({
  buscarAlbum: (...a: unknown[]) => buscarAlbum(...a),
  buscarAlbuns: async () => [],
}));

const album = (id: string, total: number): AlbumGaleria => ({
  id,
  titulo: `Álbum ${id}`,
  data: '2026-11-15',
  origem: null,
  jogoRef: null,
  capaUrl: 'https://cdn.test/capa.jpg',
  ativo: true,
  totalFotos: total,
  competicao: null,
  local: null,
  placar: null,
  descricao: null,
  fotografo: null,
  publicadoEm: '2026-11-15T20:00:00Z',
});
const fotos: FotoGaleria[] = [1, 2, 3, 4, 5].map((i) => ({
  id: `f${i}`,
  albumId: 'a',
  url: `https://cdn.test/${i}.jpg`,
  miniaturaUrl: `https://cdn.test/${i}-m.jpg`,
  largura: 2000,
  altura: 1500,
}));

describe('GradeAlbuns', () => {
  it('mostra título, data e número de fotos', () => {
    render(<GradeAlbuns albuns={[album('a', 12), album('b', 1)]} />);
    expect(screen.getByText('Álbum a')).toBeInTheDocument();
    expect(screen.getAllByText('15/11/2026')).toHaveLength(2);
    expect(screen.getByText('12 fotos')).toBeInTheDocument();
    expect(screen.getByText('1 foto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Álbum a/ })).toHaveAttribute('href', '/galeria/a');
  });

  it('mostra a competição e o placar no cartão', () => {
    render(<GradeAlbuns albuns={[{ ...album('c', 3), competicao: 'Copa Vale · Final', placar: 'Real 3 x 1 Sede' }]} />);
    expect(screen.getByText('Copa Vale · Final')).toBeInTheDocument();
    expect(screen.getByText('Real 3 x 1 Sede')).toBeInTheDocument();
  });
});

describe('Visualizador', () => {
  it('abre na foto inicial, navega pelas setas sem passar das pontas e baixa', () => {
    const aoFechar = vi.fn();
    render(<Visualizador fotos={fotos} inicial={2} aoFechar={aoFechar} />);
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Baixar' })).toHaveAttribute('href', '/api/galeria/baixar?id=f3');
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    for (let i = 0; i < 6; i += 1) fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(aoFechar).toHaveBeenCalled();
  });

  it('deslizar o dedo para a esquerda avança', () => {
    render(<Visualizador fotos={fotos} inicial={0} aoFechar={() => {}} />);
    const palco = screen.getByRole('dialog');
    fireEvent.pointerDown(palco, { clientX: 300 });
    fireEvent.pointerUp(palco, { clientX: 200 });
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });
});

describe('FotosDosJogos', () => {
  it('sem álbum não aparece', () => {
    const { container } = render(<FotosDosJogos albuns={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('página do álbum', () => {
  it('álbum inexistente ou escondido chama notFound', async () => {
    buscarAlbum.mockResolvedValue(null);
    const { default: Pagina } = await import('@/app/galeria/[id]/page');
    await expect(Pagina({ params: Promise.resolve({ id: 'x' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('mostra competição, placar, local, descrição e quem fotografou', async () => {
    buscarAlbum.mockResolvedValue({
      album: {
        ...album('d', 2),
        competicao: 'Copa Vale Sub-11 · Final',
        placar: 'Real 3 x 1 Sede',
        local: 'Ginásio Galegão – Blumenau',
        descricao: 'Jogo decidido no segundo tempo.',
        fotografo: 'Fulano de Tal',
      },
      fotos: fotos.slice(0, 2),
    });
    const { default: Pagina } = await import('@/app/galeria/[id]/page');
    render(await Pagina({ params: Promise.resolve({ id: 'd' }) }));
    expect(screen.getByText('Copa Vale Sub-11 · Final')).toBeInTheDocument();
    expect(screen.getByText('Real 3 x 1 Sede')).toBeInTheDocument();
    expect(screen.getByText(/Ginásio Galegão – Blumenau/)).toBeInTheDocument();
    expect(screen.getByText('Jogo decidido no segundo tempo.')).toBeInTheDocument();
    expect(screen.getByText('Fotos: Fulano de Tal')).toBeInTheDocument();
  });
});
