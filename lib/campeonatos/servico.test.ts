import { describe, expect, it, vi } from 'vitest';
import { regulamentoPadrao } from './regulamento';
import { gerar, recalcular } from './servico';
import { gruposDosJogos, type DadosCampeonato, type PortasCampeonato } from './portas';
import { aleatorioComSemente } from './gerar';
import type { FormaDisputa, JogoCalc, JogoGerado } from './tipos';

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

describe('gerar de novo depois do primeiro resultado (opções de fases futuras)', () => {
  const T8 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const comTerceiro = <F extends FormaDisputa>(f: F): F => ({ ...f, mata: { ...(f as { mata: MataOpcoes }).mata, terceiro_lugar: true } });
  type MataOpcoes = Extract<FormaDisputa, { tipo: 'mata_mata' }>['mata'];

  /** Gera para valer e devolve os jogos como estariam no banco, com o 1º jogo já finalizado. */
  async function gravados(forma: FormaDisputa, semente: number): Promise<JogoCalc[]> {
    const p = portasFalsas(dadosBase({ times: T8, regulamento: regulamentoPadrao('gols', forma) }));
    const r = await gerar('c1', p, { forma, formaMudou: false, aleatorio: aleatorioComSemente(semente), simular: true });
    if (!('jogos' in r)) throw new Error(r.erro);
    return r.jogos.map((g) =>
      jogo({
        id: `g${g.ordem}`, ordem: g.ordem, fase: g.fase, grupo: g.grupo, rodada: g.rodada, casa: g.casa, visitante: g.visitante,
        vaga_casa: g.vaga_casa, vaga_visitante: g.vaga_visitante, jogo_volta_de: g.volta_de ? `g${g.volta_de}` : null,
        ...(g.ordem === 1 ? { status: 'finalizado', placar_casa: 1, placar_visitante: 0 } : {}),
      }),
    );
  }

  it('grupos sorteados: ligar o 3º lugar não mexe na fase de grupos', async () => {
    const forma: FormaDisputa = { ...regulamentoPadrao('gols', { tipo: 'grupos_mata_mata' } as FormaDisputa).forma, tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 2, melhores_extras: 0, montagem: 'sorteio', ida_volta_grupos: false, mata: MATA.mata } as FormaDisputa;
    const jogos = await gravados(forma, 1);
    const p = portasFalsas(dadosBase({ times: T8, regulamento: regulamentoPadrao('gols', forma), jogos, grupos: gruposDosJogos(jogos) }));
    const r = await gerar('c1', p, { forma: comTerceiro(forma), formaMudou: false, aleatorio: aleatorioComSemente(99), simular: false });
    expect(r).not.toHaveProperty('erro');
    const [, apagar, inserir] = p.chamadas.substituirJogos[0] as [string, string[], JogoGerado[]];
    const deGrupo = new Set(jogos.filter((j) => j.fase === 'Fase de grupos').map((j) => j.id));
    expect(apagar.filter((id) => deGrupo.has(id))).toEqual([]);
    expect(inserir.filter((j) => j.fase === 'Fase de grupos')).toEqual([]);
  });

  it('mata-mata sorteado: ligar o 3º lugar mantém os confrontos da 1ª fase', async () => {
    const forma: FormaDisputa = { tipo: 'mata_mata', mata: { ...MATA.mata, chave: 'sorteio' } };
    const jogos = await gravados(forma, 1);
    const p = portasFalsas(dadosBase({ times: T8, regulamento: regulamentoPadrao('gols', forma), jogos }));
    const r = await gerar('c1', p, { forma: comTerceiro(forma), formaMudou: false, aleatorio: aleatorioComSemente(99), simular: false });
    expect(r).not.toHaveProperty('erro');
    const [, apagar, inserir] = p.chamadas.substituirJogos[0] as [string, string[], JogoGerado[]];
    const quartas = jogos.filter((j) => j.fase === 'Quartas de final');
    expect(apagar.filter((id) => quartas.some((q) => q.id === id))).toEqual([]);
    expect(inserir.filter((j) => j.fase === 'Quartas de final')).toEqual([]);
  });
});
