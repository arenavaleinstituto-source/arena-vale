import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { Faixa } from '@/components/midia/Faixa';
import { ListaAgenda } from '@/components/home/AgendaArena';
import { TabelaClassificacao } from '@/components/midia/TabelaClassificacao';
import { MODALIDADES_SITE, modalidadePorSlug } from '@/lib/midia/modalidades';
import { buscarAgenda } from '@/lib/midia/agenda';
import { buscarCampeonatosDaModalidade, filtrarPorModalidade } from '@/lib/midia/campeonatos';

export const revalidate = 60;

export function generateStaticParams() {
  return MODALIDADES_SITE.map((m) => ({ slug: m.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = modalidadePorSlug((await params).slug);
  return m ? { title: `${m.nome} | ARENA VALE`, description: m.frase } : {};
}

/** Página de uma modalidade (spec Fase 3, seção 8): próximos jogos e campeonatos com a classificação. */
export default async function ModalidadePage({ params }: Params) {
  const m = modalidadePorSlug((await params).slug);
  if (!m) notFound();
  const [agenda, campeonatos] = await Promise.all([buscarAgenda(60).catch(() => []), buscarCampeonatosDaModalidade(m.slug)]);
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
          <div className="grid gap-6">
            {campeonatos.map((c) => (
              <article key={c.id} className="rounded-[18px] border border-av-linha bg-av-grafite-2 p-5">
                <h3 className="font-display text-xl font-extrabold uppercase">
                  {c.nome} <span className="text-av-cinza">· {c.ano}</span>
                </h3>
                {c.categoria && <p className="text-sm text-av-cinza">{c.categoria}</p>}
                <TabelaClassificacao linhas={c.classificacao} />
              </article>
            ))}
          </div>
        )}
      </Faixa>
    </main>
  );
}
