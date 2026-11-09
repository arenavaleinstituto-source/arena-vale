import type { ReactNode } from 'react';

type Props = { chapeu?: string; titulo: ReactNode; subtitulo?: string; children?: ReactNode };

/** Topo das páginas internas: título grande centralizado em caixa alta, no visual da página inicial. */
export function TopoPagina({ chapeu, titulo, subtitulo, children }: Props) {
  return (
    <section className="topo-pagina">
      <div className="dentro">
        {chapeu && <span className="chapeu">{chapeu}</span>}
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
        {children}
      </div>
    </section>
  );
}
