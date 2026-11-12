import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BotoesJogo } from './BotoesJogo';
import type { ItemAgenda } from '@/lib/midia/agenda';

const JOGO: ItemAgenda = {
  id: '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab',
  origem: 'agenda',
  modalidade: 'Futsal',
  fase: null,
  casa: 'Real',
  fora: 'Sede',
  dataHora: '2099-11-20T22:00:00.000Z',
  local: null,
  transmissao: true,
};
const BASE = 'https://www.arenavale.com.br';

describe('BotoesJogo', () => {
  it('Lembrar abre as opções de agenda', () => {
    render(<BotoesJogo item={JOGO} baseUrl={BASE} youtubeHandle="@TVArenaVale" />);
    const lembrar = screen.getByRole('button', { name: /Lembrar/ });
    expect(lembrar).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Google Agenda' })).toBeNull();
    fireEvent.click(lembrar);
    expect(lembrar).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Google Agenda' }).getAttribute('href')).toMatch(/^https:\/\/calendar\.google\.com/);
    expect(screen.getByRole('link', { name: 'Agenda do celular' })).toHaveAttribute(
      'href',
      `/api/lembrete?origem=agenda&id=${JOGO.id}`,
    );
  });

  it('Esc fecha o menu do Lembrar', () => {
    render(<BotoesJogo item={JOGO} baseUrl={BASE} youtubeHandle="@TVArenaVale" />);
    fireEvent.click(screen.getByRole('button', { name: /Lembrar/ }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: 'Google Agenda' })).toBeNull();
    expect(screen.getByRole('button', { name: /Lembrar/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('sininho abre a inscrição do canal em outra aba', () => {
    render(<BotoesJogo item={JOGO} baseUrl={BASE} youtubeHandle="@TVArenaVale" />);
    const sino = screen.getByRole('link', { name: /Ativar o sininho/ });
    expect(sino).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale?sub_confirmation=1');
    expect(sino).toHaveAttribute('target', '_blank');
    expect(sino.getAttribute('rel')).toContain('noopener');
  });

  it('com álbum mostra Ver fotos; sem álbum não', () => {
    const { rerender } = render(<BotoesJogo item={JOGO} baseUrl={BASE} youtubeHandle="@TVArenaVale" />);
    expect(screen.queryByRole('link', { name: /Ver fotos/ })).toBeNull();
    rerender(<BotoesJogo item={JOGO} baseUrl={BASE} youtubeHandle="@TVArenaVale" albumId="alb-1" />);
    expect(screen.getByRole('link', { name: /Ver fotos/ })).toHaveAttribute('href', '/galeria/alb-1');
  });
});
