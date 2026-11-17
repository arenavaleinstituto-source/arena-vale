import type {
  Criterio, DesempateMataMata, FormaDisputa, OpcoesMataMata, Pontuacao, Regulamento, TipoPlacar,
} from './tipos';

const TIPOS: TipoPlacar[] = ['gols', 'sets', 'cestas'];
const TODOS_CRITERIOS: Criterio[] = [
  'vitorias', 'saldo', 'pro', 'contra', 'confronto_direto', 'media_sets', 'media_pontos_sets', 'sorteio',
];

export function tipoPlacarDaModalidade(slug: string | null): TipoPlacar {
  if (slug === 'volei' || slug === 'volei-de-praia') return 'sets';
  if (slug === 'basquete') return 'cestas';
  return 'gols';
}

export function pontuacaoPadrao(t: TipoPlacar): Pontuacao {
  if (t === 'sets') return { tipo: 'sets', vitoria_direta: 3, vitoria_decisivo: 2, derrota_decisivo: 1, derrota: 0 };
  if (t === 'cestas') return { tipo: 'cestas', vitoria: 2, derrota: 1 };
  return { tipo: 'gols', vitoria: 3, empate: 1, derrota: 0 };
}

export function criteriosDisponiveis(t: TipoPlacar): Criterio[] {
  const base: Criterio[] = ['vitorias', 'saldo', 'pro', 'contra', 'confronto_direto'];
  if (t === 'sets') return [...base, 'media_sets', 'media_pontos_sets', 'sorteio'];
  return [...base, 'sorteio'];
}

function criteriosPadrao(t: TipoPlacar): Criterio[] {
  if (t === 'sets') return ['vitorias', 'media_sets', 'saldo', 'confronto_direto', 'sorteio'];
  return ['vitorias', 'saldo', 'pro', 'confronto_direto', 'sorteio'];
}

export function regulamentoPadrao(t: TipoPlacar, forma?: FormaDisputa): Regulamento {
  const f: FormaDisputa = forma ?? { tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null };
  const melhorDe = f.mata?.sets_melhor_de === 5 ? 5 : 3;
  const wo =
    t === 'sets' ? { vencedor: melhorDe === 5 ? 3 : 2, perdedor: 0 }
    : t === 'cestas' ? { vencedor: 20, perdedor: 0 }
    : { vencedor: 3, perdedor: 0 };
  return {
    versao: 1,
    formato_antigo: false,
    tipo_placar: t,
    forma: f,
    pontuacao: pontuacaoPadrao(t),
    criterios: criteriosPadrao(t),
    wo_placar: wo,
    regras_adicionais: '',
    suspensao: { amarelos: 3, jogos_por_vermelho: 1, zera_no_mata_mata: true },
    secoes: { artilharia: false, goleiro: false, destaques: false, goleiro_minimo_pct: 50 },
  };
}

// ---- leitura tolerante do JSON guardado ----

type Obj = Record<string, unknown>;
const ehObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const bool = (v: unknown): v is boolean => typeof v === 'boolean';

function lerMata(v: unknown): OpcoesMataMata | null {
  if (!ehObj(v)) return null;
  const d = v.desempate;
  if (
    !bool(v.ida_volta) || !bool(v.final_ida_volta) || !bool(v.terceiro_lugar) ||
    (v.chave !== 'sorteio' && v.chave !== 'manual') ||
    (v.sets_melhor_de !== 3 && v.sets_melhor_de !== 5) ||
    !ehObj(d) || !bool(d.prorrogacao) || !bool(d.gol_fora) ||
    (d.final !== 'penaltis' && d.final !== 'melhor_campanha')
  ) return null;
  const desempate: DesempateMataMata = { prorrogacao: d.prorrogacao, gol_fora: d.gol_fora, final: d.final };
  return {
    ida_volta: v.ida_volta, final_ida_volta: v.final_ida_volta, terceiro_lugar: v.terceiro_lugar,
    chave: v.chave, desempate, sets_melhor_de: v.sets_melhor_de,
  };
}

function lerForma(v: unknown): FormaDisputa | null {
  if (!ehObj(v)) return null;
  if (v.tipo === 'pontos_corridos') {
    if (!bool(v.ida_volta)) return null;
    if (v.final_entre !== null && !num(v.final_entre)) return null;
    const mata = v.mata === null ? null : lerMata(v.mata);
    if (v.mata !== null && !mata) return null;
    return { tipo: 'pontos_corridos', ida_volta: v.ida_volta, final_entre: v.final_entre as number | null, mata };
  }
  if (v.tipo === 'mata_mata') {
    const mata = lerMata(v.mata);
    return mata ? { tipo: 'mata_mata', mata } : null;
  }
  if (v.tipo === 'grupos_mata_mata') {
    const mata = lerMata(v.mata);
    if (
      !mata || !num(v.grupos) || !num(v.passam_por_grupo) || !num(v.melhores_extras) ||
      !bool(v.ida_volta_grupos) ||
      (v.montagem !== 'sorteio' && v.montagem !== 'sorteio_cabecas' && v.montagem !== 'manual')
    ) return null;
    return {
      tipo: 'grupos_mata_mata', grupos: v.grupos, passam_por_grupo: v.passam_por_grupo,
      melhores_extras: v.melhores_extras, montagem: v.montagem, ida_volta_grupos: v.ida_volta_grupos, mata,
    };
  }
  return null;
}

