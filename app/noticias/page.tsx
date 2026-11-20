import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { BannerDestaque } from '@/components/midia/BannerDestaque';
import { CartazNoticia } from '@/components/midia/CartazNoticia';
import { Fileira } from '@/components/midia/Fileira';
import { buscarNoticiasPublicadas } from '@/lib/midia/noticias-busca';
import { montarFileiras, type Aba, type NoticiaMidia } from '@/lib/midia/noticias';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Notícias | ARENA VALE',
  description: 'Notícias do Vale e do Esporte Mundial: vídeos e fotos escolhidos pela coordenação da ARENA VALE.',
};

function Secao({ id, titulo, aba, noticias, alt }: { id: string; titulo: string; aba: Aba; noticias: NoticiaMidia[]; alt?: boolean }) {
  const destaque = noticias.find((n) => n.destaque) ?? noticias[0] ?? null;
  return (
    <section id={id} className={`faixa${alt ? ' alt' : ''}`} style={{ scrollMarginTop: '6rem' }}>
      <div className="dentro">
        <h2 className="mb-4 font-display text-3xl font-extrabold uppercase">{titulo}</h2>
        {!destaque ? (
          <p className="vazio">Em breve as primeiras notícias.</p>
        ) : (
          <>
            <BannerDestaque n={destaque} />
            {montarFileiras(noticias, aba).map((f) => (
              <div key={f.titulo}>
                <h3 className="fileira-titulo">{f.titulo}</h3>
                <Fileira rotulo={`${titulo}: ${f.titulo}`}>
                  {f.itens.map((n) => (
                    <CartazNoticia key={n.id} n={n} />
                  ))}
                </Fileira>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

/** Notícias: Notícias do Vale e Esporte Mundial na mesma página (pedido do dono, Entrega 1 dos campeonatos). */
export default async function NoticiasPage() {
  const [vale, mundo] = await Promise.all([
    buscarNoticiasPublicadas({ aba: 'arena', limite: 120 }),
    buscarNoticiasPublicadas({ aba: 'mundo', limite: 120 }),
  ]);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="ARENA VALE" titulo="Notícias">
        <nav className="abas-noticias" aria-label="Seções de notícias">
          <a href="#vale">Notícias do Vale</a>
          <a href="#mundo">Esporte Mundial</a>
        </nav>
      </TopoPagina>
      <Secao id="vale" titulo="Notícias do Vale" aba="arena" noticias={vale} />
      <Secao id="mundo" titulo="Esporte Mundial" aba="mundo" noticias={mundo} alt />
    </main>
  );
}
