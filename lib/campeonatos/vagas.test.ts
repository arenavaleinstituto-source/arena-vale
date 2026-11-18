import { describe, expect, it } from 'vitest';
import type { LinhaTabela } from './classificacao';
import { regulamentoPadrao } from './regulamento';
import type { DesempateMataMata, JogoCalc, OpcoesMataMata, Regulamento, TipoPlacar, Vaga } from './tipos';
import { decidirConfronto, resolverVagas, rotuloDaVaga, type ResultadoVagas } from './vagas';

// ---- montagem ----

function jg(id: string, ordem: number, x: Partial<JogoCalc> = {}): JogoCalc {
  return {
    id, ordem, fase: null, grupo: null, rodada: null, casa: null, visitante: null, status: 'agendado',
    placar_casa: null, placar_visitante: null, penaltis_casa: null, penaltis_visitante: null, wo: null,
    parciais: null, vaga_casa: null, vaga_visitante: null, vaga_manual: false, jogo_volta_de: null, ...x,
  };
}
const fin = (pc: number, pv: number): Partial<JogoCalc> => ({ status: 'finalizado', placar_casa: pc, placar_visitante: pv });
const ag: Partial<JogoCalc> = { status: 'agendado', placar_casa: null, placar_visitante: null };

function mata(o: Partial<OpcoesMataMata> = {}, d: Partial<DesempateMataMata> = {}): OpcoesMataMata {
  return {
    ida_volta: false, final_ida_volta: false, terceiro_lugar: true, chave: 'sorteio', sets_melhor_de: 3, ...o,
    desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis', ...d },
  };
}
const regMata = (t: TipoPlacar, m: OpcoesMataMata): Regulamento => regulamentoPadrao(t, { tipo: 'mata_mata', mata: m });
const regGrupos = (m: OpcoesMataMata = mata(), extras = 0): Regulamento =>
  regulamentoPadrao('gols', {
    tipo: 'grupos_mata_mata', grupos: 2, passam_por_grupo: 2, melhores_extras: extras,
    montagem: 'sorteio', ida_volta_grupos: false, mata: m,
  });

const g = (grupo: string, posicao: number): Vaga => ({ tipo: 'grupo', grupo, posicao });
const venc = (jogo: number): Vaga => ({ tipo: 'vencedor', jogo });
const perd = (jogo: number): Vaga => ({ tipo: 'perdedor', jogo });
const grupoJ = (id: string, ordem: number, grupo: string, casa: string, vis: string, x: Partial<JogoCalc>) =>
  jg(id, ordem, { fase: 'Fase de grupos', grupo, casa, visitante: vis, ...x });

/**
 * Grupos A (a1, a2, a3) e B (b1, b2, b3), todos os jogos finalizados → a1, a2, a3 / b1, b2, b3.
 * s7: 1º A × 2º B; s8: 1º B × 2º A; 9: 3º lugar (perdedores); 10: final (vencedores).
 */
function copa(over: Record<string, Partial<JogoCalc>> = {}): JogoCalc[] {
  const base = [
    grupoJ('g1', 1, 'A', 'a1', 'a2', fin(2, 0)),
    grupoJ('g2', 2, 'A', 'a1', 'a3', fin(1, 0)),
    grupoJ('g3', 3, 'A', 'a2', 'a3', fin(1, 0)),
    grupoJ('g4', 4, 'B', 'b1', 'b2', fin(1, 0)),
    grupoJ('g5', 5, 'B', 'b1', 'b3', fin(1, 0)),
    grupoJ('g6', 6, 'B', 'b2', 'b3', fin(1, 0)),
    jg('s7', 7, { fase: 'Semifinal', vaga_casa: g('A', 1), vaga_visitante: g('B', 2) }),
    jg('s8', 8, { fase: 'Semifinal', vaga_casa: g('B', 1), vaga_visitante: g('A', 2) }),
    jg('t9', 9, { fase: 'Disputa de 3º lugar', vaga_casa: perd(7), vaga_visitante: perd(8) }),
    jg('f10', 10, { fase: 'Final', vaga_casa: venc(7), vaga_visitante: venc(8) }),
  ];
  return base.map((j) => ({ ...j, ...(over[j.id] ?? {}) }));
}
const timesCopa = { A: ['a1', 'a2', 'a3'], B: ['b1', 'b2', 'b3'] };
const upd = (res: ResultadoVagas, id: string) => res.atualizar.find((u) => u.id === id);

