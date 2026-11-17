import { describe, expect, it } from 'vitest';
import { gerarJogos } from './gerar';
import { fasesComResultado, planoDeRegeracao } from './trava';
import type { FormaDisputa, JogoCalc, JogoGerado, OpcoesMataMata } from './tipos';

const mata = (o: Partial<OpcoesMataMata> = {}): OpcoesMataMata => ({
  ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio',
  desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3, ...o,
});
const forma = (m: Partial<OpcoesMataMata> = {}): FormaDisputa => ({
  tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 1, melhores_extras: 0,
  montagem: 'manual', ida_volta_grupos: false, mata: mata(m),
});
const grupos = { A: ['t1', 't2'], B: ['t3', 't4'] };
const gerar = (f: FormaDisputa): JogoGerado[] => {
  const r = gerarJogos(f, ['t1', 't2', 't3', 't4'], { grupos, aleatorio: () => 0.5 });
  if ('erro' in r) throw new Error(r.erro);
  return r.jogos;
};
const calc = (j: JogoGerado, status = 'agendado'): JogoCalc => ({
  id: `id${j.ordem}`, ordem: j.ordem, fase: j.fase, grupo: j.grupo, rodada: j.rodada,
  casa: j.casa, visitante: j.visitante, status,
  placar_casa: null, placar_visitante: null, penaltis_casa: null, penaltis_visitante: null, wo: null,
  parciais: null, vaga_casa: j.vaga_casa, vaga_visitante: j.vaga_visitante, vaga_manual: false, jogo_volta_de: null,
});
const gj = (ordem: number, fase: string, o: Partial<JogoGerado> = {}): JogoGerado => ({
  ordem, fase, rodada: null, grupo: null, casa: `c${ordem}`, visitante: `v${ordem}`,
  vaga_casa: null, vaga_visitante: null, volta_de: null, ...o,
});
const ok = (r: ReturnType<typeof planoDeRegeracao>) => {
  if ('erro' in r) throw new Error(r.erro);
  return r;
};
const FASE_GRUPOS = 'Fase de grupos';

describe('fasesComResultado', () => {
  it('considera finalizado e ao_vivo, ignora agendado', () => {
    const js = [calc(gj(1, 'A'), 'finalizado'), calc(gj(2, 'B'), 'ao_vivo'), calc(gj(3, 'C'), 'agendado')];
    expect([...fasesComResultado(js)].sort()).toEqual(['A', 'B']);
  });
});

