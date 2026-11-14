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
        <Fileira rotulo="Agora na Arena" girar>
          {noticias.map((n) => (
            <CartazNoticia key={n.id} n={n} />
          ))}
        </Fileira>
      )}
    </Faixa>
  );
}

/** "Esporte Mundial" (bloco 4 da página inicial) — layout mosaico. */
export function EsporteMundial({ noticias }: { noticias: NoticiaMidia[] }) {
  const quatro = noticias.slice(0, 4);
  return (
    <section className="faixa" id="mundo">
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Esporte mundial</span>
          <h2>As notícias que <em className="accent">movem o esporte.</em></h2>
          <p>Notícias do esporte pelo mundo, selecionadas e publicadas pela coordenação da ARENA VALE.</p>
        </div>
        {quatro.length === 0 ? (
          <p className="vazio">Em breve as primeiras notícias.</p>
        ) : (
          <div className="mosaico-grade" data-n={quatro.length}>
            {quatro.map((n, i) => (
              <a key={n.id} className={`mosaico-cartao${i === 0 ? ' grande' : ''}`} href={`/noticias/${n.id}`}>
                <div className="mosaico-foto">
                  {n.imagem_url && <img src={n.imagem_url} alt={n.titulo} loading="lazy" />}
                </div>
                <div className="mosaico-corpo">
                  <span className="mosaico-num">0{i + 1}</span>
                  <h3>{n.titulo}</h3>
                  {i === 0 && n.descricao && <p>{n.descricao}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
        <a href="/noticias?aba=mundo" className="ver" style={{ display: 'block', width: 'fit-content', margin: '16px auto 0' }}>
          Todas do Esporte Mundial →
        </a>
      </div>
    </section>
  );
}
