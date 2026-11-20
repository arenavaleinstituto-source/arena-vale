import { Faixa } from '@/components/midia/Faixa';
import { Fileira } from '@/components/midia/Fileira';
import { CartazNoticia } from '@/components/midia/CartazNoticia';
import type { NoticiaMidia } from '@/lib/midia/noticias';

/** "Notícias do Vale" (bloco 3 da página inicial; antes "Agora na Arena"). */
export function AgoraNaArena({ noticias }: { noticias: NoticiaMidia[] }) {
  return (
    <Faixa id="noticias" titulo="Notícias do Vale" subtitulo="Notícias, resultados e bastidores." alt verTodos={{ href: '/noticias', rotulo: 'Todas as notícias →' }}>
      {noticias.length === 0 ? (
        <p className="vazio">Em breve as primeiras notícias.</p>
      ) : (
        <Fileira rotulo="Notícias do Vale" girar>
          {noticias.map((n) => (
            <CartazNoticia key={n.id} n={n} />
          ))}
        </Fileira>
      )}
    </Faixa>
  );
}

/** "Esporte Mundial" (bloco 4 da página inicial), com o caminho da notícia. */
export function EsporteMundial({ noticias }: { noticias: NoticiaMidia[] }) {
  return (
    <Faixa
      id="mundo"
      titulo="Esporte Mundial"
      subtitulo="Notícias do esporte mundial."
      verTodos={{ href: '/noticias#mundo', rotulo: 'Todas do Esporte Mundial →' }}
    >
      {noticias.length === 0 ? (
        <p className="vazio">Em breve as primeiras notícias.</p>
      ) : (
        <Fileira rotulo="Esporte Mundial">
          {noticias.map((n) => (
            <CartazNoticia key={n.id} n={n} />
          ))}
        </Fileira>
      )}
    </Faixa>
  );
}
