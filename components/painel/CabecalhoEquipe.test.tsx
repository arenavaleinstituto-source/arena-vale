import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CabecalhoEquipe } from './CabecalhoEquipe';

describe('CabecalhoEquipe', () => {
  it('logo ARENA VALE, título em caixa alta e "Ver o site" para este site', () => {
    render(<CabecalhoEquipe titulo="Resultados" subtitulo="Moderação de campeonatos" />);
    expect(screen.getByRole('img', { name: 'ARENA VALE' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Resultados' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver o site' })).toHaveAttribute('href', '/');
    expect(document.body.textContent ?? '').not.toMatch(/propriet/i);
  });
});
