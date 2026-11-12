import { TopoPagina } from '@/components/midia/TopoPagina';
import { ListaAgenda } from '@/components/home/AgendaArena';
import { buscarAgenda } from '@/lib/midia/agenda';
import { lerConfigSite } from '@/lib/midia/config';
import { albunsDosJogos } from '@/lib/midia/galeria-busca';

export const revalidate = 60;

/** Agenda completa (spec Fase 3, seção 7): jogos dos campeonatos + agenda de transmissões, sem duplicatas. */
export default async function AgendaPage() {
  const [itens, config, albuns] = await Promise.all([buscarAgenda(50).catch(() => []), lerConfigSite(), albunsDosJogos()]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Agenda da Arena" titulo="Agenda" subtitulo="Próximos jogos e transmissões da ARENA VALE." />
      <section className="faixa">
        <div className="dentro">
          <ListaAgenda itens={itens} baseUrl={baseUrl} youtubeHandle={config.youtubeHandle} albuns={albuns} />
        </div>
      </section>
    </main>
  );
}
