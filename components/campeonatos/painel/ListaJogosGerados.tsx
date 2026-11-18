import { rotuloDaVaga } from '@/lib/campeonatos/vagas';
import type { JogoGerado } from '@/lib/campeonatos/tipos';

/** Lista dos jogos que serão criados (revisão antes de confirmar). */
export function ListaJogosGerados({ jogos, nomes }: { jogos: JogoGerado[]; nomes: Record<string, string> }) {
  const ordens = new Map(jogos.map((j) => [j.ordem, { fase: j.fase, volta: j.volta_de != null }]));
  const lado = (time: string | null, vaga: JogoGerado['vaga_casa']) => (time ? (nomes[time] ?? 'Time') : vaga ? rotuloDaVaga(vaga, ordens) : 'A definir');
  return (
    <ol className="grid max-h-96 gap-1 overflow-y-auto rounded-xl border border-av-linha p-2 text-sm">
      {jogos.map((j) => (
        <li key={j.ordem} className="flex flex-wrap gap-x-3 rounded-lg px-2 py-1 odd:bg-av-grafite-2">
          <span className="w-10 text-av-cinza">#{j.ordem}</span>
          <span className="w-40 font-rotulo text-xs font-bold uppercase tracking-wider text-av-cinza">
            {[j.fase, j.grupo ? `Grupo ${j.grupo}` : null, j.rodada ? `Rodada ${j.rodada}` : null, j.volta_de ? 'volta' : null].filter(Boolean).join(' · ')}
          </span>
          <span className="flex-1">{`${lado(j.casa, j.vaga_casa)} x ${lado(j.visitante, j.vaga_visitante)}`}</span>
        </li>
      ))}
    </ol>
  );
}
