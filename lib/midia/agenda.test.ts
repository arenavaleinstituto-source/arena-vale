import { describe, expect, it } from 'vitest';
import { agendaAtiva, deAgendaJogos, deJogos, juntarAgenda, proximaTransmissao, resumoAgenda, type ItemAgenda } from './agenda';

const AGORA = new Date('2026-11-10T12:00:00-03:00');

function item(p: Partial<ItemAgenda> & { dataHora: string }): ItemAgenda {
  return {
    id: Math.random().toString(36).slice(2),
    origem: 'jogos',
    modalidade: 'Futsal',
    fase: null,
    casa: 'Água Verde',
    fora: 'Vila Nova',
    local: null,
    transmissao: false,
    ...p,
  };
}

describe('agenda unificada', () => {
  it('duplicata casada por times (qualquer ordem, sem acento) e até 1 h vira um item de jogos com transmissão', () => {
    const j = item({ origem: 'jogos', dataHora: '2026-11-15T22:00:00.000Z' });
    const a = item({ origem: 'agenda', casa: 'vila nova', fora: 'agua  verde', dataHora: '2026-11-15T22:40:00.000Z', transmissao: true });
    const r = juntarAgenda([j], [a], AGORA);
    expect(r).toHaveLength(1);
    expect(r[0].origem).toBe('jogos');
    expect(r[0].transmissao).toBe(true);
  });

  it('mesmos times com 2 h de diferença ficam os dois', () => {
    const j = item({ origem: 'jogos', dataHora: '2026-11-15T22:00:00.000Z' });
    const a = item({ origem: 'agenda', dataHora: '2026-11-16T00:00:00.000Z', transmissao: true });
    expect(juntarAgenda([j], [a], AGORA)).toHaveLength(2);
  });

  it('ordena por data e corta no limite de 6', () => {
    const itens = [7, 3, 5, 1, 2, 6, 4].map((d) => item({ casa: `T${d}`, fora: `U${d}`, dataHora: `2026-11-1${d}T20:00:00.000Z` }));
    const r = juntarAgenda(itens, [], AGORA);
    expect(r).toHaveLength(6);
    expect(r.map((i) => i.casa)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
  });

  it('só jogos passados → lista vazia e nenhuma próxima transmissão', () => {
    const r = juntarAgenda([item({ dataHora: '2026-11-01T20:00:00.000Z' })], [item({ origem: 'agenda', dataHora: '2026-11-02T20:00:00.000Z' })], AGORA);
    expect(r).toEqual([]);
    expect(proximaTransmissao(r)).toBeNull();
  });

  it('próxima transmissão é o primeiro item com transmissão', () => {
    const r = [item({ dataHora: '2026-11-11T20:00:00.000Z' }), item({ casa: 'X', dataHora: '2026-11-12T20:00:00.000Z', transmissao: true })];
    expect(proximaTransmissao(r)?.casa).toBe('X');
  });
});

describe('resumoAgenda (página inicial)', () => {
  it('acha a próxima transmissão mesmo depois dos 6 primeiros jogos', () => {
    const itens = [
      ...[1, 2, 3, 4, 5, 6, 7].map((d) => item({ casa: `T${d}`, dataHora: `2026-11-1${d}T20:00:00.000Z` })),
      item({ casa: 'COM TV', dataHora: '2026-11-19T20:00:00.000Z', transmissao: true }),
    ];
    const r = resumoAgenda(itens, 6);
    expect(r.lista).toHaveLength(6);
    expect(r.proxima?.casa).toBe('COM TV');
  });
});

describe('conversões', () => {
  it('jogos.data sem fuso é horário de Brasília', () => {
    const i = deJogos({
      id: 'j1',
      data: '2026-11-15T19:00:00',
      fase: 'fase_grupos',
      local: 'Arena Vale - Quadra 1',
      casa: { nome: 'A' },
      fora: { nome: 'B' },
      campeonato: { modalidade: 'futsal' },
      transmissoes: [],
    });
    expect(i.dataHora).toBe(new Date('2026-11-15T19:00:00-03:00').toISOString());
    expect(i.transmissao).toBe(false);
    expect(i.casa).toBe('A');
    expect(i.origem).toBe('jogos');
  });

  it('jogo com transmissão cadastrada ganha o selo', () => {
    const i = deJogos({ id: 'j2', data: '2026-11-15T19:00:00', fase: null, local: null, casa: { nome: 'A' }, fora: { nome: 'B' }, campeonato: null, transmissoes: [{ id: 't' }] });
    expect(i.transmissao).toBe(true);
  });

  it('agenda de transmissões: selo sempre e local corrigido para Arena Vale', () => {
    const i = deAgendaJogos({
      id: 'a1',
      modalidade: 'Futebol 7',
      fase: 'Quartos de Final',
      equipe_casa: 'Real Blumenau',
      equipe_fora: 'Sede',
      data_hora: '2026-11-20T15:30:00+00:00',
      local: 'ARENA VALE SPORTS',
    });
    expect(i.local).toBe('Arena Vale');
    expect(i.transmissao).toBe(true);
    expect(i.origem).toBe('agenda');
    expect(i.dataHora).toBe('2026-11-20T15:30:00.000Z');
  });
});

describe('agendaAtiva', () => {
  it('tira da agenda as transmissões canceladas (qualquer forma de escrever)', () => {
    const linhas = [
      { id: 'a', equipe_casa: 'A', equipe_fora: 'B', data_hora: '2026-11-15T19:00:00Z', status: 'Agendado' },
      { id: 'b', equipe_casa: 'A', equipe_fora: 'B', data_hora: '2026-11-15T19:00:00Z', status: 'Cancelado' },
      { id: 'c', equipe_casa: 'A', equipe_fora: 'B', data_hora: '2026-11-15T19:00:00Z', status: ' cancelada ' },
      { id: 'd', equipe_casa: 'A', equipe_fora: 'B', data_hora: '2026-11-15T19:00:00Z', status: null },
    ];
    expect(agendaAtiva(linhas).map((l) => l.id)).toEqual(['a', 'd']);
  });
});
