import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { ElencoEquipe } from '@/components/atletas/ElencoEquipe';
import { buscarElenco, buscarEquipe } from '@/lib/atletas/elenco';

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await buscarEquipe((await params).id);
  return { title: e ? `${e.nome} | ARENA VALE` : 'Equipe | ARENA VALE' };
}

/** Elenco público de uma equipe (pedido do dono): fotos, nomes, camisa, posição e CPF mascarado. */
export default async function EquipePage({ params }: Props) {
  const { id } = await params;
  const equipe = await buscarEquipe(id);
  if (!equipe) notFound();
  const atletas = await buscarElenco(id);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu={equipe.sigla ? `Equipe · ${equipe.sigla}` : 'Equipe'} titulo={equipe.nome} subtitulo={equipe.cidade ?? undefined} />
      <section className="faixa">
        <div className="dentro">
          <div className="cab">
            <div>
              <h2>Elenco</h2>
              <p>{atletas.length} atleta(s) cadastrado(s)</p>
            </div>
          </div>
          <ElencoEquipe atletas={atletas} />
        </div>
      </section>
    </main>
  );
}
