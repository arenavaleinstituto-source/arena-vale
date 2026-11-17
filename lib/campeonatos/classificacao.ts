import type { Criterio, JogoCalc, Regulamento } from './tipos';

export type LinhaTabela = {
  time_id: string; posicao: number; pontos: number; jogos: number; vitorias: number; empates: number; derrotas: number;
  pro: number; contra: number; saldo: number; sets_pro: number; sets_contra: number; pontos_sets_pro: number; pontos_sets_contra: number;
  aproveitamento: number;            // pontos ÷ pontos possíveis (0..1)
  aguardando_sorteio: boolean;       // empate que só o sorteio decide e que ainda não foi registrado
};

type Lado = {
  pontos: number; vitoria: number; empate: number; derrota: number;
  pro: number; contra: number; sets_pro: number; sets_contra: number; pontos_sets_pro: number; pontos_sets_contra: number;
};

type Stats = Omit<LinhaTabela, 'time_id' | 'posicao' | 'aproveitamento' | 'aguardando_sorteio'>;

/** Bloco da ordem final: um time, ou vários empatados à espera do sorteio. */
type Bloco = { ids: string[]; aguardando: boolean };

// ---- um jogo ----

/** Resultado de um jogo para cada lado, ou null se o jogo não conta para a tabela. */
function resultadoDoJogo(j: JogoCalc, r: Regulamento): { casa: Lado; visitante: Lado } | null {
  if (j.status !== 'finalizado' || !j.casa || !j.visitante) return null;
  const p = r.pontuacao;
  const ehSets = r.tipo_placar === 'sets';

  if (j.wo) {
    const vitoria = p.tipo === 'sets' ? p.vitoria_direta : p.vitoria;
    const { vencedor: v, perdedor: d } = r.wo_placar;
    const presente: Lado = {
      pontos: vitoria, vitoria: 1, empate: 0, derrota: 0, pro: v, contra: d,
      sets_pro: ehSets ? v : 0, sets_contra: ehSets ? d : 0, pontos_sets_pro: 0, pontos_sets_contra: 0,
    };
    const ausente: Lado = {
      pontos: 0, vitoria: 0, empate: 0, derrota: 1, pro: d, contra: v,
      sets_pro: ehSets ? d : 0, sets_contra: ehSets ? v : 0, pontos_sets_pro: 0, pontos_sets_contra: 0,
    };
    return j.wo === 'casa' ? { casa: ausente, visitante: presente } : { casa: presente, visitante: ausente };
  }

  const pc = j.placar_casa;
  const pv = j.placar_visitante;
  if (pc === null || pv === null) return null; // finalizado sem placar: não há o que contar

  const psCasa = (j.parciais ?? []).reduce((s, x) => s + x.casa, 0);
  const psVis = (j.parciais ?? []).reduce((s, x) => s + x.visitante, 0);

  let ptsCasa: number;
  let ptsVis: number;
  if (pc === pv) {
    // Empate só existe nos gols; em sets ou cestas (não deveria acontecer) vale 0.
    ptsCasa = ptsVis = p.tipo === 'gols' ? p.empate : 0;
  } else {
    const casaVenceu = pc > pv;
    const venc = Math.max(pc, pv);
    const perd = Math.min(pc, pv);
    let ptsVenc: number;
    let ptsPerd: number;
    if (p.tipo === 'sets') {
      const decisivo = venc - perd === 1; // 2x1 ou 3x2: chegou ao set decisivo
      ptsVenc = decisivo ? p.vitoria_decisivo : p.vitoria_direta;
      ptsPerd = decisivo ? p.derrota_decisivo : p.derrota;
    } else {
      ptsVenc = p.vitoria;
      ptsPerd = p.derrota;
    }
    ptsCasa = casaVenceu ? ptsVenc : ptsPerd;
    ptsVis = casaVenceu ? ptsPerd : ptsVenc;
  }

  const empate = pc === pv ? 1 : 0;
  return {
    casa: {
      pontos: ptsCasa, vitoria: pc > pv ? 1 : 0, empate, derrota: pc < pv ? 1 : 0, pro: pc, contra: pv,
      sets_pro: ehSets ? pc : 0, sets_contra: ehSets ? pv : 0, pontos_sets_pro: psCasa, pontos_sets_contra: psVis,
    },
    visitante: {
      pontos: ptsVis, vitoria: pv > pc ? 1 : 0, empate, derrota: pv < pc ? 1 : 0, pro: pv, contra: pc,
      sets_pro: ehSets ? pv : 0, sets_contra: ehSets ? pc : 0, pontos_sets_pro: psVis, pontos_sets_contra: psCasa,
    },
  };
}

export function pontosDoJogo(j: JogoCalc, r: Regulamento): { casa: number; visitante: number } | null {
  const res = resultadoDoJogo(j, r);
  return res ? { casa: res.casa.pontos, visitante: res.visitante.pontos } : null;
}

// ---- estatísticas ----

function zerado(): Stats {
  return {
    pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, pro: 0, contra: 0, saldo: 0,
    sets_pro: 0, sets_contra: 0, pontos_sets_pro: 0, pontos_sets_contra: 0,
  };
}

function somar(s: Stats, l: Lado): void {
  s.pontos += l.pontos; s.jogos += 1;
  s.vitorias += l.vitoria; s.empates += l.empate; s.derrotas += l.derrota;
  s.pro += l.pro; s.contra += l.contra; s.saldo = s.pro - s.contra;
  s.sets_pro += l.sets_pro; s.sets_contra += l.sets_contra;
  s.pontos_sets_pro += l.pontos_sets_pro; s.pontos_sets_contra += l.pontos_sets_contra;
}

