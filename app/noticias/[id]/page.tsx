import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerNoticia } from '@/components/midia/PlayerNoticia';
import { CartazNoticia } from '@/components/midia/CartazNoticia';
import { Fileira } from '@/components/midia/Fileira';
import { buscarNoticia, buscarNoticiasPublicadas } from '@/lib/midia/noticias-busca';
import { CATEGORIAS_MIDIA } from '@/lib/midia/noticias';
import { formatarDataExtensoBR } from '@/lib/content/texto';

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await buscarNoticia((await params).id);
  if (!n) return { title: 'Notícia | ARENA VALE' };
  return {
    title: `${n.titulo} | ARENA VALE`,
    description: n.descricao.slice(0, 160),
    openGraph: n.imagem_url ? { images: [n.imagem_url] } : undefined,
  };
}

/** Leitura de uma notícia (spec 2026-11-08, 4.1): player ou foto, texto, fonte e "Mais da mesma categoria". */
export default async function NoticiaPage({ params }: Props) {
  const n = await buscarNoticia((await params).id);
  if (!n) notFound();
  const mais = (await buscarNoticiasPublicadas({ aba: n.aba, categoria: n.categoria, limite: 21 })).filter((m) => m.id !== n.id).slice(0, 20);
  const categoria = CATEGORIAS_MIDIA.find((c) => c.valor === n.categoria)?.rotulo ?? 'Geral';

  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <article className="faixa">
        <div className="dentro grid gap-6">
          <Link href={n.aba === 'mundo' ? '/noticias?aba=mundo' : '/noticias'} className="ver w-fit justify-self-center">
            ← {n.aba === 'mundo' ? 'Esporte Mundial' : 'Notícias do Vale'}
          </Link>
          <div className="mx-auto grid max-w-4xl gap-3 text-center">
            <span className="font-rotulo text-sm font-bold uppercase tracking-[.16em] text-av-vermelho-claro">
              {categoria}
              {n.publicado_em ? ` · ${formatarDataExtensoBR(n.publicado_em)}` : ''}
            </span>
            <h1 className="font-display text-3xl font-extrabold uppercase leading-none sm:text-5xl">{n.titulo}</h1>
          </div>
          <div className="mx-auto w-full max-w-4xl">
            <PlayerNoticia n={n} />
          </div>
          <div className="mx-auto grid w-full max-w-3xl gap-4 text-lg leading-relaxed text-[#d4d4da]">
            {n.descricao.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
            {n.fonte && <p className="text-sm text-av-cinza">Fonte: {n.fonte}</p>}
          </div>
        </div>
      </article>
      {mais.length > 0 && (
        <section className="faixa alt">
          <div className="dentro">
            <div className="cab">
              <div>
                <h2>Mais da mesma categoria</h2>
              </div>
            </div>
            <Fileira rotulo="Mais da mesma categoria">
              {mais.map((m) => (
                <CartazNoticia key={m.id} n={m} />
              ))}
            </Fileira>
          </div>
        </section>
      )}
    </main>
  );
}
