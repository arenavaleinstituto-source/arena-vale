import Link from 'next/link';
import type { ResumoCampeonato } from '@/lib/campeonatos/busca';
import { EscudoCampeonato } from './EscudoCampeonato';

/** Cartão da lista de campeonatos: escudo grande no topo, nome, modalidade · ano e a fase atual. */
export function CartaoCampeonato({ c, nomeModalidade }: { c: ResumoCampeonato; nomeModalidade?: string }) {
  const modalidade = nomeModalidade ?? c.modalidade ?? '';
  return (
    <Link
      href={`/campeonatos/${c.slug}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-av-linha bg-av-grafite-2 p-5 text-center transition hover:border-av-vermelho focus-visible:border-av-vermelho"
    >
      <EscudoCampeonato campeonato={c} tamanho={112} className="transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      <strong className="font-display text-xl font-extrabold uppercase leading-tight">{c.nome}</strong>
      <span className="font-rotulo text-sm font-bold uppercase tracking-wider text-av-cinza">
        {[modalidade, c.categoria, c.ano].filter(Boolean).join(' · ')}
      </span>
      {c.encerrado ? (
        <span className="rounded-full border border-av-linha px-3 py-1 font-rotulo text-xs font-bold uppercase tracking-wider text-av-cinza">Encerrado</span>
      ) : (
        c.fase_atual && (
          <span className="rounded-full bg-av-vermelho px-3 py-1 font-rotulo text-xs font-bold uppercase tracking-wider text-white">{c.fase_atual}</span>
        )
      )}
    </Link>
  );
}
