import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { Faixa } from '@/components/midia/Faixa';
import { ListaAgenda } from '@/components/home/AgendaArena';
import { CartaoCampeonato } from '@/components/campeonatos/CartaoCampeonato';
import { MODALIDADES_SITE, modalidadePorSlug } from '@/lib/midia/modalidades';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';
import { buscarAgenda } from '@/lib/midia/agenda';
import { buscarCampeonatosDaModalidade, filtrarPorModalidade } from '@/lib/midia/campeonatos';
import { buscarNoticiasPublicadas } from '@/lib/midia/noticias-busca';
import { Fileira } from '@/components/midia/Fileira';
import { CartazNoticia } from '@/components/midia/CartazNoticia';

export const revalidate = 60;

/** Modalidades novas (cadastradas depois do build) também abrem. */
export const dynamicParams = true;

export function generateStaticParams() {
  return MODALIDADES_SITE.map((m) => ({ slug: m.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = modalidadePorSlug((await params).slug, await buscarModalidades());
  return m ? { title: `${m.nome} | ARENA VALE`, description: m.frase } : {};
}

/** Página de uma modalidade: próximos jogos, cartões dos campeonatos (cada um leva à sua página) e notícias. */
export default async function ModalidadePage({ params }: Params) {
  const m = modalidadePorSlug((await params).slug, await buscarModalidades());
  if (!m) notFound();
  const [agenda, campeonatos, noticias] = await Promise.all([
    buscarAgenda(60).catch(() => []),
    buscarCampeonatosDaModalidade(m.slug),
    buscarNoticiasPublicadas({ modalidade: m.slug, limite: 20 }),
  ]);
  const jogos = filtrarPorModalidade(agenda, m.slug).slice(0, 6);
  const [antes, depois] = m.frase.split(m.nome.toLowerCase());

  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina
        chapeu="Modalidade"
        titulo={
          <>
            {antes}
            <em className="text-av-vermelho not-italic">{m.nome.toLowerCase()}</em>
            {depois}
          </>
        }
        subtitulo={`Campeonatos, jogos e notícias do ${m.nome.toLowerCase()} na ARENA VALE.`}
      />
      <Faixa id="jogos" titulo="Próximos jogos" alt>
        <ListaAgenda itens={jogos} />
      </Faixa>
      <Faixa id="campeonatos" titulo="Campeonatos">
        {campeonatos.length === 0 ? (
          <p className="vazio">Nenhum campeonato de {m.nome.toLowerCase()} cadastrado ainda.</p>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {campeonatos.map((c) => (
              <CartaoCampeonato key={c.id} c={c} nomeModalidade={m.nome} />
            ))}
          </div>
        )}
      </Faixa>
      {noticias.length > 0 && (
        <Faixa id="noticias" titulo={`Notícias do ${m.nome.toLowerCase()}`} alt>
          <Fileira rotulo={`Notícias do ${m.nome}`}>
            {noticias.map((n) => (
              <CartazNoticia key={n.id} n={n} />
            ))}
          </Fileira>
        </Faixa>
      )}
    </main>
  );
}
