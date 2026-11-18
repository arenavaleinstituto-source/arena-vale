import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { regulamentoPadrao } from '@/lib/campeonatos/regulamento';
import type { FormaDisputa, OpcoesMataMata } from '@/lib/campeonatos/tipos';
import { EditorFormaDisputa } from './EditorFormaDisputa';
import { EditorRegulamento } from './EditorRegulamento';

const MATA: OpcoesMataMata = { ida_volta: true, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio', desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3 };
const GRUPOS: FormaDisputa = { tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 2, melhores_extras: 0, montagem: 'sorteio', ida_volta_grupos: false, mata: MATA };

describe('EditorRegulamento', () => {
  it('a seta sobe o critério e o onChange recebe a nova ordem', async () => {
    const onChange = vi.fn();
    render(<EditorRegulamento valor={regulamentoPadrao('gols')} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Subir mais gols pró' }));
    expect(onChange.mock.calls[0][0].criterios).toEqual(['vitorias', 'pro', 'saldo', 'confronto_direto', 'sorteio']);
  });

  it('desligar um critério tira ele da lista', async () => {
    const onChange = vi.fn();
    render(<EditorRegulamento valor={regulamentoPadrao('gols')} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'confronto direto' }));
    expect(onChange.mock.calls[0][0].criterios).toEqual(['vitorias', 'saldo', 'pro', 'sorteio']);
  });

  it('sorteio no meio mostra o erro', () => {
    render(<EditorRegulamento valor={{ ...regulamentoPadrao('gols'), criterios: ['vitorias', 'sorteio', 'saldo'] }} onChange={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('O sorteio precisa ser o último critério.');
  });
});

describe('EditorFormaDisputa', () => {
  it('vôlei: mostra "Melhor de" e não mostra "Gol fora de casa"', () => {
    render(<EditorFormaDisputa valor={GRUPOS} tipoPlacar="sets" travada={false} temCampanha onChange={vi.fn()} />);
    expect(screen.getByLabelText('Melhor de')).toBeInTheDocument();
    expect(screen.queryByLabelText('Gol fora de casa')).toBeNull();
  });

  it('futsal com ida e volta mostra "Gol fora de casa"', () => {
    render(<EditorFormaDisputa valor={GRUPOS} tipoPlacar="gols" travada={false} temCampanha onChange={vi.fn()} />);
    expect(screen.getByLabelText('Gol fora de casa')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Passa quem teve melhor campanha' })).toBeInTheDocument();
  });

  it('cada fase do mata-mata escolhe jogo único ou ida e volta', async () => {
    const onChange = vi.fn();
    const semIdaVolta = { ...MATA, ida_volta: false, final_ida_volta: false };
    render(<EditorFormaDisputa valor={{ tipo: 'mata_mata', mata: semIdaVolta }} tipoPlacar="gols" travada={false} temCampanha onChange={onChange} />);
    expect(screen.getByLabelText('Final')).toHaveValue('unico');
    expect(screen.getByLabelText('Oitavas de final')).toBeInTheDocument();
    expect(screen.queryByText('Ida e volta no mata-mata')).toBeNull();
    await userEvent.setup().selectOptions(screen.getByLabelText('Semifinal'), 'ida_volta');
    expect(onChange).toHaveBeenLastCalledWith({ tipo: 'mata_mata', mata: { ...semIdaVolta, ida_volta_fases: ['Semifinal'] } });
  });

  it('mata-mata direto não oferece "melhor campanha"', () => {
    render(<EditorFormaDisputa valor={{ tipo: 'mata_mata', mata: MATA }} tipoPlacar="gols" travada={false} temCampanha onChange={vi.fn()} />);
    expect(screen.queryByRole('option', { name: 'Passa quem teve melhor campanha' })).toBeNull();
  });

  it('trocar para pontos corridos manda a forma nova', async () => {
    const onChange = vi.fn();
    render(<EditorFormaDisputa valor={GRUPOS} tipoPlacar="gols" travada={false} temCampanha onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Pontos corridos' }));
    expect(onChange.mock.calls[0][0]).toMatchObject({ tipo: 'pontos_corridos', ida_volta: false, final_entre: null });
  });

  it('travada: não troca o tipo e explica', () => {
    render(<EditorFormaDisputa valor={GRUPOS} tipoPlacar="gols" travada temCampanha onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Mata-mata' })).toBeDisabled();
    expect(screen.getByText('Já há resultados: só as fases que ainda não começaram podem mudar.')).toBeInTheDocument();
  });
});

describe('EditorRegulamento — ligar critério', () => {
  it('critério ligado entra antes do sorteio', async () => {
    const onChange = vi.fn();
    render(<EditorRegulamento valor={regulamentoPadrao('gols')} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'menos gols sofridos' }));
    expect(onChange.mock.calls[0][0].criterios).toEqual(['vitorias', 'saldo', 'pro', 'confronto_direto', 'contra', 'sorteio']);
  });
});
