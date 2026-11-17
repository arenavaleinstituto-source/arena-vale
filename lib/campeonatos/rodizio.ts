export type JogoRodizio = { rodada: number; casa: string; visitante: string };

/**
 * Rodízio pelo método do círculo. Com número ímpar de times entra um "folga"
 * (null) e os jogos contra ele são descartados. Rodadas numeradas a partir de 1.
 */
export function gerarRodizio(times: string[], idaVolta: boolean): JogoRodizio[] {
  const lista: (string | null)[] = [...times];
  if (lista.length % 2 === 1) lista.unshift(null); // folga fixo: os reais giram
  const n = lista.length;
  const rodadasTurno = n - 1;
  const turno: JogoRodizio[] = [];

  const fixo = lista[0];
  let giro = lista.slice(1);
  for (let r = 0; r < rodadasTurno; r++) {
    const linha = [fixo, ...giro];
    for (let i = 0; i < n / 2; i++) {
      const a = linha[i];
      const b = linha[n - 1 - i];
      if (a === null || b === null) continue;
      // fixo alterna por rodada; demais alternam pela posição do par (o time muda de posição a cada rodada)
      const inverter = i === 0 ? r % 2 === 1 : i % 2 === 1;
      turno.push({
        rodada: r + 1,
        casa: inverter ? b : a,
        visitante: inverter ? a : b,
      });
    }
    giro = [giro[giro.length - 1], ...giro.slice(0, -1)];
  }

  if (!idaVolta) return turno;
  const returno = turno.map((j) => ({
    rodada: j.rodada + rodadasTurno,
    casa: j.visitante,
    visitante: j.casa,
  }));
  return [...turno, ...returno];
}
