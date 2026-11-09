import { Faixa } from '@/components/midia/Faixa';
import { Fileira } from '@/components/midia/Fileira';
import { CartazNoticia } from '@/components/midia/CartazNoticia';
import type { NoticiaMidia } from '@/lib/midia/noticias';

/** "Agora na Arena" (bloco 3 da página inicial). */
export function AgoraNaArena({ noticias }: { noticias: NoticiaMidia[] }) {
  return (
    <Faixa id="noticias" titulo="Agora na Arena" subtitulo="Notícias, resultados e bastidores." alt verTodos={{ href: '/noticias', rotulo: 'Todas as notícias →' }}>
      {noticias.length === 0 ? (
        <p className="vazio">Em breve as primeiras notícias.</p>
      ) : (
        <Fileira rotulo="Agora na Arena">
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
      subtitulo="Notícias do esporte pelo mundo — garimpadas pelo bot e publicadas pela coordenação."
      verTodos={{ href: '/noticias?aba=mundo', rotulo: 'Todas do Esporte Mundial →' }}
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
      <div className="fluxo" aria-label="Como a notícia chega">
        <span>Grupo do Telegram</span>
        <i>→</i>
        <span>Bot da ARENA VALE</span>
        <i>→</i>
        <span>Rascunho no painel</span>
        <i>→</i>
        <span>Coordenação edita e publica</span>
      </div>
    </Faixa>
  );
}
