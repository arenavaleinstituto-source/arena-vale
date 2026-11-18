import { gerarChave, cruzamentoOlimpico, type Entrada } from './chave';
import { gerarRodizio } from './rodizio';
import type { FormaDisputa, JogoCalc, JogoGerado, OpcoesMataMata } from './tipos';

/** Fisher-Yates; devolve uma cópia embaralhada, sem mexer na lista original. */
/** Sorteio repetível (mulberry32): a mesma semente gera a mesma sequência — a prévia e a geração saem iguais. */
export function aleatorioComSemente(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(lista: T[], aleatorio: () => number): T[] {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(aleatorio() * (i + 1)));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const letra = (i: number): string => String.fromCharCode(65 + (i % 26)).repeat(Math.floor(i / 26) + 1);

/**
 * Sorteia os grupos 'A', 'B', ... Uma cabeça de chave por grupo (as que sobrarem viram times
 * comuns); depois o restante, distribuído em sequência, então os tamanhos diferem em no máximo 1.
 */
export function sortearGrupos(
  times: string[],
  grupos: number,
  cabecas: string[],
  aleatorio: () => number,
): Record<string, string[]> {
  const noCampeonato = new Set(times);
  const unicas = [...new Set(cabecas)].filter((c) => noCampeonato.has(c));
  const cabs = embaralhar(unicas, aleatorio);
  const usadas = new Set(cabs.slice(0, grupos));
  const resto = embaralhar(times.filter((t) => !usadas.has(t)), aleatorio);
  const resultado: Record<string, string[]> = {};
  for (let i = 0; i < grupos; i++) resultado[letra(i)] = [];
  [...cabs.slice(0, grupos), ...resto].forEach((t, i) => resultado[letra(i % grupos)].push(t));
  return resultado;
}

/** Ordem de semeadura padrão (melhor × pior) para N potência de 2: 4 → [1,4,2,3]. */
function semeadura(n: number): number[] {
  let s = [1];
  while (s.length < n) {
    const total = s.length * 2;
    s = s.flatMap((x) => [x, total + 1 - x]);
  }
  return s;
}

const potenciaDe2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

type Resultado = { jogos: JogoGerado[] } | { erro: string };
type Opcoes = { grupos?: Record<string, string[]>; sementes?: string[]; aleatorio: () => number };

const mesmoConjunto = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const conjunto = new Set(b);
  return new Set(a).size === a.length && a.every((x) => conjunto.has(x));
};

export function gerarJogos(forma: FormaDisputa, times: string[], o: Opcoes): Resultado {
  if (times.length < 2) return { erro: 'São necessários pelo menos 2 times.' };
  if (new Set(times).size !== times.length) return { erro: 'Há times repetidos.' };

  if (forma.tipo === 'pontos_corridos') {
    const jogos: JogoGerado[] = gerarRodizio(times, forma.ida_volta).map((j, i) => ({
      ordem: i + 1, fase: 'Pontos corridos', rodada: j.rodada, grupo: null,
      casa: j.casa, visitante: j.visitante, vaga_casa: null, vaga_visitante: null, volta_de: null,
    }));
    const n = forma.final_entre;
    if (n !== null && n >= 2) {
      if (!forma.mata) return { erro: 'Escolha as opções do mata-mata da final.' };
      if (n > times.length) return { erro: 'A final não pode ter mais times do que o campeonato.' };
      const posicoes = potenciaDe2(n) ? semeadura(n) : Array.from({ length: n }, (_, i) => i + 1);
      const entradas: Entrada[] = posicoes.map((posicao) => ({ vaga: { tipo: 'grupo', grupo: 'geral', posicao } }));
      jogos.push(...gerarChave(entradas, forma.mata, jogos.length + 1));
    }
    return { jogos };
  }

  if (forma.tipo === 'mata_mata') {
    if (o.sementes && !mesmoConjunto(o.sementes, times)) return { erro: 'A chave não bate com os times inscritos.' };
    const entradas: Entrada[] = (o.sementes ?? embaralhar(times, o.aleatorio)).map((time) => ({ time }));
    return { jogos: gerarChave(entradas, forma.mata, 1) };
  }

  // grupos + mata-mata
  if (forma.grupos > times.length) return { erro: 'Há mais grupos do que times.' };
  let grupos: Record<string, string[]>;
  if (o.grupos) {
    if (!mesmoConjunto(Object.values(o.grupos).flat(), times)) return { erro: 'Os grupos não batem com os times inscritos.' };
    grupos = o.grupos;
  } else if (forma.montagem === 'manual') {
    return { erro: 'Monte os grupos antes de gerar.' };
  } else {
    grupos = sortearGrupos(times, forma.grupos, forma.montagem === 'sorteio_cabecas' ? (o.sementes ?? []) : [], o.aleatorio);
  }
  // Ordem canônica (letra e, dentro do grupo, ordem de inscrição): os mesmos grupos geram sempre os mesmos jogos,
  // venham do sorteio ou reconstruídos dos jogos já gravados.
  const posicao = new Map(times.map((t, i) => [t, i]));
  const letras = Object.keys(grupos).sort();
  grupos = Object.fromEntries(letras.map((l) => [l, [...grupos[l]].sort((a, b) => (posicao.get(a) ?? 0) - (posicao.get(b) ?? 0))]));
  if (Math.min(...letras.map((l) => grupos[l].length)) < forma.passam_por_grupo) {
    return { erro: 'Um grupo tem menos times do que as vagas para passar.' };
  }

  const doRodizio = letras.flatMap((l, g) =>
    gerarRodizio(grupos[l], forma.ida_volta_grupos).map((j, k) => ({ ...j, grupo: l, g, k })),
  );
  doRodizio.sort((a, b) => a.rodada - b.rodada || a.g - b.g || a.k - b.k);
  const jogos: JogoGerado[] = doRodizio.map((j, i) => ({
    ordem: i + 1, fase: 'Fase de grupos', rodada: j.rodada, grupo: j.grupo,
    casa: j.casa, visitante: j.visitante, vaga_casa: null, vaga_visitante: null, volta_de: null,
  }));
  const extras = forma.melhores_extras > 0
    ? { posicao: forma.passam_por_grupo + 1, quantos: forma.melhores_extras }
    : null;
  const entradas = cruzamentoOlimpico(letras, forma.passam_por_grupo, extras);
  jogos.push(...gerarChave(entradas, forma.mata, jogos.length + 1));
  return { jogos };
}

/**
 * Refaz a ordem do sorteio de um mata-mata a partir dos jogos já gravados (gerados com `mata`),
 * para gerar de novo sem mudar os confrontos. Devolve null se os jogos não batem com a chave.
 */
export function sementesDaChave(existentes: JogoCalc[], times: string[], mata: OpcoesMataMata): string[] | null {
  const marcador = (i: number) => `#${i}`;
  const modelo = gerarChave(times.map((_, i) => ({ time: marcador(i) })), mata, 1);
  const posicoes: (string | undefined)[] = new Array(times.length);
  for (const g of modelo) {
    if (g.volta_de !== null) continue;
    const ex = existentes.find((j) => j.ordem === g.ordem && !j.jogo_volta_de);
    for (const [m, time] of [[g.casa, ex?.casa], [g.visitante, ex?.visitante]] as const) {
      if (!m?.startsWith('#')) continue;
      const i = Number(m.slice(1));
      if (!time || (posicoes[i] && posicoes[i] !== time)) return null;
      posicoes[i] = time;
    }
  }
  const lista = posicoes.filter((t): t is string => Boolean(t));
  return lista.length === times.length && mesmoConjunto(lista, times) ? lista : null;
}