/** Estatísticas dos `times` contando só os jogos aceitos por `filtro`. */
function calcularStats(
  times: string[], jogos: JogoCalc[], r: Regulamento, filtro: (j: JogoCalc) => boolean = () => true,
): Map<string, Stats> {
  const m = new Map<string, Stats>();
  for (const t of times) m.set(t, zerado());
  for (const j of jogos) {
    if (!filtro(j)) continue;
    const res = resultadoDoJogo(j, r);
    if (!res) continue;
    const sc = m.get(j.casa as string);
    const sv = m.get(j.visitante as string);
    if (sc) somar(sc, res.casa);
    if (sv) somar(sv, res.visitante);
  }
  return m;
}

const media = (a: number, b: number) => (b > 0 ? a / b : a > 0 ? Infinity : 0);

/** Valor de um critério numérico, orientado para "maior é melhor". */
function valor(c: Criterio, s: Stats): number {
  switch (c) {
    case 'vitorias': return s.vitorias;
    case 'saldo': return s.saldo;
    case 'pro': return s.pro;
    case 'contra': return -s.contra;
    case 'media_sets': return media(s.sets_pro, s.sets_contra);
    case 'media_pontos_sets': return media(s.pontos_sets_pro, s.pontos_sets_contra);
    default: return 0;
  }
}

function compararChaves(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return -1;
    if (a[i] < b[i]) return 1;
  }
  return 0;
}

/** Ordena `grupo` pela chave (maior primeiro, estável) e o divide em subgrupos de chave igual. */
function particionar(grupo: string[], chave: (id: string) => number[]): string[][] {
  const comChave = grupo.map((id) => ({ id, k: chave(id) }));
  comChave.sort((a, b) => compararChaves(a.k, b.k));
  const partes: string[][] = [];
  let ultima: number[] | null = null;
  for (const { id, k } of comChave) {
    if (ultima && compararChaves(ultima, k) === 0) partes[partes.length - 1].push(id);
    else partes.push([id]);
    ultima = k;
  }
  return partes;
}

// ---- desempate ----

type Ctx = { stats: Map<string, Stats>; jogos: JogoCalc[]; r: Regulamento; sorteio: string[] | undefined };

function confrontoDireto(grupo: string[], ctx: Ctx): string[][] {
  const membros = new Set(grupo);
  const mini = calcularStats(
    grupo, ctx.jogos, ctx.r,
    (j) => !!j.casa && !!j.visitante && membros.has(j.casa) && membros.has(j.visitante),
  );
  const criterios = ctx.r.criterios.filter((c) => c !== 'confronto_direto' && c !== 'sorteio');
  return particionar(grupo, (id) => {
    const s = mini.get(id) as Stats;
    return [s.pontos, ...criterios.map((c) => valor(c, s))];
  });
}

function porSorteio(grupo: string[], sorteio: string[] | undefined): Bloco[] {
  if (sorteio && grupo.every((id) => sorteio.includes(id))) {
    return [...grupo].sort((a, b) => sorteio.indexOf(a) - sorteio.indexOf(b)).map((id) => ({ ids: [id], aguardando: false }));
  }
  return [{ ids: grupo, aguardando: true }];
}

/** Desempata um grupo com os mesmos pontos, reaplicando a lista inteira aos subgrupos ainda empatados. */
function desempatar(grupo: string[], ctx: Ctx): Bloco[] {
  if (grupo.length === 1) return [{ ids: grupo, aguardando: false }];
  for (const c of ctx.r.criterios) {
    if (c === 'sorteio') return porSorteio(grupo, ctx.sorteio);
    const partes = c === 'confronto_direto'
      ? confrontoDireto(grupo, ctx)
      : particionar(grupo, (id) => [valor(c, ctx.stats.get(id) as Stats)]);
    if (partes.length === 1) continue; // não separou ninguém: próximo critério
    return partes.flatMap((p) => desempatar(p, ctx));
  }
  // Critérios esgotados sem sorteio: fica a ordem de entrada.
  return grupo.map((id) => ({ ids: [id], aguardando: false }));
}

// ---- tabela ----

export function classificar(
  times: string[], jogos: JogoCalc[], r: Regulamento, sorteio: string[] | undefined,
): LinhaTabela[] {
  const stats = calcularStats(times, jogos, r);
  const ctx: Ctx = { stats, jogos, r, sorteio };
  const p = r.pontuacao;
  const maxPorJogo = p.tipo === 'sets' ? p.vitoria_direta : p.vitoria;

  const blocos = particionar(times, (id) => [(stats.get(id) as Stats).pontos]).flatMap((g) => desempatar(g, ctx));

  const linhas: LinhaTabela[] = [];
  for (const b of blocos) {
    const posicao = linhas.length + 1;
    b.ids.forEach((id, i) => {
      const s = stats.get(id) as Stats;
      const possiveis = s.jogos * maxPorJogo;
      linhas.push({
        time_id: id,
        posicao: b.aguardando ? posicao : posicao + i,
        ...s,
        aproveitamento: possiveis > 0 ? s.pontos / possiveis : 0,
        aguardando_sorteio: b.aguardando,
      });
    });
  }
  return linhas;
}
