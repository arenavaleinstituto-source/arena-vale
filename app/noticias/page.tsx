import type { Metadata } from 'next';
import Link from 'next/link';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { BannerDestaque } from '@/components/midia/BannerDestaque';
import { CartazNoticia } from '@/components/midia/CartazNoticia';
import { Fileira } from '@/components/midia/Fileira';
import { buscarNoticiasPublicadas } from '@/lib/midia/noticias-busca';
import { montarFileiras, type Aba } from '@/lib/midia/noticias';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Notícias | ARENA VALE',
  description: 'Notícias do Vale e do Esporte Mundial: vídeos e fotos escolhidos pela coordenação da ARENA VALE.',
};

type Props = { searchParams: Promise<{ aba?: string }> };

/** Catálogo de notícias (spec 2026-11-08, 4.1; Fase 3, seção 9): abas Notícias do Vale e Esporte Mundial. */
export default async function NoticiasPage({ searchParams }: Props) {
  const aba: Aba = (await searchParams).aba === 'mundo' ? 'mundo' : 'arena';
  const noticias = await buscarNoticiasPublicadas({ aba, limite: 120 });
  const destaque = noticias.find((n) => n.destaque) ?? noticias[0] ?? null;
  const fileiras = montarFileiras(noticias, aba);
  const mundo = aba === 'mundo';

  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina
        chapeu={mundo ? 'Notícias do esporte pelo mundo' : 'Notícias da ARENA VALE e da região'}
        titulo={mundo ? 'Esporte Mundial' : 'Notícias do Vale'}
      >
        <nav className="abas-noticias" aria-label="Abas de notícias">
          <Link href="/noticias" aria-current={!mundo ? 'page' : undefined}>
            Notícias do Vale
          </Link>
          <Link href="/noticias?aba=mundo" aria-current={mundo ? 'page' : undefined}>
            Esporte Mundial
          </Link>
        </nav>
      </TopoPagina>
      <section className="faixa">
        <div className="dentro">
          {!destaque ? (
            <p className="vazio">Em breve as primeiras notícias.</p>
          ) : (
            <>
              <BannerDestaque n={destaque} />
              {fileiras.map((f) => (
                <div key={f.titulo}>
                  <h2 className="fileira-titulo">{f.titulo}</h2>
                  <Fileira rotulo={f.titulo}>
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
    </main>
  );
}
