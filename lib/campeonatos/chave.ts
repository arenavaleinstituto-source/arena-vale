import type { JogoGerado, OpcoesMataMata, Vaga } from './tipos';

export type Entrada = { time: string } | { vaga: Vaga };

const NOMES_DAS_FASES: Record<number, string> = {
  2: 'Final',
  4: 'Semifinal',
  8: 'Quartas de final',
  16: 'Oitavas de final',
  32: '16 avos de final',
  64: '32 avos de final',
};

export function nomeDaFase(timesNaFase: number): string {
  return NOMES_DAS_FASES[timesNaFase] ?? `Fase de ${timesNaFase}`;
}

const vagaGrupo = (grupo: string, posicao: number): Entrada => ({ vaga: { tipo: 'grupo', grupo, posicao } });

/**
 * Monta as entradas da chave a partir dos classificados dos grupos, já na ordem da chave
 * (entradas vizinhas se enfrentam: 0×1, 2×3, ...).
 * - Grupos pareados de dois em dois (A↔B, C↔D); com número ímpar de grupos, o parceiro é o
 *   grupo seguinte, em ciclo (A→B, B→C, C→A).
 * - A posição p de um grupo enfrenta a posição (passam+1−p) do parceiro.
 * - Confrontos liderados pelo 1º dos grupos de índice par ficam na 1ª metade da chave, os dos
 *   grupos de índice ímpar na 2ª; isso separa o 1º e o 2º do mesmo grupo.
 * - Extras: o i-ésimo melhor extra enfrenta o 1º do i-ésimo grupo; esses confrontos vêm primeiro.
 *   De qual grupo o extra vem só se sabe depois dos jogos, então não dá para evitar o próprio grupo.
 */
export function cruzamentoOlimpico(
  grupos: string[],
  passam: number,
  extras: { posicao: number; quantos: number } | null,
): Entrada[] {
  const nG = grupos.length;
  let olimpica: Entrada[];

  if (passam <= 1) {
    olimpica = passam === 1 ? grupos.map((gr) => vagaGrupo(gr, 1)) : [];
  } else {
    const parceiro = (i: number) => (nG % 2 === 0 ? i ^ 1 : (i + 1) % nG);
    type Confronto = { lider: number; p: number; entradas: Entrada[] };
    const confrontos: Confronto[] = [];
    const lideradas = Math.floor(passam / 2);
    for (let i = 0; i < nG; i++) {
      for (let p = 1; p <= lideradas; p++) {
        confrontos.push({ lider: i, p, entradas: [vagaGrupo(grupos[i], p), vagaGrupo(grupos[parceiro(i)], passam + 1 - p)] });
      }
    }
    // Posição do meio (passam ímpar): enfrenta a mesma posição de outro grupo, de dois em dois.
    const meios: Entrada[] = [];
    if (passam % 2 === 1) {
      const meio = (passam + 1) / 2;
      for (let i = 0; i + 1 < nG; i += 2) {
        confrontos.push({ lider: i, p: meio, entradas: [vagaGrupo(grupos[i], meio), vagaGrupo(grupos[i + 1], meio)] });
      }
      if (nG % 2 === 1) meios.push(vagaGrupo(grupos[nG - 1], meio));
    }
    const metade = (c: Confronto) => (c.lider + c.p - 1) % 2;
    const ordenar = (a: Confronto, b: Confronto) => a.p - b.p || a.lider - b.lider;
    const primeira = confrontos.filter((c) => metade(c) === 0).sort(ordenar);
    const segunda = confrontos.filter((c) => metade(c) === 1).sort(ordenar);
    olimpica = [...primeira, ...segunda].flatMap((c) => c.entradas).concat(meios);
  }

  if (!extras || extras.quantos <= 0) return olimpica;

  const inicio: Entrada[] = [];
  const usados = new Set<string>();
  const sobra: Entrada[] = [];
  for (let indice = 1; indice <= extras.quantos; indice++) {
    const extra: Entrada = { vaga: { tipo: 'extra', posicao: extras.posicao, indice } };
    const grupo = grupos[indice - 1];
    if (grupo !== undefined && passam >= 1) {
      inicio.push(vagaGrupo(grupo, 1), extra);
      usados.add(grupo);
    } else {
      sobra.push(extra);
    }
  }
  const resto = olimpica.filter(
    (e) => !('vaga' in e && e.vaga.tipo === 'grupo' && e.vaga.posicao === 1 && usados.has(e.vaga.grupo)),
  );
  return [...inicio, ...resto, ...sobra];
}

