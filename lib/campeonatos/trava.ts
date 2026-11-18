import type { JogoCalc, JogoGerado } from './tipos';

type Plano = { apagar: string[]; inserir: JogoGerado[]; avisos: string[] } | { erro: string };

const iniciado = (j: JogoCalc): boolean => j.status === 'finalizado' || j.status === 'ao_vivo';
const nomeFase = (j: { fase: string | null }): string => j.fase ?? '';

// Serialização com chaves ordenadas, para comparar vagas por valor.
const estavel = (v: unknown): string =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)))
      : x);

export function fasesComResultado(jogos: JogoCalc[]): Set<string> {
  return new Set(jogos.filter(iniciado).map(nomeFase));
}

function mesmaEstrutura(existentes: JogoCalc[], novos: JogoGerado[]): boolean {
  if (existentes.length !== novos.length) return false;
  const porOrdem = new Map(existentes.map((j) => [j.ordem, j]));
  return novos.every((n) => {
    const e = porOrdem.get(n.ordem);
    if (!e) return false;
    if (nomeFase(e) !== n.fase || e.grupo !== n.grupo) return false;
    if (estavel(e.vaga_casa) !== estavel(n.vaga_casa) || estavel(e.vaga_visitante) !== estavel(n.vaga_visitante)) return false;
    // times só contam onde o jogo novo tem time fixo (a vaga resolvida preenche casa/visitante sozinha)
    if (n.vaga_casa === null && e.casa !== n.casa) return false;
    if (n.vaga_visitante === null && e.visitante !== n.visitante) return false;
    return true;
  });
}

export function planoDeRegeracao(
  existentes: JogoCalc[],
  novos: JogoGerado[],
  o: { formaMudou: boolean; destravadas: string[] },
): Plano {
  const porOrdem = (a: JogoGerado, b: JogoGerado) => a.ordem - b.ordem;
  const comResultado = fasesComResultado(existentes);

  if (comResultado.size === 0) {
    return { apagar: existentes.map((j) => j.id), inserir: [...novos].sort(porOrdem), avisos: [] };
  }

  const destravadas = new Set(o.destravadas);
  if (o.formaMudou && [...comResultado].some((f) => !destravadas.has(f))) {
    return { erro: 'A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.' };
  }

  // Fases iniciadas e não destravadas: a estrutura precisa continuar igual; elas ficam intactas.
  const travadas = [...comResultado]
    .filter((f) => !destravadas.has(f))
    .map((f) => {
      const jogos = existentes.filter((j) => nomeFase(j) === f);
      return { fase: f, jogos, menor: Math.min(...jogos.map((j) => j.ordem ?? Infinity)) };
    })
    .sort((a, b) => a.menor - b.menor);
  for (const t of travadas) {
    if (!mesmaEstrutura(t.jogos, novos.filter((n) => n.fase === t.fase))) {
      return { erro: `A fase ${t.fase} já começou. Peça à ARENA VALE para destravar.` };
    }
  }
  const fasesTravadas = new Set(travadas.map((t) => t.fase));

  const mantido = (j: JogoCalc) => iniciado(j) || fasesTravadas.has(nomeFase(j));
  const mantidos = existentes.filter(mantido);
  const ordensMantidas = new Set(mantidos.flatMap((j) => (j.ordem === null ? [] : [j.ordem])));
  const avisar = new Set<number>();

  // Jogos iniciados de fases que deixaram de existir nos novos (ex.: 3º lugar desligado).
  const fasesNovas = new Set(novos.map((n) => n.fase));
  for (const j of mantidos) {
    if (iniciado(j) && j.ordem !== null && !fasesNovas.has(nomeFase(j))) avisar.add(j.ordem);
  }

  const inserir: JogoGerado[] = [];
  for (const n of [...novos].sort(porOrdem)) {
    if (fasesTravadas.has(n.fase)) continue; // já existe, igual
    if (ordensMantidas.has(n.ordem)) avisar.add(n.ordem);
    else inserir.push(n);
  }

  return {
    apagar: existentes.filter((j) => !mantido(j)).map((j) => j.id),
    inserir,
    avisos: [...avisar].sort((a, b) => a - b).map((n) => `O Jogo ${n} já foi disputado e foi mantido.`),
  };
}