// ---- vagas de grupo ----

describe('resolverVagas: vagas de grupo', () => {
  it('grupo incompleto: a vaga não é preenchida e o 1º atual aparece em provaveis', () => {
    const jogos = copa({ g3: ag }); // falta a2 × a3
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    // s7: 1º A ainda não decidido; 2º B já decidido (grupo B completo)
    expect(upd(res, 's7')).toEqual({ id: 's7', casa: null, visitante: 'b2' });
    expect(res.provaveis.s7).toEqual({ casa: 'a1' });
    // 2º A provisório: a3 (0 pontos, saldo −1) à frente de a2 (saldo −2)
    expect(res.provaveis.s8).toEqual({ visitante: 'a3' });
    expect(upd(res, 's8')).toEqual({ id: 's8', casa: 'b1', visitante: null });
    expect(res.avisos).toEqual([]);
  });

  it('grupo completo: a vaga é preenchida', () => {
    const res = resolverVagas(copa(), regGrupos(), timesCopa, {});
    expect(upd(res, 's7')).toEqual({ id: 's7', casa: 'a1', visitante: 'b2' });
    expect(upd(res, 's8')).toEqual({ id: 's8', casa: 'b1', visitante: 'a2' });
    expect(upd(res, 't9')).toBeUndefined();
    expect(upd(res, 'f10')).toBeUndefined();
    expect(res.provaveis).toEqual({});
  });

  it('jogo cancelado não segura o grupo: a vaga é preenchida', () => {
    const jogos = copa({ g3: { status: 'cancelado', placar_casa: null, placar_visitante: null } }); // a2 × a3 cancelado
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    // A sem o jogo cancelado: a1 6, a3 0 (saldo −1), a2 0 (saldo −2)
    expect(upd(res, 's7')).toEqual({ id: 's7', casa: 'a1', visitante: 'b2' });
    expect(upd(res, 's8')).toEqual({ id: 's8', casa: 'b1', visitante: 'a3' });
    expect(res.provaveis).toEqual({});
  });

  it("jogo cancelado também não segura a tabela 'geral'", () => {
    const r = regulamentoPadrao('gols', { tipo: 'pontos_corridos', ida_volta: false, final_entre: 2, mata: mata() });
    const jogos = [
      jg('p1', 1, { fase: 'Pontos corridos', casa: 'x', visitante: 'y', ...fin(0, 1) }),
      jg('p2', 2, { fase: 'Pontos corridos', casa: 'x', visitante: 'z', ...fin(0, 2) }),
      jg('p3', 3, { fase: 'Pontos corridos', casa: 'y', visitante: 'z', status: 'cancelado' }),
      jg('f4', 4, { fase: 'Final', vaga_casa: g('geral', 1), vaga_visitante: g('geral', 2) }),
    ];
    const res = resolverVagas(jogos, r, { geral: ['x', 'y', 'z'] }, {});
    expect(upd(res, 'f4')).toEqual({ id: 'f4', casa: 'z', visitante: 'y' });
  });

  it('vaga já gravada e igual ao calculado não entra em atualizar', () => {
    const res = resolverVagas(
      copa({ s7: { casa: 'a1', visitante: 'b2' }, s8: { casa: 'b1', visitante: 'a2' } }), regGrupos(), timesCopa, {},
    );
    expect(res.atualizar).toEqual([]);
  });

  it('posição empatada à espera do sorteio: vaga indecisa e sem provável', () => {
    // Grupo A: todos 1x0 em ciclo → 3 pontos cada, mesmo saldo e pró; sem sorteio registrado.
    const jogos = copa({ g1: fin(1, 0), g2: fin(0, 1), g3: fin(1, 0) });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 's7')).toEqual({ id: 's7', casa: null, visitante: 'b2' });
    expect(res.provaveis.s7).toBeUndefined();
    // com o sorteio registrado, a vaga é preenchida
    const sorteado = resolverVagas(jogos, regGrupos(), timesCopa, { 'grupo:A': ['a3', 'a1', 'a2'] });
    expect(upd(sorteado, 's7')).toEqual({ id: 's7', casa: 'a3', visitante: 'b2' });
    expect(upd(sorteado, 's8')).toEqual({ id: 's8', casa: 'b1', visitante: 'a1' });
  });

  it("pontos corridos com final: vaga 'geral' usa a tabela única", () => {
    const r = regulamentoPadrao('gols', { tipo: 'pontos_corridos', ida_volta: false, final_entre: 2, mata: mata() });
    const pc = (id: string, ordem: number, c: string, v: string, x: Partial<JogoCalc>) =>
      jg(id, ordem, { fase: 'Pontos corridos', casa: c, visitante: v, ...x });
    const jogos = [
      pc('p1', 1, 'x', 'y', fin(0, 1)),
      pc('p2', 2, 'x', 'z', fin(0, 2)),
      pc('p3', 3, 'y', 'z', fin(0, 0)),
      jg('f4', 4, { fase: 'Final', vaga_casa: g('geral', 1), vaga_visitante: g('geral', 2) }),
    ];
    const res = resolverVagas(jogos, r, { geral: ['x', 'y', 'z'] }, {});
    expect(upd(res, 'f4')).toEqual({ id: 'f4', casa: 'z', visitante: 'y' });
  });
});

