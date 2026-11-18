import { classificar, compararCampanhas, type LinhaTabela } from './classificacao';
import type { DesempateMataMata, JogoCalc, Regulamento, Sorteios, Vaga } from './tipos';

type Decisao = { vencedor: string; perdedor: string };
type Campanha = (time: string) => LinhaTabela;

const DESEMPATE_PADRAO: DesempateMataMata = { prorrogacao: false, gol_fora: false, final: 'penaltis' };
const desempateDe = (r: Regulamento): DesempateMataMata => r.forma.mata?.desempate ?? DESEMPATE_PADRAO;

/** Maior contagem vence; igual → null. */
function porContagem(a: string, na: number, b: string, nb: number): Decisao | null {
  if (na > nb) return { vencedor: a, perdedor: b };
  if (nb > na) return { vencedor: b, perdedor: a };
  return null;
}

/** W.O.: `wo` guarda o lado que não compareceu; vence o outro. */
function porWo(j: JogoCalc): Decisao | null {
  if (!j.wo || !j.casa || !j.visitante) return null;
  return j.wo === 'casa' ? { vencedor: j.visitante, perdedor: j.casa } : { vencedor: j.casa, perdedor: j.visitante };
}

/** Pênaltis (ou set de ouro, no vôlei): só decidem se os dois estão lançados e são diferentes. */
function porPenaltis(j: JogoCalc): Decisao | null {
  if (j.penaltis_casa === null || j.penaltis_visitante === null || !j.casa || !j.visitante) return null;
  return porContagem(j.casa, j.penaltis_casa, j.visitante, j.penaltis_visitante);
}

function porCampanha(a: string, b: string, r: Regulamento, campanha: Campanha | undefined): Decisao | null {
  if (desempateDe(r).final !== 'melhor_campanha' || !campanha) return null;
  const la = campanha(a);
  const lb = campanha(b);
  if (!la || !lb) return null;
  const c = compararCampanhas(la, lb, r);
  if (c < 0) return { vencedor: a, perdedor: b };
  if (c > 0) return { vencedor: b, perdedor: a };
  return null;
}

function decidirJogoUnico(j: JogoCalc, r: Regulamento, campanha: Campanha | undefined): Decisao | null {
  const casa = j.casa as string;
  const vis = j.visitante as string;
  if (j.wo) return porWo(j);
  if (j.placar_casa === null || j.placar_visitante === null) return null;
  const pelo = porContagem(casa, j.placar_casa, vis, j.placar_visitante);
  if (pelo) return pelo;
  if (r.tipo_placar !== 'gols') return null; // sets e cestas não empatam em jogo único
  return porPenaltis(j) ?? porCampanha(casa, vis, r, campanha);
}

function decidirIdaVolta(ida: JogoCalc, volta: JogoCalc, r: Regulamento, campanha: Campanha | undefined): Decisao | null {
  const a = ida.casa as string;
  const b = ida.visitante as string;
  const mesmosTimes = (volta.casa === b && volta.visitante === a) || (volta.casa === a && volta.visitante === b);
  if (!mesmosTimes) return null;

  const wos = [porWo(ida), porWo(volta)].filter((d): d is Decisao => d !== null);
  if (wos.length > 0) return wos.every((d) => d.vencedor === wos[0].vencedor) ? wos[0] : null;

  const pernas = [ida, volta];
  if (pernas.some((j) => j.placar_casa === null || j.placar_visitante === null)) return null;
  const marcou = (j: JogoCalc, t: string) => (j.casa === t ? (j.placar_casa as number) : (j.placar_visitante as number));
  const sofreu = (j: JogoCalc, t: string) => (j.casa === t ? (j.placar_visitante as number) : (j.placar_casa as number));

  if (r.tipo_placar === 'sets') {
    if (pernas.some((j) => j.placar_casa === j.placar_visitante)) return null;
    const venceu = (t: string) => pernas.filter((j) => marcou(j, t) > sofreu(j, t)).length;
    return porContagem(a, venceu(a), b, venceu(b)) ?? porPenaltis(volta); // 1–1: set de ouro
  }

  const soma = (t: string) => pernas.reduce((s, j) => s + marcou(j, t), 0);
  const pelaSoma = porContagem(a, soma(a), b, soma(b));
  if (pelaSoma) return pelaSoma;
  if (r.tipo_placar === 'cestas') return null;

  if (desempateDe(r).gol_fora) {
    const fora = (t: string) => pernas.filter((j) => j.visitante === t).reduce((s, j) => s + marcou(j, t), 0);
    const peloGolFora = porContagem(a, fora(a), b, fora(b));
    if (peloGolFora) return peloGolFora;
  }
  return porPenaltis(volta) ?? porCampanha(a, b, r, campanha);
}

