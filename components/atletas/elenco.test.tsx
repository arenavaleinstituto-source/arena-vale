import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ElencoEquipe } from './ElencoEquipe';
import { TabelaClassificacao } from '@/components/midia/TabelaClassificacao';

describe('ElencoEquipe', () => {
  it('mostra foto ou inicial, nome, camisa, posição e só o CPF mascarado', () => {
    render(
      <ElencoEquipe
        atletas={[
          { id: 'a', nome: 'Gabriel Mendes', numero_camisa: 10, posicao: 'Ala', foto_url: 'https://x/f.jpg', cpf_mascarado: '529...' },
          { id: 'b', nome: 'Davi Souza', numero_camisa: null, posicao: null, foto_url: null, cpf_mascarado: null },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Gabriel Mendes' })).toHaveAttribute('src', 'https://x/f.jpg');
    expect(screen.getByText('CPF 529...')).toBeInTheDocument();
    expect(screen.getByText('#10 · Ala')).toBeInTheDocument();
    expect(screen.getByText('Davi Souza')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
  });

  it('sem atletas: aviso', () => {
    render(<ElencoEquipe atletas={[]} />);
    expect(screen.getByText('Elenco ainda não cadastrado pelo capitão.')).toBeInTheDocument();
  });
});

describe('TabelaClassificacao', () => {
  it('o nome da equipe leva ao elenco dela', () => {
    render(
      <TabelaClassificacao
        linhas={[{ time_id: 't1', time_nome: 'Leões', time_sigla: 'LEO', jogos: 1, vitorias: 1, empates: 0, derrotas: 0, gols_pro: 2, gols_contra: 0, saldo: 2, pontos: 3 }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Leões' })).toHaveAttribute('href', '/equipes/t1');
  });
});
