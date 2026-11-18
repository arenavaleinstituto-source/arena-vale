import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeConsultas } from '../fake-consultas';

let sb = fakeConsultas();
vi.mock('@/lib/supabase/client', () => ({ createClient: () => sb }));

import { PosicaoDosCortes } from './PosicaoDosCortes';

const CORTES = [
  { id: 'aaa', titulo: 'Grande defesa', publicadoEm: '2026-11-10T10:00:00Z', capa: 'https://i.ytimg.com/vi/aaa/hqdefault.jpg', link: '' },
  { id: 'bbb', titulo: 'Hino nacional', publicadoEm: '2026-11-09T10:00:00Z', capa: 'https://i.ytimg.com/vi/bbb/hqdefault.jpg', link: '' },
];

function preparar(giros: { video_id: string; giro: number }[] = []) {
  sb = fakeConsultas({ cortes_posicao: giros });
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ cortes: CORTES }))));
}
afterEach(() => vi.unstubAllGlobals());

describe('PosicaoDosCortes', () => {
  it('lista os cortes do canal com a posição de cada um', async () => {
    preparar([{ video_id: 'aaa', giro: -90 }]);
    render(<PosicaoDosCortes />);
    const defesa = await screen.findByRole('group', { name: 'Grande defesa' });
    expect(within(defesa).getByLabelText('Posição')).toHaveValue('-90');
    expect(within(screen.getByRole('group', { name: 'Hino nacional' })).getByLabelText('Posição')).toHaveValue('');
  });

  it('marcar como deitado grava o giro', async () => {
    preparar();
    render(<PosicaoDosCortes />);
    const hino = await screen.findByRole('group', { name: 'Hino nacional' });
    await userEvent.setup().selectOptions(within(hino).getByLabelText('Posição'), '-90');
    await waitFor(() => expect(sb.escritas).toContainEqual({ tabela: 'cortes_posicao', op: 'upsert', payload: { video_id: 'bbb', giro: -90, escondido: false }, filtros: [] }));
    expect(await within(hino).findByText('Salvo.')).toBeInTheDocument();
  });

  it('voltar para "Em pé" apaga a marcação', async () => {
    preparar([{ video_id: 'aaa', giro: -90 }]);
    render(<PosicaoDosCortes />);
    const defesa = await screen.findByRole('group', { name: 'Grande defesa' });
    await userEvent.setup().selectOptions(within(defesa).getByLabelText('Posição'), '');
    await waitFor(() => expect(sb.escritas).toContainEqual({ tabela: 'cortes_posicao', op: 'delete', payload: undefined, filtros: [['eq', 'video_id', 'aaa']] }));
  });

  it('"Esconder do site" grava o corte como escondido', async () => {
    preparar();
    render(<PosicaoDosCortes />);
    const hino = await screen.findByRole('group', { name: 'Hino nacional' });
    await userEvent.setup().selectOptions(within(hino).getByLabelText('Posição'), 'esconder');
    await waitFor(() => expect(sb.escritas).toContainEqual({ tabela: 'cortes_posicao', op: 'upsert', payload: { video_id: 'bbb', giro: null, escondido: true }, filtros: [] }));
  });

  it('corte já escondido aparece com "Esconder do site" escolhido', async () => {
    preparar([{ video_id: 'aaa', giro: null, escondido: true } as never]);
    render(<PosicaoDosCortes />);
    const defesa = await screen.findByRole('group', { name: 'Grande defesa' });
    expect(within(defesa).getByLabelText('Posição')).toHaveValue('esconder');
  });

  it('miniatura genérica do YouTube (120×90) troca pela capa comum', async () => {
    preparar();
    render(<PosicaoDosCortes />);
    const img = (await screen.findByRole('group', { name: 'Hino nacional' })).querySelector('img')!;
    Object.defineProperty(img, 'naturalWidth', { value: 120 });
    fireEvent.load(img);
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/bbb/hqdefault.jpg');
  });
});
