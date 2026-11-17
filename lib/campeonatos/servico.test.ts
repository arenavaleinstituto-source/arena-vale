import { describe, expect, it, vi } from 'vitest';
import { regulamentoPadrao } from './regulamento';
import { gerar, recalcular } from './servico';
import type { DadosCampeonato, PortasCampeonato } from './portas';
import type { FormaDisputa, JogoCalc } from './tipos';

const fixo = () => 0.5;

function jogo(p: Partial<JogoCalc>): JogoCalc {
  return {
    id: 'j', ordem: null, fase: null, grupo: null, rodada: null, casa: null, visitante: null, status: 'agendado',
    placar_casa: null, placar_visitante: null, penaltis_casa: null, penaltis_visitante: null, wo: null, parciais: null,
    vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null, ...p,
  };
}

function portasFalsas(dados: DadosCampeonato): PortasCampeonato & { chamadas: Record<string, unknown[][]> } {
  const chamadas: Record<string, unknown[][]> = { aplicarVagas: [], substituirJogos: [], gravarRegulamento: [] };
  return {
    chamadas,
    carregar: vi.fn(async () => dados),
    aplicarVagas: vi.fn(async (...a: unknown[]) => void chamadas.aplicarVagas.push(a)),
    substituirJogos: vi.fn(async (...a: unknown[]) => void chamadas.substituirJogos.push(a)),
    gravarRegulamento: vi.fn(async (...a: unknown[]) => void chamadas.gravarRegulamento.push(a)),
  };
}

const MATA: FormaDisputa = {
  tipo: 'mata_mata',
  mata: { ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'manual', desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3 },
};

function dadosBase(p: Partial<DadosCampeonato> = {}): DadosCampeonato {
  return { id: 'c1', modalidade: 'futsal', formato: 'mata_mata', regulamento: regulamentoPadrao('gols', MATA), times: ['a', 'b', 'c', 'd'], grupos: {}, jogos: [], sorteios: {}, destravadas: [], ...p };
}

describe('recalcular', () => {
  it('aplica as vagas que o avanço automático calcula', async () => {
    const semi1 = jogo({ id: 's1', ordem: 1, fase: 'Semifinal', casa: 'a', visitante: 'b', status: 'finalizado', placar_casa: 2, placar_visitante: 0 });
    const semi2 = jogo({ id: 's2', ordem: 2, fase: 'Semifinal', casa: 'c', visitante: 'd' });
    const final = jogo({ id: 'f', ordem: 3, fase: 'Final', vaga_casa: { tipo: 'vencedor', jogo: 1 }, vaga_visitante: { tipo: 'vencedor', jogo: 2 } });
    const p = portasFalsas(dadosBase({ jogos: [semi1, semi2, final] }));
    const r = await recalcular('c1', p);
    expect(r.avisos).toEqual([]);
    expect(p.chamadas.aplicarVagas[0][0]).toEqual([{ id: 'f', casa: 'a', visitante: null }]);
  });

  it('campeonato inexistente não aplica nada', async () => {
    const p = portasFalsas(dadosBase());
    (p.carregar as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    expect(await recalcular('x', p)).toEqual({ avisos: [] });
    expect(p.aplicarVagas).not.toHaveBeenCalled();
  });
});

describe('gerar', () => {
  it('simular devolve os jogos sem gravar', async () => {
    const p = portasFalsas(dadosBase());
    const r = await gerar('c1', p, { forma: MATA, sementes: ['a', 'b', 'c', 'd'], formaMudou: false, aleatorio: fixo, simular: true });
    expect('jogos' in r && r.jogos).toHaveLength(3);
    expect(p.substituirJogos).not.toHaveBeenCalled();
    expect(p.gravarRegulamento).not.toHaveBeenCalled();
  });

  it('para valer grava os jogos, a forma no regulamento e recalcula', async () => {
    const existente = jogo({ id: 'velho', ordem: 1, fase: 'Final', casa: 'a', visitante: 'b' });
    const p = portasFalsas(dadosBase({ jogos: [existente] }));
    const r = await gerar('c1', p, { forma: MATA, sementes: ['a', 'b', 'c', 'd'], formaMudou: false, aleatorio: fixo, simular: false });
    expect('jogos' in r).toBe(true);
    const [camp, apagar, inserir] = p.chamadas.substituirJogos[0] as [string, string[], unknown[]];
    expect(camp).toBe('c1');
    expect(apagar).toEqual(['velho']);
    expect(inserir).toHaveLength(3);
    expect((p.chamadas.gravarRegulamento[0][1] as { forma: FormaDisputa }).forma).toEqual(MATA);
    expect(p.carregar).toHaveBeenCalledTimes(2);
  });

  it('devolve o erro da trava quando a forma muda depois do primeiro resultado', async () => {
    const jogado = jogo({ id: 'j1', ordem: 1, fase: 'Semifinal', casa: 'a', visitante: 'b', status: 'finalizado', placar_casa: 1, placar_visitante: 0 });
    const p = portasFalsas(dadosBase({ jogos: [jogado] }));
    const pontos: FormaDisputa = { tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null };
    const r = await gerar('c1', p, { forma: pontos, formaMudou: false, aleatorio: fixo, simular: false });
    expect(r).toEqual({ erro: 'A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.' });
    expect(p.substituirJogos).not.toHaveBeenCalled();
  });

  it('devolve o erro da geração (menos de 2 times)', async () => {
    const p = portasFalsas(dadosBase({ times: ['a'] }));
    const r = await gerar('c1', p, { forma: MATA, formaMudou: false, aleatorio: fixo, simular: true });
    expect(r).toEqual({ erro: 'São necessários pelo menos 2 times.' });
  });
});