// ---- melhores extras ----

describe('resolverVagas: melhores extras', () => {
  // A (4 times): a1 9, a2 4 (saldo +4), a3 4 (saldo 0), a4 0 → a3 é o 3º com 4/9 = 0,444.
  // B (3 times): b2 3 (pró 3), b1 3 (pró 2), b3 3 → b3 é o 3º com 3/6 = 0,5.
  const jogosGrupos = (): JogoCalc[] => [
    grupoJ('a12', 1, 'A', 'a1', 'a2', fin(1, 0)),
    grupoJ('a13', 2, 'A', 'a1', 'a3', fin(1, 0)),
    grupoJ('a14', 3, 'A', 'a1', 'a4', fin(1, 0)),
    grupoJ('a23', 4, 'A', 'a2', 'a3', fin(0, 0)),
    grupoJ('a24', 5, 'A', 'a2', 'a4', fin(5, 0)),
    grupoJ('a34', 6, 'A', 'a3', 'a4', fin(1, 0)),
    grupoJ('b31', 7, 'B', 'b3', 'b1', fin(1, 0)),
    grupoJ('b12', 8, 'B', 'b1', 'b2', fin(2, 0)),
    grupoJ('b23', 9, 'B', 'b2', 'b3', fin(3, 0)),
  ];
  const times = { A: ['a1', 'a2', 'a3', 'a4'], B: ['b1', 'b2', 'b3'] };
  const quartas = (): JogoCalc[] => [
    jg('q10', 10, { fase: 'Quartas de final', vaga_casa: g('A', 1), vaga_visitante: { tipo: 'extra', posicao: 3, indice: 1 } }),
    jg('q11', 11, { fase: 'Quartas de final', vaga_casa: g('B', 1), vaga_visitante: { tipo: 'extra', posicao: 3, indice: 2 } }),
  ];

  it('grupos de tamanhos diferentes: o aproveitamento vem antes dos pontos', () => {
    const res = resolverVagas([...jogosGrupos(), ...quartas()], regGrupos(mata(), 2), times, {});
    expect(upd(res, 'q10')).toEqual({ id: 'q10', casa: 'a1', visitante: 'b3' }); // 0,5
    expect(upd(res, 'q11')).toEqual({ id: 'q11', casa: 'b2', visitante: 'a3' }); // 0,444, mesmo com mais pontos
  });

  it('extras só são decididos com todos os grupos completos', () => {
    const jogos = jogosGrupos().map((j) => (j.id === 'a34' ? { ...j, ...ag } : j));
    const res = resolverVagas([...jogos, ...quartas()], regGrupos(mata(), 2), times, {});
    expect(upd(res, 'q10')).toBeUndefined(); // 1º A ainda não decidido, extra também não
    expect(upd(res, 'q11')).toEqual({ id: 'q11', casa: 'b2', visitante: null });
    expect(res.provaveis.q11).toBeUndefined();
  });

  it('extras empatados em tudo esperam o sorteio extra:<posicao>', () => {
    // Dois grupos iguais: o 3º de cada perde 1x0 para os outros dois.
    const jogos = [
      grupoJ('ga1', 1, 'A', 'a1', 'a2', fin(1, 0)), grupoJ('ga2', 2, 'A', 'a1', 'a3', fin(1, 0)), grupoJ('ga3', 3, 'A', 'a2', 'a3', fin(1, 0)),
      grupoJ('gb1', 4, 'B', 'b1', 'b2', fin(1, 0)), grupoJ('gb2', 5, 'B', 'b1', 'b3', fin(1, 0)), grupoJ('gb3', 6, 'B', 'b2', 'b3', fin(1, 0)),
      jg('q7', 7, { fase: 'Quartas de final', vaga_casa: g('A', 1), vaga_visitante: { tipo: 'extra', posicao: 3, indice: 1 } }),
    ];
    const r = regGrupos(mata(), 1);
    const sem = resolverVagas(jogos, r, timesCopa, {});
    expect(upd(sem, 'q7')).toEqual({ id: 'q7', casa: 'a1', visitante: null });
    const com = resolverVagas(jogos, r, timesCopa, { 'extra:3': ['b3', 'a3'] });
    expect(upd(com, 'q7')).toEqual({ id: 'q7', casa: 'a1', visitante: 'b3' });
  });
});