function lerPontuacao(v: unknown, t: TipoPlacar): Pontuacao | null {
  if (!ehObj(v) || v.tipo !== t) return null;
  if (t === 'gols') {
    return num(v.vitoria) && num(v.empate) && num(v.derrota)
      ? { tipo: 'gols', vitoria: v.vitoria, empate: v.empate, derrota: v.derrota } : null;
  }
  if (t === 'sets') {
    return num(v.vitoria_direta) && num(v.vitoria_decisivo) && num(v.derrota_decisivo) && num(v.derrota)
      ? {
          tipo: 'sets', vitoria_direta: v.vitoria_direta, vitoria_decisivo: v.vitoria_decisivo,
          derrota_decisivo: v.derrota_decisivo, derrota: v.derrota,
        } : null;
  }
  return num(v.vitoria) && num(v.derrota) ? { tipo: 'cestas', vitoria: v.vitoria, derrota: v.derrota } : null;
}

export function lerRegulamento(
  bruto: unknown,
  ctx: { formatoAntigo: string | null; modalidade: string | null },
): Regulamento {
  const tipoModalidade = tipoPlacarDaModalidade(ctx.modalidade);
  if (!ehObj(bruto)) {
    const antigo = !!ctx.formatoAntigo && ctx.formatoAntigo !== 'pontos_corridos';
    return { ...regulamentoPadrao(tipoModalidade), formato_antigo: antigo };
  }

  const tipo = TIPOS.includes(bruto.tipo_placar as TipoPlacar) ? (bruto.tipo_placar as TipoPlacar) : tipoModalidade;
  const forma = lerForma(bruto.forma) ?? undefined;
  const padrao = regulamentoPadrao(tipo, forma);

  const disponiveis = criteriosDisponiveis(tipo);
  const criteriosLidos = Array.isArray(bruto.criterios)
    ? bruto.criterios.filter((c): c is Criterio => TODOS_CRITERIOS.includes(c as Criterio) && disponiveis.includes(c as Criterio))
    : [];

  const wo = ehObj(bruto.wo_placar) && num(bruto.wo_placar.vencedor) && num(bruto.wo_placar.perdedor)
    ? { vencedor: bruto.wo_placar.vencedor, perdedor: bruto.wo_placar.perdedor } : padrao.wo_placar;

  const s = bruto.suspensao;
  const suspensao = ehObj(s) && num(s.amarelos) && num(s.jogos_por_vermelho) && bool(s.zera_no_mata_mata)
    ? { amarelos: s.amarelos, jogos_por_vermelho: s.jogos_por_vermelho, zera_no_mata_mata: s.zera_no_mata_mata }
    : padrao.suspensao;

  const c = bruto.secoes;
  const secoes = ehObj(c) && bool(c.artilharia) && bool(c.goleiro) && bool(c.destaques) && num(c.goleiro_minimo_pct)
    ? { artilharia: c.artilharia, goleiro: c.goleiro, destaques: c.destaques, goleiro_minimo_pct: c.goleiro_minimo_pct }
    : padrao.secoes;

  return {
    versao: 1,
    formato_antigo: bool(bruto.formato_antigo) ? bruto.formato_antigo : false,
    tipo_placar: tipo,
    forma: padrao.forma,
    pontuacao: lerPontuacao(bruto.pontuacao, tipo) ?? padrao.pontuacao,
    criterios: criteriosLidos.length > 0 ? criteriosLidos : padrao.criterios,
    wo_placar: wo,
    regras_adicionais: typeof bruto.regras_adicionais === 'string' ? bruto.regras_adicionais : padrao.regras_adicionais,
    suspensao,
    secoes,
  };
}

export function validarRegulamento(r: Regulamento): string | null {
  if (r.criterios.length === 0) return 'Escolha pelo menos um critério de desempate.';
  const i = r.criterios.indexOf('sorteio');
  if (i !== -1 && i !== r.criterios.length - 1) return 'O sorteio precisa ser o último critério.';
  if (r.forma.tipo === 'grupos_mata_mata' && r.forma.passam_por_grupo < 1) {
    return 'Cada grupo precisa classificar pelo menos 1 time.';
  }
  const disponiveis = criteriosDisponiveis(r.tipo_placar);
  const fora = r.criterios.find((c) => !disponiveis.includes(c));
  if (fora) return `O critério "${fora}" não vale para este tipo de placar.`;
  return null;
}
