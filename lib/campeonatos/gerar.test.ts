import { describe, expect, it } from 'vitest';
import { embaralhar, gerarJogos, sortearGrupos } from './gerar';
import type { FormaDisputa, JogoGerado, OpcoesMataMata } from './tipos';

const mata = (o: Partial<OpcoesMataMata> = {}): OpcoesMataMata => ({
  ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio',
  desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3, ...o,
});
const ids = (n: number) => Array.from({ length: n }, (_, i) => `t${i + 1}`);
const fixo = () => 0.5;
const grupos = (o: Partial<Extract<FormaDisputa, { tipo: 'grupos_mata_mata' }>> = {}): FormaDisputa => ({
  tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 2, melhores_extras: 0,
  montagem: 'sorteio', ida_volta_grupos: false, mata: mata(), ...o,
});
const ok = (r: { jogos: JogoGerado[] } | { erro: string }): JogoGerado[] => {
  if ('erro' in r) throw new Error(r.erro);
  return r.jogos;
};

describe('embaralhar', () => {
  it('não muda a lista original e mantém os elementos', () => {
    const l = [1, 2, 3, 4, 5];
    const r = embaralhar(l, Math.random);
    expect(l).toEqual([1, 2, 3, 4, 5]);
    expect([...r].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('sortearGrupos', () => {
  it('é determinístico e cada cabeça fica num grupo diferente', () => {
    const t = ids(8);
    const cab = ['t1', 't2', 't3', 't4'];
    const a = sortearGrupos(t, 4, cab, fixo);
    expect(sortearGrupos(t, 4, cab, fixo)).toEqual(a);
    expect(Object.keys(a)).toEqual(['A', 'B', 'C', 'D']);
    for (const g of Object.values(a)) expect(g.filter((x) => cab.includes(x))).toHaveLength(1);
  });
  it('tamanhos diferem em no máximo 1 e todos aparecem uma vez', () => {
    const a = sortearGrupos(ids(10), 3, [], fixo);
    const tam = Object.values(a).map((g) => g.length);
    expect(Math.max(...tam) - Math.min(...tam)).toBeLessThanOrEqual(1);
    expect(Object.values(a).flat().sort()).toEqual(ids(10).sort());
  });
  it('cabeças além do número de grupos viram times comuns', () => {
    const a = sortearGrupos(ids(6), 2, ['t1', 't2', 't3'], fixo);
    expect(Object.values(a).flat().sort()).toEqual(ids(6).sort());
  });
  it('não muda as entradas', () => {
    const t = ids(6);
    const c = ['t1', 't2'];
    sortearGrupos(t, 2, c, Math.random);
    expect(t).toEqual(ids(6));
    expect(c).toEqual(['t1', 't2']);
  });
});

describe('gerarJogos: pontos corridos', () => {
  it('5 times ida e volta: 20 jogos, ordens 1..20', () => {
    const j = ok(gerarJogos({ tipo: 'pontos_corridos', ida_volta: true, final_entre: null, mata: null }, ids(5), { aleatorio: fixo }));
    expect(j).toHaveLength(20);
    expect(j.every((x) => x.fase === 'Pontos corridos' && x.grupo === null && x.rodada !== null)).toBe(true);
    expect(j.map((x) => x.ordem)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });
  it('final_entre 4 usa sementes 1x4 e 2x3', () => {
    const j = ok(gerarJogos({ tipo: 'pontos_corridos', ida_volta: false, final_entre: 4, mata: mata() }, ids(6), { aleatorio: fixo }));
    const mm = j.filter((x) => x.fase !== 'Pontos corridos');
    expect(mm).toHaveLength(3);
    expect(mm[0].vaga_casa).toEqual({ tipo: 'grupo', grupo: 'geral', posicao: 1 });
    expect(mm[0].vaga_visitante).toEqual({ tipo: 'grupo', grupo: 'geral', posicao: 4 });
    expect(mm[1].vaga_casa).toEqual({ tipo: 'grupo', grupo: 'geral', posicao: 2 });
    expect(mm[1].vaga_visitante).toEqual({ tipo: 'grupo', grupo: 'geral', posicao: 3 });
    expect(j.map((x) => x.ordem)).toEqual(j.map((_, i) => i + 1));
  });
  it('final_entre sem mata dá erro', () => {
    expect(gerarJogos({ tipo: 'pontos_corridos', ida_volta: false, final_entre: 2, mata: null }, ids(4), { aleatorio: fixo }))
      .toEqual({ erro: 'Escolha as opções do mata-mata da final.' });
  });
  it('final_entre maior que os times dá erro', () => {
    expect(gerarJogos({ tipo: 'pontos_corridos', ida_volta: false, final_entre: 4, mata: mata() }, ids(3), { aleatorio: fixo }))
      .toEqual({ erro: 'A final não pode ter mais times do que o campeonato.' });
  });
});

describe('gerarJogos: grupos + mata-mata', () => {
  it('2 grupos, passam 2, 8 times: 12 + 3 jogos', () => {
    const j = ok(gerarJogos(grupos(), ids(8), { aleatorio: fixo }));
    expect(j.filter((x) => x.fase === 'Fase de grupos')).toHaveLength(12);
    expect(j).toHaveLength(15);
    const primeiro = j.find((x) => x.fase !== 'Fase de grupos')!;
    expect(primeiro.vaga_casa).toEqual({ tipo: 'grupo', grupo: 'A', posicao: 1 });
    expect(j.map((x) => x.ordem)).toEqual(j.map((_, i) => i + 1));
  });
  it('rodadas compartilhadas e ordem por rodada, depois grupo', () => {
    const j = ok(gerarJogos(grupos(), ids(8), { aleatorio: fixo })).filter((x) => x.fase === 'Fase de grupos');
    expect(j.slice(0, 4).map((x) => [x.rodada, x.grupo])).toEqual([[1, 'A'], [1, 'A'], [1, 'B'], [1, 'B']]);
    const rs = j.map((x) => x.rodada!);
    expect(rs).toEqual([...rs].sort((a, b) => a - b));
  });
  it('manual sem grupos dá erro', () => {
    expect(gerarJogos(grupos({ montagem: 'manual' }), ids(8), { aleatorio: fixo })).toEqual({ erro: 'Monte os grupos antes de gerar.' });
  });
  it('usa os grupos informados e rejeita os que não batem', () => {
    const g = { A: ['t1', 't2', 't3', 't4'], B: ['t5', 't6', 't7', 't8'] };
    const j = ok(gerarJogos(grupos({ montagem: 'manual' }), ids(8), { grupos: g, aleatorio: fixo }));
    expect(j.find((x) => x.grupo === 'B')!.casa).toMatch(/^t[5-8]$/);
    expect(gerarJogos(grupos({ montagem: 'manual' }), ids(8), { grupos: { A: ['t1', 't2'], B: ['t5', 't6'] }, aleatorio: fixo }))
      .toEqual({ erro: 'Os grupos não batem com os times inscritos.' });
    expect(gerarJogos(grupos({ montagem: 'manual' }), ids(8), { grupos: { A: ['t1', 't1', 't2', 't3'], B: ['t5', 't6', 't7', 't8'] }, aleatorio: fixo }))
      .toEqual({ erro: 'Os grupos não batem com os times inscritos.' });
  });
  it('passam_por_grupo maior que o menor grupo', () => {
    expect(gerarJogos(grupos({ passam_por_grupo: 3 }), ids(5), { aleatorio: fixo }))
      .toEqual({ erro: 'Um grupo tem menos times do que as vagas para passar.' });
  });
  it('1 classificado só: sem mata-mata', () => {
    const j = ok(gerarJogos(grupos({ grupos: 1, passam_por_grupo: 1 }), ids(4), { aleatorio: fixo }));
    expect(j.every((x) => x.fase === 'Fase de grupos')).toBe(true);
  });
});

describe('gerarJogos: mata-mata direto', () => {
  const forma: FormaDisputa = { tipo: 'mata_mata', mata: mata() };
  it('respeita a ordem das sementes', () => {
    const s = ['t4', 't3', 't2', 't1'];
    const j = ok(gerarJogos(forma, ids(4), { sementes: s, aleatorio: fixo }));
    expect([j[0].casa, j[0].visitante, j[1].casa, j[1].visitante]).toEqual(['t4', 't3', 't2', 't1']);
    expect(j.every((x) => x.rodada === null)).toBe(true);
  });
  it('sementes que não batem dão erro', () => {
    expect(gerarJogos(forma, ids(4), { sementes: ['t1', 't2', 't3', 'x'], aleatorio: fixo })).toEqual({ erro: 'A chave não bate com os times inscritos.' });
  });
  it('sem sementes sorteia', () => {
    expect(ok(gerarJogos(forma, ids(4), { aleatorio: fixo }))).toHaveLength(3);
  });
});

describe('gerarJogos: validações', () => {
  it('menos de 2 times', () => {
    expect(gerarJogos({ tipo: 'mata_mata', mata: mata() }, ['t1'], { aleatorio: fixo })).toEqual({ erro: 'São necessários pelo menos 2 times.' });
  });
  it('mais grupos que times', () => {
    expect(gerarJogos(grupos({ grupos: 3 }), ids(2), { aleatorio: fixo })).toEqual({ erro: 'Há mais grupos do que times.' });
  });
  it('times repetidos', () => {
    expect(gerarJogos({ tipo: 'mata_mata', mata: mata() }, ['t1', 't1', 't2'], { aleatorio: fixo })).toEqual({ erro: 'Há times repetidos.' });
  });
  it('não muda os times', () => {
    const t = ids(4);
    gerarJogos({ tipo: 'mata_mata', mata: mata() }, t, { aleatorio: Math.random });
    expect(t).toEqual(ids(4));
  });
});
