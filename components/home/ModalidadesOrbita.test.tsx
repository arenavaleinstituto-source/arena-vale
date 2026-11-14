import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalidadesOrbita } from './ModalidadesOrbita';

const LISTA = [
  { slug: 'futebol', nome: 'Futebol', frase: 'O palco do futebol é aqui.' },
  { slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.' },
];

describe('ModalidadesOrbita', () => {
  it('renders modalidades orbit with buttons', () => {
    render(<ModalidadesOrbita lista={LISTA} />);
    expect(screen.getByRole('button', { name: /futebol/i })).toBeInTheDocument();
  });

  it('clicking second modalidade updates the panel', async () => {
    render(<ModalidadesOrbita lista={LISTA} />);
    await userEvent.click(screen.getByRole('button', { name: /futsal/i }));
    expect(screen.getByText('O palco do futsal é aqui.')).toBeVisible();
  });
});