/**
 * Decide um confronto de mata-mata (1 jogo, ou ida e volta ligados por `jogo_volta_de`).
 * Devolve null enquanto algum jogo não está finalizado com os dois times, ou o empate não foi resolvido.
 */
export function decidirConfronto(jogos: JogoCalc[], r: Regulamento, campanha?: Campanha): Decisao | null {
  if (jogos.length === 0 || jogos.length > 2) return null;
  if (!jogos.every((j) => j.status === 'finalizado' && j.casa && j.visitante)) return null;
  if (jogos.length === 1) return decidirJogoUnico(jogos[0], r, campanha);
  const ida = jogos.find((j) => !j.jogo_volta_de);
  const volta = ida ? jogos.find((j) => j.jogo_volta_de === ida.id) : undefined;
  if (!ida || !volta) return null;
  return decidirIdaVolta(ida, volta, r, campanha);
}

// ---- vagas ----

export type ResultadoVagas = {
  atualizar: { id: string; casa: string | null; visitante: string | null }[];
  avisos: string[];
  provaveis: Record<string, { casa?: string; visitante?: string }>; // jogo id → time provável (grupo ainda incompleto)
};

type Alvo = { time: string | null; provavel?: string };
type Grupo = { completo: boolean; tabela: LinhaTabela[] };

/**
 * Recalcula as vagas de um campeonato. Percorre os jogos por `ordem` crescente, sobre uma cópia
 * com as mudanças já aplicadas, para que uma vaga resolvida alimente as seguintes na mesma passada.
 */