// ---- confrontos ----

describe('decidirConfronto', () => {
  const ida = (pc: number, pv: number, x: Partial<JogoCalc> = {}) => jg('i', 1, { casa: 'A', visitante: 'B', ...fin(pc, pv), ...x });
  const volta = (pc: number, pv: number, x: Partial<JogoCalc> = {}) =>
    jg('v', 2, { casa: 'B', visitante: 'A', ...fin(pc, pv), jogo_volta_de: 'i', ...x });
  const A = { vencedor: 'A', perdedor: 'B' };
  const B = { vencedor: 'B', perdedor: 'A' };

  it('jogo único: placar, depois pênaltis; sem pênaltis fica indeciso', () => {
    const r = regMata('gols', mata());
    expect(decidirConfronto([ida(2, 1)], r)).toEqual(A);
    expect(decidirConfronto([ida(1, 1, { penaltis_casa: 3, penaltis_visitante: 4 })], r)).toEqual(B);
    expect(decidirConfronto([ida(1, 1)], r)).toBeNull();
    expect(decidirConfronto([ida(1, 1, { penaltis_casa: 4, penaltis_visitante: 4 })], r)).toBeNull();
  });

  it('não finalizado ou sem os dois times: null', () => {
    const r = regMata('gols', mata());
    expect(decidirConfronto([ida(2, 1, { status: 'em_andamento' })], r)).toBeNull();
    expect(decidirConfronto([ida(2, 1, { visitante: null })], r)).toBeNull();
    expect(decidirConfronto([ida(1, 0), volta(0, 0, { status: 'agendado' })], r)).toBeNull();
    expect(decidirConfronto([], r)).toBeNull();
  });

  it('W.O. em jogo único: vence quem compareceu', () => {
    const r = regMata('gols', mata());
    expect(decidirConfronto([ida(0, 0, { wo: 'casa', placar_casa: null, placar_visitante: null })], r)).toEqual(B);
  });

  it('ida e volta 1x0 e 0x1 (gol fora desligado) → pênaltis do jogo de volta', () => {
    const r = regMata('gols', mata({ ida_volta: true }, { gol_fora: false }));
    // volta: B (casa) 1x0 A → soma 1x1
    expect(decidirConfronto([ida(1, 0), volta(1, 0, { penaltis_casa: 4, penaltis_visitante: 3 })], r)).toEqual(B);
    expect(decidirConfronto([ida(1, 0), volta(1, 0, { penaltis_casa: 2, penaltis_visitante: 3 })], r)).toEqual(A);
    // a ordem do array não importa
    expect(decidirConfronto([volta(1, 0, { penaltis_casa: 4, penaltis_visitante: 3 }), ida(1, 0)], r)).toEqual(B);
    expect(decidirConfronto([ida(1, 0), volta(1, 0)], r)).toBeNull();
  });

  it('ida e volta 2x1 e 1x0 (gol fora ligado) → decide pelo gol fora', () => {
    const r = regMata('gols', mata({ ida_volta: true }, { gol_fora: true }));
    // soma A 2 × 2 B; gols fora: A 0 (na volta), B 1 (na ida)
    expect(decidirConfronto([ida(2, 1), volta(1, 0)], r)).toEqual(B);
    // sem gol fora, o mesmo resultado iria aos pênaltis (sem pênaltis → indeciso)
    expect(decidirConfronto([ida(2, 1), volta(1, 0)], regMata('gols', mata({ ida_volta: true })))).toBeNull();
  });

  it('ida e volta: a soma decide e considera a troca de mando', () => {
    const r = regMata('gols', mata({ ida_volta: true }));
    expect(decidirConfronto([ida(3, 0), volta(2, 0)], r)).toEqual(A); // A 3 × 2 B
    expect(decidirConfronto([ida(1, 0), volta(3, 1)], r)).toEqual(B); // A 2 × 3 B
  });

  it('W.O. num dos jogos da ida e volta decide para quem compareceu', () => {
    const r = regMata('gols', mata({ ida_volta: true }));
    // A venceu a ida por 2x0, mas não compareceu à volta (A é o visitante da volta)
    expect(decidirConfronto([ida(2, 0), volta(0, 0, { wo: 'visitante', placar_casa: 3, placar_visitante: 0 })], r)).toEqual(B);
  });

  it('sets ida e volta: 2 vitórias decidem; 1–1 vai ao set de ouro (penaltis_* da volta)', () => {
    const r = regMata('sets', mata({ ida_volta: true }));
    expect(decidirConfronto([ida(2, 0), volta(1, 2)], r)).toEqual(A);
    expect(decidirConfronto([ida(2, 0), volta(2, 1, { penaltis_casa: 15, penaltis_visitante: 13 })], r)).toEqual(B);
    expect(decidirConfronto([ida(2, 0), volta(2, 1, { penaltis_casa: 10, penaltis_visitante: 15 })], r)).toEqual(A);
    expect(decidirConfronto([ida(2, 0), volta(2, 1)], r)).toBeNull();
  });

  it('cestas: jogo único pelo placar; ida e volta pela soma; empate na soma fica indeciso', () => {
    const r = regMata('cestas', mata({ ida_volta: true }));
    expect(decidirConfronto([ida(80, 70), volta(75, 70)], r)).toEqual(A); // A 150 × 145 B
    expect(decidirConfronto([ida(80, 70), volta(80, 70)], r)).toBeNull();
    expect(decidirConfronto([ida(60, 61)], regMata('cestas', mata()))).toEqual(B);
  });

  it("final 'melhor_campanha': empate decidido pela campanha", () => {
    const r = regGrupos(mata({}, { final: 'melhor_campanha' }));
    const linha = (time_id: string, x: Partial<LinhaTabela>): LinhaTabela => ({
      time_id, posicao: 1, pontos: 0, jogos: 3, vitorias: 0, empates: 0, derrotas: 0, pro: 0, contra: 0, saldo: 0,
      sets_pro: 0, sets_contra: 0, pontos_sets_pro: 0, pontos_sets_contra: 0, aproveitamento: 0,
      aguardando_sorteio: false, ...x,
    });
    const tab: Record<string, LinhaTabela> = {
      A: linha('A', { aproveitamento: 0.5, vitorias: 1, saldo: 1 }),
      B: linha('B', { aproveitamento: 0.5, vitorias: 1, saldo: 3 }),
    };
    const campanha = (t: string) => tab[t];
    expect(decidirConfronto([ida(1, 1)], r, campanha)).toEqual(B); // mesmo aproveitamento e vitórias; saldo
    tab.A = linha('A', { aproveitamento: 0.9 });
    expect(decidirConfronto([ida(1, 1)], r, campanha)).toEqual(A);
    tab.A = linha('A', { aproveitamento: 0.5, vitorias: 1, saldo: 3 });
    expect(decidirConfronto([ida(1, 1)], r, campanha)).toBeNull(); // campanhas iguais
    expect(decidirConfronto([ida(1, 1)], r)).toBeNull(); // sem campanha
    // pênaltis lançados continuam valendo antes da campanha
    expect(decidirConfronto([ida(1, 1, { penaltis_casa: 5, penaltis_visitante: 4 })], r, campanha)).toEqual(A);
  });

  it("'melhor_campanha' em resolverVagas usa a campanha do campeonato inteiro", () => {
    const r = regGrupos(mata({}, { final: 'melhor_campanha' }));
    // s7: a1 (6 pts nos grupos) 1x1 b2 (3 pts) → a1 passa pela campanha
    const res = resolverVagas(
      copa({ s7: { casa: 'a1', visitante: 'b2', ...fin(1, 1) }, s8: { casa: 'b1', visitante: 'a2' } }),
      r, timesCopa, {},
    );
    expect(upd(res, 'f10')).toEqual({ id: 'f10', casa: 'a1', visitante: null });
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'b2', visitante: null });
  });
});

