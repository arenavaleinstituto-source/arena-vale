import { TopoPagina } from '@/components/midia/TopoPagina';
import { ListaAgenda } from '@/components/home/AgendaArena';
import { buscarAgenda } from '@/lib/midia/agenda';

export const revalidate = 60;

/** Agenda completa (spec Fase 3, seção 7): jogos dos campeonatos + agenda de transmissões, sem duplicatas. */
export default async function AgendaPage() {
  const itens = await buscarAgenda(50).catch(() => []);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="Agenda da Arena" titulo="Agenda" subtitulo="Próximos jogos e transmissões da ARENA VALE." />
      <section className="faixa">
        <div className="dentro">
          <ListaAgenda itens={itens} />
        </div>
      </section>
    </main>
  );
}
