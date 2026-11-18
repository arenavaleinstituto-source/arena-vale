import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buscarCampeonatoPorSlug, type PaginaCampeonato } from '@/lib/campeonatos/busca';
import { regulamentoEmTexto } from '@/lib/campeonatos/texto';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';
import { EscudoCampeonato } from '@/components/campeonatos/EscudoCampeonato';
import { TabelaGrupo } from '@/components/campeonatos/TabelaGrupo';
import { Chave } from '@/components/campeonatos/Chave';
import { ListaJogos } from '@/components/campeonatos/ListaJogos';
import { TextoRegulamento } from '@/components/campeonatos/TextoRegulamento';
import { nomeDaForma } from '@/components/campeonatos/formatar';
import { abasDoCampeonato, chaveDoCampeonato, jogosDoCampeonato, ROTULO_ABA, tabelasDoCampeonato, type Aba } from '@/components/campeonatos/montarPagina';
import { anoAoLado } from '@/components/campeonatos/formatar';

// A pré-visualização lê a sessão de quem está logado: a página é sempre montada na hora.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ aba?: string }> };

/** Liberado no site → cliente público; escondido → só a equipe do campeonato, pela sessão. */
async function carregar(slug: string): Promise<{ pagina: PaginaCampeonato; previa: boolean } | null> {
  const publica = await buscarCampeonatoPorSlug(slug);
  if (publica) return { pagina: publica, previa: false };
  const daSessao = await buscarCampeonatoPorSlug(slug, await createClient());
  return daSessao ? { pagina: daSessao, previa: true } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await buscarCampeonatoPorSlug((await params).slug);
  return p ? { title: `${p.campeonato.nome} | ARENA VALE` } : { title: 'Campeonato | ARENA VALE' };
}

export default async function CampeonatoPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const achado = await carregar(slug);
  if (!achado) notFound();
  const { pagina: p, previa } = achado;
  const c = p.campeonato;
  const modalidades = await buscarModalidades();
  const nomeModalidade = modalidades.find((m) => m.slug === c.modalidade)?.nome ?? c.modalidade ?? '';
  const abas = abasDoCampeonato(p);
  const aba: Aba = abas.includes(sp.aba as Aba) ? (sp.aba as Aba) : abas[0];

  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      {previa && (
        <p role="status" className="bg-av-amarelo px-4 py-2 text-center font-rotulo text-sm font-bold uppercase tracking-wider text-black">
          Pré-visualização — ainda não está no site
        </p>
      )}
      <section className="topo-pagina">
        <div className="dentro flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <EscudoCampeonato campeonato={c} tamanho={128} />
          <div className="grid gap-1">
            <h1>
              {c.nome} {anoAoLado(c.nome, c.ano) && <span className="text-av-cinza">{anoAoLado(c.nome, c.ano)}</span>}
            </h1>
            <p className="font-rotulo font-bold uppercase tracking-wider text-av-cinza">
              {[nomeModalidade, c.categoria, c.regulamento.formato_antigo ? null : nomeDaForma(c.regulamento.forma)].filter(Boolean).join(' · ')}
            </p>
            {c.fase_atual && !c.encerrado && <p className="font-rotulo text-sm font-bold uppercase tracking-wider text-av-vermelho-claro">Fase atual: {c.fase_atual}</p>}
            {c.encerrado && <p className="font-rotulo text-sm font-bold uppercase tracking-wider text-av-cinza">Encerrado</p>}
          </div>
        </div>
      </section>

      <nav aria-label="Seções do campeonato" className="sticky top-[var(--altura-topo,64px)] z-10 border-b border-av-linha bg-av-preto/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4">
          {abas.map((a) => (
            <Link
              key={a}
              href={`/campeonatos/${c.slug}?aba=${a}`}
              aria-current={a === aba ? 'page' : undefined}
              className={`whitespace-nowrap px-4 py-3 font-rotulo text-sm font-bold uppercase tracking-wider ${a === aba ? 'text-av-branco shadow-[inset_0_-2px_0_var(--vermelho)]' : 'text-av-cinza hover:text-av-branco'}`}
            >
              {ROTULO_ABA[a]}
            </Link>
          ))}
        </div>
      </nav>

      <section className="faixa">
        <div className="dentro">
          {aba === 'classificacao' && (
            <div className="grid gap-8">
              {tabelasDoCampeonato(p).map((t, i) => (
                <TabelaGrupo key={t.titulo ?? i} titulo={t.titulo} linhas={t.linhas} times={p.times} tipoPlacar={c.regulamento.tipo_placar} classificam={t.classificam} />
              ))}
            </div>
          )}
          {aba === 'chave' && <Chave fases={chaveDoCampeonato(p)} />}
          {aba === 'jogos' && <ListaJogos blocos={jogosDoCampeonato(p)} />}
          {aba === 'regulamento' && <TextoRegulamento secoes={regulamentoEmTexto(c.regulamento, nomeModalidade)} />}
        </div>
      </section>
    </main>
  );
}
