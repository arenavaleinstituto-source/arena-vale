import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoberturaCards } from './CoberturaCards';

it('renders 6 feature cards', () => {
  render(<CoberturaCards />);
  expect(screen.getByText('Transmissões ao vivo')).toBeInTheDocument();
  expect(screen.getByText('Esporte mundial')).toBeInTheDocument();
  const cards = document.querySelectorAll('.cobertura-cartao');
  expect(cards).toHaveLength(6);
});
