import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalidadesCorre } from './ModalidadesCorre';

it('renders all 5 modalidades', () => {
  render(<ModalidadesCorre />);
  expect(screen.getAllByText('Futebol').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Vôlei').length).toBeGreaterThan(0);
});
