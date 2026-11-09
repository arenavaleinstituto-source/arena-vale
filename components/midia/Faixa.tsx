import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  id?: string;
  titulo: string;
  subtitulo?: string;
  /** Faixa grafite (as faixas alternam preto e grafite). */
  alt?: boolean;
  verTodos?: { href: string; rotulo?: string };
  children: ReactNode;
};

/** Seção da página: título centralizado em caixa alta, como na prévia aprovada. */
export function Faixa({ id, titulo, subtitulo, alt, verTodos, children }: Props) {
  return (
    <section id={id} className={alt ? 'faixa alt' : 'faixa'}>
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          {verTodos && (
            <Link href={verTodos.href} className="ver">
              {verTodos.rotulo ?? 'Ver todos →'}
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
