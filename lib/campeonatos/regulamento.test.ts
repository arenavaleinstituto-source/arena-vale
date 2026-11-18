import { describe, expect, it } from 'vitest';
import {
  criteriosDisponiveis,
  lerRegulamento,
  pontuacaoPadrao,
  regulamentoPadrao,
  tipoPlacarDaModalidade,
  validarRegulamento,
} from './regulamento';

const ctx = { formatoAntigo: 'pontos_corridos', modalidade: 'futsal' };

describe('tipoPlacarDaModalidade', () => {
  it('mapeia modalidades para o tipo de placar', () => {
    expect(tipoPlacarDaModalidade('volei-de-praia')).toBe('sets');
    expect(tipoPlacarDaModalidade('volei')).toBe('sets');
    expect(tipoPlacarDaModalidade('basquete')).toBe('cestas');
    expect(tipoPlacarDaModalidade('handebol')).toBe('gols');
    expect(tipoPlacarDaModalidade(null)).toBe('gols');
  });
});

describe('regulamentoPadrao', () => {
  it('usa os padrões de gols', () => {
    const r = regulamentoPadrao('gols');
    expect(r.criterios).toEqual(['vitorias', 'saldo', 'pro', 'confronto_direto', 'sorteio']);
    expect(r.pontuacao).toEqual({ tipo: 'gols', vitoria: 3, empate: 1, derrota: 0 });
    expect(r.wo_placar).toEqual({ vencedor: 3, perdedor: 0 });
    expect(r.forma).toEqual({ tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null });
  });

  it('usa os padrões de cestas e sets', () => {
    expect(regulamentoPadrao('cestas').wo_placar).toEqual({ vencedor: 20, perdedor: 0 });
    const s = regulamentoPadrao('sets');
    expect(s.criterios).toEqual(['vitorias', 'media_sets', 'saldo', 'confronto_direto', 'sorteio']);
    expect(s.wo_placar).toEqual({ vencedor: 2, perdedor: 0 });
    expect(pontuacaoPadrao('sets')).toEqual({
      tipo: 'sets', vitoria_direta: 3, vitoria_decisivo: 2, derrota_decisivo: 1, derrota: 0,
    });
    expect(pontuacaoPadrao('cestas')).toEqual({ tipo: 'cestas', vitoria: 2, derrota: 1 });
  });

  it('W.O. de sets vale 3x0 na melhor de 5', () => {
    const mata = {
      ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio' as const,
      desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' as const }, sets_melhor_de: 5 as const,
    };
    const r = regulamentoPadrao('sets', { tipo: 'mata_mata', mata });
    expect(r.wo_placar).toEqual({ vencedor: 3, perdedor: 0 });
  });

  it('tem suspensão e seções padrão', () => {
    const r = regulamentoPadrao('gols');
    expect(r.suspensao).toEqual({ amarelos: 3, jogos_por_vermelho: 1, zera_no_mata_mata: true });
    expect(r.secoes).toEqual({ artilharia: false, goleiro: false, destaques: false, goleiro_minimo_pct: 50 });
    expect(r.versao).toBe(1);
    expect(r.formato_antigo).toBe(false);
  });
});

describe('criteriosDisponiveis', () => {
  it('segue a tabela da spec', () => {
    expect(criteriosDisponiveis('gols')).not.toContain('media_sets');
    expect(criteriosDisponiveis('sets')).toContain('media_sets');
    expect(criteriosDisponiveis('sets')).toContain('media_pontos_sets');
    expect(criteriosDisponiveis('cestas')).not.toContain('media_pontos_sets');
    expect(criteriosDisponiveis('cestas')).toContain('sorteio');
  });
});

describe('lerRegulamento', () => {
  it('null com formato antigo marca formato_antigo', () => {
    expect(lerRegulamento(null, { formatoAntigo: 'mata_mata', modalidade: 'futsal' }).formato_antigo).toBe(true);
    expect(lerRegulamento(null, ctx).formato_antigo).toBe(false);
    expect(lerRegulamento(null, { formatoAntigo: null, modalidade: 'futsal' }).formato_antigo).toBe(false);
  });

  it('critérios inventados voltam ao padrão', () => {
    const r = lerRegulamento({ versao: 1, criterios: ['inventado'] }, ctx);
    expect(r.criterios).toEqual(regulamentoPadrao('gols').criterios);
  });

  it('mescla campo a campo e usa o tipo guardado', () => {
    const r = lerRegulamento({ tipo_placar: 'cestas', regras_adicionais: 'Levar camisa', secoes: 'x' }, ctx);
    expect(r.tipo_placar).toBe('cestas');
    expect(r.pontuacao).toEqual({ tipo: 'cestas', vitoria: 2, derrota: 1 });
    expect(r.regras_adicionais).toBe('Levar camisa');
    expect(r.secoes.goleiro_minimo_pct).toBe(50);
  });

  it('não-objeto devolve o padrão da modalidade', () => {
    expect(lerRegulamento('lixo', { formatoAntigo: null, modalidade: 'basquete' }).tipo_placar).toBe('cestas');
  });
});

describe('validarRegulamento', () => {
  it('valida critérios', () => {
    const base = regulamentoPadrao('gols');
    expect(validarRegulamento(base)).toBeNull();
    expect(validarRegulamento({ ...base, criterios: [] })).toBe('Escolha pelo menos um critério de desempate.');
    expect(validarRegulamento({ ...base, criterios: ['sorteio', 'saldo'] })).toBe('O sorteio precisa ser o último critério.');
    expect(validarRegulamento({ ...base, criterios: ['media_sets'] })).toBeTruthy();
  });

  it('exige ao menos 1 classificado por grupo', () => {
    const base = regulamentoPadrao('gols');
    const mata = regulamentoPadrao('gols', {
      tipo: 'mata_mata',
      mata: { ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio',
        desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3 },
    }).forma;
    expect(mata.tipo).toBe('mata_mata');
    if (mata.tipo !== 'mata_mata') return;
    const r = { ...base, forma: { tipo: 'grupos_mata_mata' as const, grupos: 2, passam_por_grupo: 0, melhores_extras: 0,
      montagem: 'sorteio' as const, ida_volta_grupos: false, mata: mata.mata } };
    expect(validarRegulamento(r)).toBe('Cada grupo precisa classificar pelo menos 1 time.');
  });
});
