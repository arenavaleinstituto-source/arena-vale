import Link from 'next/link';
import type { TimeDaPagina } from '@/lib/campeonatos/busca';
import { EscudoTime } from './EscudoTime';

export type JogoDaLista = {
  id: string;
  casa: TimeDaPagina | null;
  visitante: TimeDaPagina | null;
  rotuloCasa: string;
  rotuloVisitante: string;
  quando: string;
  local: string | null;
  placar: string | null;
  detalhe: string | null; // "Grupo A", a fase em texto nos campeonatos antigos, "W.O."
  status: string;
};
export type BlocoDeJogos = { titulo: string; jogos: JogoDaLista[] };

function Time({ t, rotulo, alinhar }: { t: TimeDaPagina | null; rotulo: string; alinhar: 'esq' | 'dir' }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${alinhar === 'dir' ? 'flex-row-reverse text-right' : ''}`}>
      {t && <EscudoTime time={t} tamanho={24} />}
      <span className={`truncate ${t ? 'font-bold' : 'text-av-cinza'}`}>{t?.nome ?? rotulo}</span>
    </span>
  );
}

/** Jogos do campeonato por rodada ou fase; cada jogo leva à súmula. */
export function ListaJogos({ blocos }: { blocos: BlocoDeJogos[] }) {
  if (!blocos.length) return <p className="vazio">Os jogos aparecem aqui assim que forem gerados.</p>;
  return (
    <div className="grid gap-6">
      {blocos.map((b) => (
        <section key={b.titulo} className="grid gap-2">
          <h3 className="font-display text-xl font-extrabold uppercase">{b.titulo}</h3>
          <ul className="grid gap-2">
            {b.jogos.map((j) => (
              <li key={j.id}>
                <Link href={`/sumula/${j.id}`} className="grid gap-1 rounded-xl border border-av-linha bg-av-grafite-2 p-3 text-sm hover:border-av-vermelho">
                  <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <Time t={j.casa} rotulo={j.rotuloCasa} alinhar="esq" />
                    <span className={`font-display text-lg font-extrabold tabular-nums ${j.status === 'ao_vivo' ? 'text-av-vermelho' : ''}`}>{j.placar ?? 'x'}</span>
                    <Time t={j.visitante} rotulo={j.rotuloVisitante} alinhar="dir" />
                  </span>
                  <span className="font-rotulo text-xs font-bold uppercase tracking-wider text-av-cinza">
                    {[j.quando, j.local, j.detalhe, j.status === 'ao_vivo' ? 'Ao vivo' : null].filter(Boolean).join(' · ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
