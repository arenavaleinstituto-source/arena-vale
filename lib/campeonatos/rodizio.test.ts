import { describe, expect, it } from "vitest";
import { gerarRodizio } from "./rodizio";

const nomes = (n: number) => Array.from({ length: n }, (_, i) => `T${i + 1}`);

for (let n = 3; n <= 20; n++) {
  for (const idaVolta of [false, true]) {
    describe(`gerarRodizio n=${n} idaVolta=${idaVolta}`, () => {
      const times = nomes(n);
      const jogos = gerarRodizio(times, idaVolta);
      const rodadasTurno = n % 2 === 0 ? n - 1 : n;
      const turno1 = jogos.filter((j) => j.rodada <= rodadasTurno);
      const turno2 = jogos.filter((j) => j.rodada > rodadasTurno);

      it("cada par aparece uma vez por turno", () => {
        const porTurno = idaVolta ? [turno1, turno2] : [turno1];
        expect(jogos.length).toBe((n * (n - 1) / 2) * porTurno.length);
        for (const t of porTurno) {
          expect(t.length).toBe((n * (n - 1)) / 2);
          const pares = new Set(t.map((j) => [j.casa, j.visitante].sort().join("|")));
          expect(pares.size).toBe(t.length);
        }
      });

      it("ninguem joga duas vezes na mesma rodada", () => {
        const vistos = new Set<string>();
        for (const j of jogos) {
          for (const t of [j.casa, j.visitante]) {
            const k = `${j.rodada}|${t}`;
            expect(vistos.has(k)).toBe(false);
            vistos.add(k);
          }
        }
      });

      it("numero de rodadas e folgas", () => {
        const max = Math.max(...jogos.map((j) => j.rodada));
        expect(Math.min(...jogos.map((j) => j.rodada))).toBe(1);
        expect(max).toBe(rodadasTurno * (idaVolta ? 2 : 1));
        if (n % 2 === 1) {
          for (const t of times) {
            const jogou = new Set(
              turno1.filter((j) => j.casa === t || j.visitante === t).map((j) => j.rodada),
            );
            expect(rodadasTurno - jogou.size).toBe(1);
          }
        }
      });

      it("ordenado por rodada", () => {
        for (let i = 1; i < jogos.length; i++) {
          expect(jogos[i].rodada).toBeGreaterThanOrEqual(jogos[i - 1].rodada);
        }
      });

      if (idaVolta) {
        it("returno inverte o mando", () => {
          for (const j of turno1) {
            expect(
              turno2.some(
                (k) =>
                  k.rodada === j.rodada + rodadasTurno &&
                  k.casa === j.visitante &&
                  k.visitante === j.casa,
              ),
            ).toBe(true);
          }
        });
      }

      it("mando equilibrado no turno", () => {
        for (const t of times) {
          const casa = turno1.filter((j) => j.casa === t).length;
          const fora = turno1.filter((j) => j.visitante === t).length;
          expect(Math.abs(casa - fora)).toBeLessThanOrEqual(1);
        }
      });
    });
  }
}
