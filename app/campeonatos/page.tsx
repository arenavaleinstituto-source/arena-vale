import type { Metadata } from 'next';
import Link from 'next/link';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { Faixa } from '@/components/midia/Faixa';
import { SeuCampeonato } from '@/components/home/SeuCampeonato';
import { CartaoCampeonato } from '@/components/campeonatos/CartaoCampeonato';
import { buscarCampeonatosPublicos } from '@/lib/campeonatos/busca';
import { buscarModalidades } from '@/lib/midia/modalidades-busca';
import { lerConfigSite } from '@/lib/midia/config';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Campeonatos | ARENA VALE',
  description: 'Os campeonatos da ARENA VALE: classificação, chave, jogos e regulamento.',
};

type Props = { searchParams: Promise<{ situacao?: string; modalidade?: string }> };

const ABA = 'rounded-full border px-4 py-2 font-rotulo text-sm font-bold uppercase tracking-wider';

/** /campeonatos — lista dos campeonatos liberados no site. */
export default async function CampeonatosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const encerrados = sp.situacao === 'encerrados';
  const modalidade = sp.modalidade ?? '';
  const [todos, modalidades, config] = await Promise.all([buscarCampeonatosPublicos(), buscarModalidades(), lerConfigSite()]);
  const nomes = new Map(modalidades.map((m) => [m.slug, m.nome]));
  const lista = todos.filter((c) => c.encerrado === encerrados && (!modalidade || c.modalidade === modalidade));
  const link = (s: 'andamento' | 'encerrados') => `/campeonatos?situacao=${s}${modalidade ? `&modalidade=${modalidade}` : ''}`;

  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="ARENA VALE" titulo="Campeonatos" subtitulo="Classificação, chave, jogos e regulamento de cada campeonato." />
      <Faixa id="lista" titulo={encerrados ? 'Encerrados' : 'Em andamento'}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link href={link('andamento')} aria-current={!encerrados ? 'page' : undefined} className={`${ABA} ${!encerrados ? 'border-av-vermelho bg-av-vermelho text-white' : 'border-av-linha text-av-cinza'}`}>
            Em andamento
          </Link>
          <Link href={link('encerrados')} aria-current={encerrados ? 'page' : undefined} className={`${ABA} ${encerrados ? 'border-av-vermelho bg-av-vermelho text-white' : 'border-av-linha text-av-cinza'}`}>
            Encerrados
          </Link>
          <form method="get" action="/campeonatos" className="ml-auto flex items-center gap-2">
            <input type="hidden" name="situacao" value={encerrados ? 'encerrados' : 'andamento'} />
            <select name="modalidade" defaultValue={modalidade} aria-label="Filtrar por modalidade" className="rounded-full border border-av-linha bg-[#08080a] px-4 py-2 text-sm text-av-branco outline-none focus:border-av-vermelho">
              <option value="">Todas as modalidades</option>
              {modalidades.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nome}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-leve">
              Filtrar
            </button>
          </form>
        </div>
        {lista.length === 0 ? (
          <p className="vazio">{encerrados ? 'Nenhum campeonato encerrado ainda.' : 'Em breve os primeiros campeonatos.'}</p>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {lista.map((c) => (
              <CartaoCampeonato key={c.id} c={c} nomeModalidade={c.modalidade ? nomes.get(c.modalidade) : undefined} />
            ))}
          </div>
        )}
      </Faixa>
      <SeuCampeonato whatsapp={config.whatsapp} alt />
    </main>
  );
}