// ---- avanço no mata-mata ----

describe('resolverVagas: mata-mata', () => {
  const semis = (s7: Partial<JogoCalc>, s8: Partial<JogoCalc> = {}) => ({
    s7: { casa: 'a1', visitante: 'b2', ...s7 },
    s8: { casa: 'b1', visitante: 'a2', ...fin(0, 1), ...s8 },
  });

  it('semifinal finalizada preenche a final e o 3º lugar', () => {
    const res = resolverVagas(copa(semis(fin(2, 1))), regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toEqual({ id: 'f10', casa: 'a1', visitante: 'a2' });
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'b2', visitante: 'b1' });
  });

  it('ponto de atenção 2: semifinal volta a agendado → a vaga da final volta a null', () => {
    const jogos = copa({
      ...semis(ag),
      t9: { casa: 'b2', visitante: 'b1' },
      f10: { casa: 'a1', visitante: 'a2' },
    });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toEqual({ id: 'f10', casa: null, visitante: 'a2' });
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: null, visitante: 'b1' });
    expect(res.avisos).toEqual([]);
  });

  it('correção antes do jogo seguinte: o seguinte muda', () => {
    const jogos = copa({
      ...semis(fin(1, 2)), // corrigido: agora b2 venceu
      t9: { casa: 'b2', visitante: 'b1' },
      f10: { casa: 'a1', visitante: 'a2' },
    });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toEqual({ id: 'f10', casa: 'b2', visitante: 'a2' });
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'a1', visitante: 'b1' });
    expect(res.avisos).toEqual([]);
  });

  it('correção depois de o seguinte ter resultado: não muda e gera o aviso', () => {
    const jogos = copa({
      ...semis(fin(1, 2)),
      t9: { casa: 'b2', visitante: 'b1' },
      f10: { casa: 'a1', visitante: 'a2', ...fin(3, 0) },
    });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toBeUndefined();
    expect(res.avisos).toEqual(['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 10).']);
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'a1', visitante: 'b1' }); // o 3º lugar ainda não jogou
  });

  it('ida e volta: correção com a ida já jogada não troca a volta (o confronto muda junto ou não muda)', () => {
    const jogos = [
      jg('s7', 7, { casa: 'a', visitante: 'b', ...fin(1, 2) }), // corrigido: agora b venceu
      jg('s8', 8, { casa: 'c', visitante: 'd', ...fin(1, 0) }),
      jg('f10', 10, { casa: 'a', visitante: 'c', vaga_casa: venc(7), vaga_visitante: venc(8), ...fin(1, 0) }),
      jg('f11', 11, { casa: 'c', visitante: 'a', vaga_casa: venc(8), vaga_visitante: venc(7), jogo_volta_de: 'f10', ...ag }),
    ];
    const res = resolverVagas(jogos, regMata('gols', mata()), {}, {});
    expect(upd(res, 'f10')).toBeUndefined();
    expect(upd(res, 'f11')).toBeUndefined();
    expect(res.avisos).toEqual(['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 10).']);
  });

  it('jogo seguinte ao vivo: não troca os times e gera o aviso', () => {
    const jogos = copa({
      ...semis(fin(1, 2)),
      t9: { casa: 'b2', visitante: 'b1' },
      f10: { casa: 'a1', visitante: 'a2', status: 'ao_vivo', placar_casa: 1, placar_visitante: 0 },
    });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toBeUndefined();
    expect(res.avisos).toEqual(['Este ajuste mudaria o classificado de um jogo já disputado (Jogo 10).']);
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'a1', visitante: 'b1' });
  });

  it('vaga manual é preservada', () => {
    const jogos = copa({
      ...semis(fin(2, 1)),
      f10: { casa: 'x9', visitante: null, vaga_manual: true },
    });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(upd(res, 'f10')).toBeUndefined();
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'b2', visitante: 'b1' });
  });

  it('vaga semente nunca é mexida', () => {
    const r = regMata('gols', mata());
    const jogos = [jg('p1', 1, { casa: 't1', visitante: 'xx', vaga_casa: { tipo: 'semente', indice: 1 } })];
    expect(resolverVagas(jogos, r, {}, {}).atualizar).toEqual([]);
  });

  it('na mesma chamada: o resultado do grupo preenche a semifinal e a semifinal finalizada preenche a final', () => {
    // s7 já disputada (a1 2x1 b2); o grupo B acabou de ser completado (b1 e a2 vão para s8).
    const jogos = copa({ s7: { casa: 'a1', visitante: 'b2', ...fin(2, 1) } });
    const res = resolverVagas(jogos, regGrupos(), timesCopa, {});
    expect(res.atualizar.map((u) => u.id)).toEqual(['s8', 't9', 'f10']); // na ordem dos jogos
    expect(upd(res, 's8')).toEqual({ id: 's8', casa: 'b1', visitante: 'a2' });
    expect(upd(res, 'f10')).toEqual({ id: 'f10', casa: 'a1', visitante: null });
    expect(upd(res, 't9')).toEqual({ id: 't9', casa: 'b2', visitante: null });
  });

  it('mata-mata ida e volta: o vencedor sai da soma dos dois jogos e alimenta a final', () => {
    const r = regMata('gols', mata({ ida_volta: true, terceiro_lugar: false }));
    const jogos = [
      // A venceu a ida, mas B vira na volta: soma A 1 × 2 B
      jg('i1', 1, { fase: 'Semifinal', casa: 'A', visitante: 'B', ...fin(1, 0) }),
      jg('v2', 2, { fase: 'Semifinal', casa: 'B', visitante: 'A', ...fin(2, 0), jogo_volta_de: 'i1' }),
      // D venceu a ida, soma 1 × 1, C vence nos pênaltis da volta
      jg('i3', 3, { fase: 'Semifinal', casa: 'C', visitante: 'D', ...fin(0, 1) }),
      jg('v4', 4, { fase: 'Semifinal', casa: 'D', visitante: 'C', ...fin(0, 1), jogo_volta_de: 'i3', penaltis_casa: 4, penaltis_visitante: 5 }),
      jg('f5', 5, { fase: 'Final', vaga_casa: venc(1), vaga_visitante: venc(3) }),
    ];
    const res = resolverVagas(jogos, r, {}, {});
    expect(res.atualizar).toEqual([{ id: 'f5', casa: 'B', visitante: 'C' }]);
  });
});

