import { describe, expect, it } from 'vitest';
import { regulamentoEmTexto, slugCampeonato } from './texto';
import { regulamentoPadrao } from './regulamento';
import type { OpcoesMataMata, Regulamento } from './tipos';

const mata: OpcoesMataMata = {
  ida_volta: true, final_ida_volta: false, terceiro_lugar: true, chave: 'sorteio',
  desempate: { prorrogacao: true, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3,
};
const titulos = (r: Regulamento) => regulamentoEmTexto(r, 'Futsal').map((s) => s.titulo);
const secao = (r: Regulamento, t: string) => regulamentoEmTexto(r, 'Futsal').find((s) => s.titulo === t);

describe('slugCampeonato', () => {
  it('gera slug com ano', () => {
    expect(slugCampeonato('Copa X', 2026)).toBe('copa-x-2026');
    expect(slugCampeonato('Copa São José', 2026)).toBe('copa-sao-jose-2026');
  });
  it('não repete o ano', () => {
    expect(slugCampeonato('Taça 2026', 2026)).toBe('taca-2026');
    expect(slugCampeonato('2026', 2026)).toBe('2026');
  });
});

describe('regulamentoEmTexto', () => {
  it('critérios numerados', () => {
    const s = secao(regulamentoPadrao('gols'), 'Critérios de desempate');
    expect(s?.paragrafos[0]).toBe('1º mais vitórias; 2º melhor saldo de gols; 3º mais gols pró; 4º confronto direto; 5º sorteio.');
  });
  it('unidade por tipo de placar', () => {
    const r = regulamentoPadrao('cestas');
    expect(secao(r, 'Critérios de desempate')?.paragrafos[0]).toContain('melhor saldo de cestas');
    const sets = { ...regulamentoPadrao('sets'), criterios: ['contra', 'media_sets', 'media_pontos_sets'] as Regulamento['criterios'] };
    expect(secao(sets, 'Critérios de desempate')?.paragrafos[0])
      .toBe('1º menos sets sofridos; 2º melhor média de sets; 3º melhor média de pontos nos sets.');
  });
  it('pontos corridos sem mata-mata omite a seção', () => {
    expect(titulos(regulamentoPadrao('gols'))).toEqual(
      ['Forma de disputa', 'Pontuação', 'Critérios de desempate', 'W.O.']);
  });
  it('forma de disputa cita a modalidade', () => {
    expect(secao(regulamentoPadrao('gols'), 'Forma de disputa')?.paragrafos.join(' ')).toContain('Futsal');
  });
  it('pontos corridos com final tem mata-mata', () => {
    const r = regulamentoPadrao('gols', { tipo: 'pontos_corridos', ida_volta: true, final_entre: 4, mata });
    expect(titulos(r)).toContain('Mata-mata');
    expect(secao(r, 'Forma de disputa')?.paragrafos.join(' ')).toMatch(/4/);
  });
  it('mata-mata e grupos têm seção', () => {
    expect(titulos(regulamentoPadrao('gols', { tipo: 'mata_mata', mata }))).toContain('Mata-mata');
    const g = regulamentoPadrao('gols', {
      tipo: 'grupos_mata_mata', grupos: 4, passam_por_grupo: 2, melhores_extras: 2,
      montagem: 'sorteio', ida_volta_grupos: false, mata,
    });
    expect(titulos(g)).toContain('Mata-mata');
    const txt = secao(g, 'Forma de disputa')!.paragrafos.join(' ');
    expect(txt).toContain('4 grupos');
    expect(txt).toContain('2');
  });
  it('regras do mata-mata', () => {
    const r = regulamentoPadrao('gols', { tipo: 'mata_mata', mata });
    const txt = secao(r, 'Mata-mata')!.paragrafos.join(' ').toLowerCase();
    expect(txt).toContain('ida e volta');
    expect(txt).toContain('3º lugar');
    expect(txt).toContain('prorrogação');
    expect(txt).toContain('pênaltis');
  });
  it('sets: melhor de 5 e set de ouro', () => {
    const m5 = { ...mata, sets_melhor_de: 5 as const };
    const r = regulamentoPadrao('sets', { tipo: 'mata_mata', mata: m5 });
    const txt = secao(r, 'Mata-mata')!.paragrafos.join(' ');
    expect(txt).toContain('melhor de 5 sets');
    expect(txt).toContain('set de ouro');
  });
  it('gol fora e melhor campanha', () => {
    const m = { ...mata, desempate: { prorrogacao: false, gol_fora: true, final: 'melhor_campanha' as const } };
    const txt = secao(regulamentoPadrao('gols', { tipo: 'mata_mata', mata: m }), 'Mata-mata')!.paragrafos.join(' ').toLowerCase();
    expect(txt).toContain('gol fora');
    expect(txt).toContain('melhor campanha');
  });
  it('pontuação concorda no plural', () => {
    const txt = secao(regulamentoPadrao('gols'), 'Pontuação')!.paragrafos.join(' ');
    expect(txt).toContain('3 pontos');
    expect(txt).toContain('1 ponto');
    expect(txt).not.toContain('1 pontos');
    expect(txt).toContain('0 pontos');
  });
  it('pontuação de sets', () => {
    const txt = secao(regulamentoPadrao('sets'), 'Pontuação')!.paragrafos.join(' ');
    expect(txt).toContain('3 pontos');
    expect(txt).toContain('1 ponto');
  });
  it('W.O. mostra o placar', () => {
    expect(secao(regulamentoPadrao('gols'), 'W.O.')?.paragrafos.join(' ')).toContain('3 a 0');
  });
  it('regras adicionais só com texto, em parágrafos', () => {
    const r = { ...regulamentoPadrao('gols'), regras_adicionais: '  Regra A.\n\n\nRegra B.  ' };
    expect(secao(r, 'Regras adicionais')?.paragrafos).toEqual(['Regra A.', 'Regra B.']);
    expect(titulos({ ...r, regras_adicionais: '   ' })).not.toContain('Regras adicionais');
  });
});

describe('regulamento em texto com ida e volta por fase', () => {
  it('diz quais fases são em ida e volta', () => {
    const r = regulamentoPadrao('gols', { tipo: 'mata_mata', mata: { ...mata, ida_volta_fases: ['Semifinal', 'Final'] } });
    const texto = JSON.stringify(regulamentoEmTexto(r, 'Futsal'));
    expect(texto).toContain('Em ida e volta: Semifinal e Final. As demais fases são em jogo único.');
  });
  it('nenhuma fase marcada: tudo em jogo único', () => {
    const r = regulamentoPadrao('gols', { tipo: 'mata_mata', mata: { ...mata, ida_volta_fases: [] } });
    expect(JSON.stringify(regulamentoEmTexto(r, 'Futsal'))).toContain('Todas as fases são em jogo único.');
  });
});