export function resolverVagas(
  jogos: JogoCalc[], r: Regulamento, timesPorGrupo: Record<string, string[]>, sorteios: Sorteios,
): ResultadoVagas {
  const res: ResultadoVagas = { atualizar: [], avisos: [], provaveis: {} };

  // grupos (e 'geral' nos pontos corridos com final)
  const grupos = new Map<string, Grupo>();
  const grupo = (g: string): Grupo => {
    let x = grupos.get(g);
    if (!x) {
      const doGrupo = jogos.filter((j) =>
        g === 'geral' ? j.fase === 'Pontos corridos' : j.fase === 'Fase de grupos' && j.grupo === g);
      const sorteio = sorteios[g === 'geral' ? 'geral' : `grupo:${g}`];
      x = {
        // jogo cancelado não conta na tabela e não segura o grupo
        completo: doGrupo.every((j) => j.status === 'finalizado' || j.status === 'cancelado'),
        tabela: classificar(timesPorGrupo[g] ?? [], doGrupo, r, sorteio),
      };
      grupos.set(g, x);
    }
    return x;
  };

  const alvoGrupo = (g: string, posicao: number): Alvo => {
    const { completo, tabela } = grupo(g);
    const linha = tabela[posicao - 1];
    if (!linha || linha.aguardando_sorteio) return { time: null };
    return completo ? { time: linha.time_id } : { time: null, provavel: linha.time_id };
  };

  // melhores extras: ranking dos `posicao`º colocados (null = posição que depende de sorteio não registrado)
  const extras = new Map<number, (string | null)[]>();
  const rankingExtras = (posicao: number): (string | null)[] => {
    const pronto = extras.get(posicao);
    if (pronto) return pronto;
    const calcular = (): (string | null)[] => {
      const letras = Object.keys(timesPorGrupo).filter((k) => k !== 'geral');
      if (letras.length === 0 || !letras.every((l) => grupo(l).completo)) return [];
      const candidatos: LinhaTabela[] = [];
      for (const l of letras) {
        const linha = grupo(l).tabela[posicao - 1];
        if (!linha) continue; // grupo menor, sem essa posição
        if (linha.aguardando_sorteio) return [];
        candidatos.push(linha);
      }
      candidatos.sort((x, y) => compararCampanhas(x, y, r));
      const sorteio = sorteios[`extra:${posicao}`];
      const ordem: (string | null)[] = [];
      for (let i = 0; i < candidatos.length;) {
        let k = i + 1;
        while (k < candidatos.length && compararCampanhas(candidatos[i], candidatos[k], r) === 0) k++;
        const bloco = candidatos.slice(i, k).map((l) => l.time_id);
        if (bloco.length === 1) ordem.push(bloco[0]);
        else if (sorteio && bloco.every((t) => sorteio.includes(t))) {
          ordem.push(...[...bloco].sort((x, y) => sorteio.indexOf(x) - sorteio.indexOf(y)));
        } else ordem.push(...bloco.map(() => null));
        i = k;
      }
      return ordem;
    };
    const ordem = calcular();
    extras.set(posicao, ordem);
    return ordem;
  };

  // campanha no campeonato inteiro, para 'melhor_campanha'
  let campanhas: Map<string, LinhaTabela> | null = null;
  const campanha: Campanha = (time) => {
    if (!campanhas) {
      const todos = new Set<string>(Object.values(timesPorGrupo).flat());
      for (const j of jogos) {
        if (j.casa) todos.add(j.casa);
        if (j.visitante) todos.add(j.visitante);
      }
      campanhas = new Map(classificar([...todos], jogos, r, undefined).map((l) => [l.time_id, l]));
    }
    return campanhas.get(time) as LinhaTabela;
  };

  // cópia de trabalho
  const trabalho = new Map(jogos.map((j) => [j.id, { ...j }]));
  const idPorOrdem = new Map<number, string>();
  const voltaDe = new Map<string, string>();
  for (const j of jogos) {
    if (j.ordem !== null && !j.jogo_volta_de) idPorOrdem.set(j.ordem, j.id);
    if (j.jogo_volta_de) voltaDe.set(j.jogo_volta_de, j.id);
  }

  const alvoConfronto = (ordem: number, quem: 'vencedor' | 'perdedor'): Alvo => {
    const idIda = idPorOrdem.get(ordem);
    const ida = idIda ? trabalho.get(idIda) : undefined;
    if (!ida) return { time: null };
    const idVolta = voltaDe.get(ida.id);
    const volta = idVolta ? trabalho.get(idVolta) : undefined;
    const d = decidirConfronto(volta ? [ida, volta] : [ida], r, campanha);
    return { time: d ? d[quem] : null };
  };

  const alvo = (v: Vaga | null, gravado: string | null): Alvo => {
    if (!v) return { time: gravado };
    switch (v.tipo) {
      case 'grupo': return alvoGrupo(v.grupo, v.posicao);
      case 'extra': return { time: rankingExtras(v.posicao)[v.indice - 1] ?? null };
      case 'vencedor': return alvoConfronto(v.jogo, 'vencedor');
      case 'perdedor': return alvoConfronto(v.jogo, 'perdedor');
      case 'semente': return { time: gravado };
    }
  };

  const ordenados = [...jogos].sort((a, b) => (a.ordem ?? Infinity) - (b.ordem ?? Infinity));
  for (const { id } of ordenados) {
    const atual = trabalho.get(id) as JogoCalc;
    if (atual.vaga_manual || (!atual.vaga_casa && !atual.vaga_visitante)) continue;
    const casa = alvo(atual.vaga_casa, atual.casa);
    const visitante = alvo(atual.vaga_visitante, atual.visitante);

    if (casa.time !== atual.casa || visitante.time !== atual.visitante) {
      // Ida e volta são um confronto só: se uma das partidas já está em disputa, nenhuma das duas troca de time.
      const parId = atual.jogo_volta_de ?? voltaDe.get(id);
      const par = parId ? trabalho.get(parId) : undefined;
      const disputado = [atual, par].find((j) => j && (j.status === 'finalizado' || j.status === 'ao_vivo'));
      if (disputado) {
        const aviso = `Este ajuste mudaria o classificado de um jogo já disputado (Jogo ${disputado.ordem ?? '?'}).`;
        if (!res.avisos.includes(aviso)) res.avisos.push(aviso);
      } else {
        atual.casa = casa.time;
        atual.visitante = visitante.time;
        res.atualizar.push({ id, casa: casa.time, visitante: visitante.time });
      }
    }

    // provável só faz sentido onde a vaga ficou vazia
    const prov: { casa?: string; visitante?: string } = {};
    if (casa.provavel && atual.casa === null) prov.casa = casa.provavel;
    if (visitante.provavel && atual.visitante === null) prov.visitante = visitante.provavel;
    if (prov.casa || prov.visitante) res.provaveis[id] = prov;
  }

  return res;
}

// ---- rótulos ----

export function rotuloDaVaga(v: Vaga, jogosPorOrdem: Map<number, { fase: string; volta?: boolean }>): string {
  switch (v.tipo) {
    case 'grupo': return v.grupo === 'geral' ? `${v.posicao}º colocado` : `${v.posicao}º do Grupo ${v.grupo}`;
    case 'extra': return `${v.indice}º melhor ${v.posicao}º colocado`;
    case 'vencedor': return `Vencedor do Jogo ${v.jogo}`;
    case 'semente': return `Cabeça de chave ${v.indice}`;
    case 'perdedor': {
      const origem = jogosPorOrdem.get(v.jogo);
      if (!origem) return `Perdedor do Jogo ${v.jogo}`;
      let k = 0;
      for (const [ordem, j] of jogosPorOrdem) {
        if (j.fase === origem.fase && !j.volta && ordem <= v.jogo) k++;
      }
      return `Perdedor da ${origem.fase} ${k}`;
    }
  }
}