describe('planoDeRegeracao', () => {
  it('sem nenhum resultado apaga todos e insere todos, mesmo com forma mudada', () => {
    const ex = gerar(forma()).map((j) => calc(j));
    const novos = gerar(forma({ final_ida_volta: true }));
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: true, destravadas: [] }));
    expect(p.apagar).toEqual(ex.map((j) => j.id));
    expect(p.inserir).toEqual(novos);
    expect(p.avisos).toEqual([]);
  });

  it('forma mudou com resultado: erro, a não ser que todas as fases com resultado estejam destravadas', () => {
    const ex = gerar(forma()).map((j) => calc(j, j.fase === FASE_GRUPOS ? 'finalizado' : 'agendado'));
    const novos = gerar(forma({ final_ida_volta: true }));
    expect(planoDeRegeracao(ex, novos, { formaMudou: true, destravadas: [] })).toEqual({
      erro: 'A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.',
    });
    expect('erro' in planoDeRegeracao(ex, novos, { formaMudou: true, destravadas: [FASE_GRUPOS] })).toBe(false);
  });

  it('jogos com resultado (finalizado ou ao_vivo) nunca entram em apagar', () => {
    const f = forma();
    const ex = gerar(f).map((j) => calc(j, j.ordem === 1 ? 'finalizado' : j.ordem === 2 ? 'ao_vivo' : 'agendado'));
    const p = ok(planoDeRegeracao(ex, gerar(f), { formaMudou: false, destravadas: [] }));
    expect(p.apagar).not.toContain('id1');
    expect(p.apagar).not.toContain('id2');
  });

  it('final de jogo único para ida e volta com grupos encerrados: só troca a final', () => {
    const antigo = gerar(forma());
    const novos = gerar(forma({ final_ida_volta: true }));
    const ex = antigo.map((j) => calc(j, j.fase === FASE_GRUPOS ? 'finalizado' : 'agendado'));
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] }));
    const finaisAntigas = ex.filter((j) => j.fase !== FASE_GRUPOS).map((j) => j.id);
    const finaisNovas = novos.filter((j) => j.fase !== FASE_GRUPOS);
    expect(finaisNovas.length).toBeGreaterThan(finaisAntigas.length);
    expect(p.apagar).toEqual(finaisAntigas);
    expect(p.inserir).toEqual(finaisNovas);
    expect(p.avisos).toEqual([]);
  });

  it('estrutura diferente em fase com resultado não destravada: erro com o nome da fase', () => {
    const ex = [calc(gj(1, 'Grupos', { casa: 'a', visitante: 'b' }), 'finalizado')];
    const novos = [gj(1, 'Grupos', { casa: 'a', visitante: 'c' })];
    expect(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] })).toEqual({
      erro: 'A fase Grupos já começou. Peça à ARENA VALE para destravar.',
    });
  });

  it('número de jogos diferente na fase iniciada: erro', () => {
    const ex = [calc(gj(1, 'Grupos'), 'finalizado'), calc(gj(2, 'Grupos'))];
    const novos = [gj(1, 'Grupos')];
    expect('erro' in planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] })).toBe(true);
  });

  it('a primeira fase (por ordem) com diferença é a citada', () => {
    const ex = [calc(gj(1, 'X'), 'finalizado'), calc(gj(2, 'Y'), 'finalizado')];
    const novos = [gj(1, 'X', { casa: 'z' }), gj(2, 'Y', { casa: 'z' })];
    expect(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] })).toEqual({
      erro: 'A fase X já começou. Peça à ARENA VALE para destravar.',
    });
  });

  it('time preenchido pela resolução de vaga não conta como mudança quando o novo tem vaga', () => {
    const vaga = { tipo: 'vencedor' as const, jogo: 1 };
    const perd = { tipo: 'perdedor' as const, jogo: 1 };
    const ex = [
      calc(gj(1, 'Semi'), 'finalizado'),
      calc(gj(2, 'Semi', { casa: 't9', visitante: 't8', vaga_casa: vaga, vaga_visitante: perd })),
    ];
    const novos = [gj(1, 'Semi'), gj(2, 'Semi', { casa: null, visitante: null, vaga_casa: vaga, vaga_visitante: perd })];
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] }));
    expect(p).toEqual({ apagar: [], inserir: [], avisos: [] });
  });

  it('fase iniciada com estrutura igual mantém todos os jogos (nada apagado nem inserido)', () => {
    const ex = [calc(gj(1, 'G'), 'finalizado'), calc(gj(2, 'G'))];
    const novos = [gj(1, 'G'), gj(2, 'G')];
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] }));
    expect(p).toEqual({ apagar: [], inserir: [], avisos: [] });
  });

  it('fase destravada: apaga só os não iniciados e avisa colisão de ordem', () => {
    const ex = [calc(gj(1, 'G'), 'finalizado'), calc(gj(2, 'G'))];
    const novos = [gj(1, 'G', { casa: 'q' }), gj(2, 'G', { casa: 'q' }), gj(3, 'G')];
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: true, destravadas: ['G'] }));
    expect(p.apagar).toEqual(['id2']);
    expect(p.inserir.map((j) => j.ordem)).toEqual([2, 3]);
    expect(p.avisos).toEqual(['O Jogo 1 já foi disputado e foi mantido.']);
  });

  it('fase ausente dos novos: apaga não iniciados e mantém iniciados com aviso', () => {
    const ex = [calc(gj(1, 'G'), 'finalizado'), calc(gj(2, 'Extra'), 'finalizado'), calc(gj(3, 'Extra')), calc(gj(4, 'Outra'))];
    const novos = [gj(1, 'G')];
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: ['Extra'] }));
    expect(p.apagar).toEqual(['id3', 'id4']);
    expect(p.inserir).toEqual([]);
    expect(p.avisos).toEqual(['O Jogo 2 já foi disputado e foi mantido.']);
  });

  it('ordem de jogo mantido em outra fase colide: não insere e avisa uma vez', () => {
    const ex = [calc(gj(1, 'G'), 'finalizado'), calc(gj(2, 'H'))];
    const novos = [gj(1, 'G'), gj(2, 'H'), gj(1, 'H'), gj(1, 'H')];
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] }));
    expect(p.inserir.map((j) => `${j.fase}${j.ordem}`)).toEqual(['H2']);
    expect(p.avisos).toEqual(['O Jogo 1 já foi disputado e foi mantido.']);
  });

  it('apagar na ordem dos existentes, inserir por ordem crescente, sem mutar entradas', () => {
    const ex = [calc(gj(5, 'G')), calc(gj(1, 'G'))];
    const novos = [gj(3, 'G'), gj(2, 'G')];
    const copiaEx = JSON.parse(JSON.stringify(ex));
    const copiaNv = JSON.parse(JSON.stringify(novos));
    const p = ok(planoDeRegeracao(ex, novos, { formaMudou: false, destravadas: [] }));
    expect(p.apagar).toEqual(['id5', 'id1']);
    expect(p.inserir.map((j) => j.ordem)).toEqual([2, 3]);
    expect(ex).toEqual(copiaEx);
    expect(novos).toEqual(copiaNv);
  });
});
