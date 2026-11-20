import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { regulamentoPadrao } from '@/lib/campeonatos/regulamento';
import type { PaginaCampeonato } from '@/lib/campeonatos/busca';
import type { FormaDisputa, JogoCalc, OpcoesMataMata } from '@/lib/campeonatos/tipos';

const MATA: OpcoesMataMata = { ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio', desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3 };

function jogo(p: Partial<JogoCalc & { data: string | null; local: string | null }>): JogoCalc & { data: string | null; local: string | null } {
  return {
    id: 'j', ordem: 1, fase: 'Final', grupo: null, rodada: null, casa: null, visitante: null, status: 'agendado',
    placar_casa: null, placar_visitante: null, penaltis_casa: null, penaltis_visitante: null, wo: null, parciais: null,
    vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null, data: null, local: null, ...p,
  };
}

const times = {
  a: { nome: 'Leões', sigla: 'LEO', escudo_url: null, escudo_cor: null },
  b: { nome: 'Tigres', sigla: 'TIG', escudo_url: null, escudo_cor: null },
  c: { nome: 'Águias', sigla: 'AGU', escudo_url: null, escudo_cor: null },
  d: { nome: 'Lobos', sigla: 'LOB', escudo_url: null, escudo_cor: null },
};

function pagina(forma: FormaDisputa, jogos: ReturnType<typeof jogo>[], extra: Partial<PaginaCampeonato['campeonato']> = {}, grupos: Record<string, string[]> = {}): PaginaCampeonato {
  return {
    campeonato: {
      id: 'c1', slug: 'copa-x-2026', nome: 'Copa X', ano: 2026, categoria: null, modalidade: 'futsal', logo_url: null,
      status: 'em_andamento', fase_atual: null, encerrado: false, visivel: true, regulamento: regulamentoPadrao('gols', forma), ...extra,
    },
    times, jogos, grupos, sorteios: {},
  };
}

let publica: PaginaCampeonato | null = null;
let sessao: PaginaCampeonato | null = null;
const buscar = vi.fn(async (_slug: string, sb?: unknown) => (sb ? sessao : publica));
vi.mock('@/lib/campeonatos/busca', () => ({ buscarCampeonatoPorSlug: (s: string, sb?: unknown) => buscar(s, sb) }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ sessao: true }) }));
vi.mock('@/lib/midia/modalidades-busca', () => ({ buscarModalidades: async () => [{ slug: 'futsal', nome: 'Futsal', frase: '' }] }));
const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({ notFound: () => notFound() }));

import Pagina from '@/app/campeonatos/[slug]/page';

const abrir = (aba?: string) => Pagina({ params: Promise.resolve({ slug: 'copa-x-2026' }), searchParams: Promise.resolve(aba ? { aba } : {}) });

describe('página do campeonato', () => {
  beforeEach(() => {
    publica = null;
    sessao = null;
    buscar.mockClear();
    notFound.mockClear();
  });

  it('mata-mata direto não tem a aba Classificação', async () => {
    publica = pagina({ tipo: 'mata_mata', mata: MATA }, [jogo({ id: 'f', casa: 'a', visitante: 'b' })]);
    render(await abrir());
    const abas = screen.getByRole('navigation', { name: 'Seções do campeonato' });
    expect(within(abas).queryByText('Classificação')).toBeNull();
    expect(within(abas).getByText('Chave')).toBeInTheDocument();
  });

  it('campeonato no formato antigo só tem Jogos e Regulamento', async () => {
    publica = pagina({ tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null }, [], {
      regulamento: { ...regulamentoPadrao('gols'), formato_antigo: true },
    });
    render(await abrir());
    const abas = screen.getByRole('navigation', { name: 'Seções do campeonato' });
    expect(within(abas).getAllByRole('link').map((l) => l.textContent)).toEqual(['Jogos', 'Regulamento']);
  });

  it('a chave mostra a vaga ainda aberta', async () => {
    const forma: FormaDisputa = { tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 1, melhores_extras: 0, montagem: 'sorteio', ida_volta_grupos: false, mata: MATA };
    publica = pagina(
      forma,
      [
        jogo({ id: 'g1', ordem: 1, fase: 'Fase de grupos', grupo: 'A', rodada: 1, casa: 'a', visitante: 'b' }),
        jogo({ id: 'g2', ordem: 2, fase: 'Fase de grupos', grupo: 'B', rodada: 1, casa: 'c', visitante: 'd' }),
        jogo({ id: 'f', ordem: 3, fase: 'Final', vaga_casa: { tipo: 'grupo', grupo: 'A', posicao: 1 }, vaga_visitante: { tipo: 'grupo', grupo: 'B', posicao: 1 } }),
      ],
      {},
      { A: ['a', 'b'], B: ['c', 'd'] },
    );
    render(await abrir('chave'));
    expect(screen.getByText('1º do Grupo A')).toBeInTheDocument();
    expect(screen.getByText('1º do Grupo B')).toBeInTheDocument();
  });

  it('campeonato que ninguém pode ver dá "não encontrada"', async () => {
    await expect(abrir()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(notFound).toHaveBeenCalled();
  });

  it('escondido, visto pela equipe do campeonato: mostra a faixa de pré-visualização', async () => {
    sessao = pagina({ tipo: 'mata_mata', mata: MATA }, [], { visivel: false });
    render(await abrir());
    expect(screen.getByText('Pré-visualização: ainda não está no site')).toBeInTheDocument();
  });

  it('tabela dos pontos corridos e jogo a definir', async () => {
    publica = pagina({ tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null }, [
      jogo({ id: 'p1', ordem: 1, fase: 'Pontos corridos', rodada: 1, casa: 'a', visitante: 'b', status: 'finalizado', placar_casa: 2, placar_visitante: 1, data: '2026-11-20T19:30:00' }),
      jogo({ id: 'p2', ordem: 2, fase: 'Pontos corridos', rodada: 1, casa: 'c', visitante: 'd' }),
    ]);
    render(await abrir());
    const tabela = screen.getByRole('table');
    expect(within(tabela).getAllByRole('row')[1].textContent).toContain('Leões');
    render(await abrir('jogos'));
    expect(screen.getByText('20/11 · 19:30')).toBeInTheDocument();
    expect(screen.getAllByText('A definir').length).toBeGreaterThan(0);
  });
});