// ---- rótulos ----

describe('rotuloDaVaga', () => {
  const mapa = new Map<number, { fase: string; volta?: boolean }>([
    [7, { fase: 'Semifinal' }],
    [8, { fase: 'Semifinal', volta: true }],
    [9, { fase: 'Semifinal' }],
    [10, { fase: 'Semifinal', volta: true }],
    [11, { fase: 'Final' }],
  ]);

  it('extra', () => {
    expect(rotuloDaVaga({ tipo: 'extra', posicao: 3, indice: 2 }, mapa)).toBe('2º melhor 3º colocado');
  });

  it('grupo, geral, vencedor e semente', () => {
    expect(rotuloDaVaga({ tipo: 'grupo', grupo: 'A', posicao: 1 }, mapa)).toBe('1º do Grupo A');
    expect(rotuloDaVaga({ tipo: 'grupo', grupo: 'geral', posicao: 2 }, mapa)).toBe('2º colocado');
    expect(rotuloDaVaga({ tipo: 'vencedor', jogo: 3 }, mapa)).toBe('Vencedor do Jogo 3');
    expect(rotuloDaVaga({ tipo: 'semente', indice: 4 }, mapa)).toBe('Cabeça de chave 4');
  });

  it('perdedor: numerado dentro da fase, sem contar os jogos de volta', () => {
    expect(rotuloDaVaga({ tipo: 'perdedor', jogo: 7 }, mapa)).toBe('Perdedor da Semifinal 1');
    expect(rotuloDaVaga({ tipo: 'perdedor', jogo: 9 }, mapa)).toBe('Perdedor da Semifinal 2');
    expect(rotuloDaVaga({ tipo: 'perdedor', jogo: 42 }, mapa)).toBe('Perdedor do Jogo 42');
  });
});