/**
 * Gera os jogos do mata-mata. Entradas vizinhas se enfrentam; se o número de entradas não é
 * potência de 2, as últimas 2×(n−P) disputam a 'Fase preliminar' (P = maior potência de 2 menor
 * que n) e as primeiras entram direto, intercaladas com os vencedores da preliminar.
 */
export function gerarChave(entradas: Entrada[], o: OpcoesMataMata, ordemInicial: number): JogoGerado[] {
  const n = entradas.length;
  if (n < 2) return [];

  const jogos: JogoGerado[] = [];
  let ordem = ordemInicial;

  const lado = (e: Entrada): { time: string | null; vaga: Vaga | null } =>
    'time' in e ? { time: e.time, vaga: null } : { time: null, vaga: e.vaga };

  const confronto = (fase: string, a: Entrada, b: Entrada, idaVolta: boolean): number => {
    const casa = lado(a);
    const fora = lado(b);
    const ida = ordem++;
    jogos.push({
      ordem: ida, fase, rodada: null, grupo: null,
      casa: casa.time, visitante: fora.time, vaga_casa: casa.vaga, vaga_visitante: fora.vaga, volta_de: null,
    });
    if (idaVolta) {
      jogos.push({
        ordem: ordem++, fase, rodada: null, grupo: null,
        casa: fora.time, visitante: casa.time, vaga_casa: fora.vaga, vaga_visitante: casa.vaga, volta_de: ida,
      });
    }
    return ida;
  };

  const vencedor = (jogo: number): Entrada => ({ vaga: { tipo: 'vencedor', jogo } });
  const perdedor = (jogo: number): Entrada => ({ vaga: { tipo: 'perdedor', jogo } });

  let P = 1;
  while (P * 2 <= n) P *= 2;

  let vagas: Entrada[];
  if (P === n) {
    vagas = [...entradas];
  } else {
    const k = n - P;
    const m = P - k;
    const diretos = entradas.slice(0, m);
    const vencedoresPre: Entrada[] = [];
    for (let j = 0; j < k; j++) {
      vencedoresPre.push(vencedor(confronto('Fase preliminar', entradas[m + 2 * j], entradas[m + 2 * j + 1], o.ida_volta)));
    }
    vagas = [];
    const comuns = Math.min(diretos.length, vencedoresPre.length);
    for (let i = 0; i < comuns; i++) vagas.push(diretos[i], vencedoresPre[i]);
    vagas.push(...diretos.slice(comuns), ...vencedoresPre.slice(comuns));
  }

  let semifinais: number[] = [];
  while (vagas.length > 2) {
    const fase = nomeDaFase(vagas.length);
    const idas: number[] = [];
    for (let i = 0; i < vagas.length; i += 2) idas.push(confronto(fase, vagas[i], vagas[i + 1], o.ida_volta));
    if (vagas.length === 4) semifinais = idas;
    vagas = idas.map(vencedor);
  }

  if (o.terceiro_lugar && semifinais.length === 2) {
    confronto('Disputa de 3º lugar', perdedor(semifinais[0]), perdedor(semifinais[1]), o.final_ida_volta);
  }
  confronto('Final', vagas[0], vagas[1], o.final_ida_volta);

  return jogos;
}
