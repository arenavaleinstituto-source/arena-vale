import Link from 'next/link';
import type { ItemAgenda } from '@/lib/midia/agenda';
import { formatarQuando } from '@/lib/midia/datas';

/** Cartões de jogos da agenda (spec Fase 3, seção 5, bloco 5). */
export function ListaAgenda({ itens }: { itens: ItemAgenda[] }) {
  if (itens.length === 0) return <p className="vazio">Nenhum jogo agendado — volte em breve.</p>;
  return (
    <div className="agenda">
      {itens.map((j) => (
        <article className="jogo" key={`${j.origem}-${j.id}`}>
          <div className="topo-j">
            <span className="mod">{j.modalidade ?? 'ARENA VALE'}</span>
            <span>{j.fase ?? ''}</span>
          </div>
          <div className="times">
            {j.casa}
            <small>VS</small>
            {j.fora}
          </div>
          <div className="quando">
            <span>{formatarQuando(j.dataHora)}</span>
            {j.transmissao && <span className="tx">● Transmissão</span>}
          </div>
          {j.local && <span className="d">{j.local}</span>}
        </article>
      ))}
    </div>
  );
}

export function AgendaArena({ itens }: { itens: ItemAgenda[] }) {
  return (
    <section className="faixa alt" id="agenda">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Agenda da Arena</h2>
            <p>Próximos jogos e transmissões.</p>
          </div>
          <Link href="/agenda" className="ver">
            Agenda completa →
          </Link>
        </div>
        <ListaAgenda itens={itens} />
      </div>
    </section>
  );
}
