import type { ItemAgenda } from '@/lib/midia/agenda';
import { formatarQuando } from '@/lib/midia/datas';
import { BotoesJogo } from '@/components/midia/BotoesJogo';
import { CONFIG_PADRAO } from '@/lib/midia/config-padrao';

/** Cartões de jogos da agenda, com Lembrar, sininho e Ver fotos. */
export function ListaAgenda({
  itens,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br',
  youtubeHandle = CONFIG_PADRAO.youtubeHandle,
  albuns = {},
  hoje = false,
}: {
  itens: ItemAgenda[];
  baseUrl?: string;
  youtubeHandle?: string;
  /** "origem-id" → id do álbum da galeria. */
  albuns?: Record<string, string>;
  hoje?: boolean;
}) {
  if (itens.length === 0) return <p className="vazio">Nenhum jogo agendado — volte em breve.</p>;
  return (
    <div className="agenda">
      {itens.map((j) => {
        const chave = `${j.origem}-${j.id}`;
        return (
          <article className="jogo" key={chave}>
            <div className="topo-j">
              <span className="mod">
                {hoje && <span className="hoje">HOJE</span>}
                {j.modalidade ?? 'ARENA VALE'}
              </span>
              <span>{j.fase ?? ''}</span>
            </div>
            <div className="times">
              {j.casa}
              <small>VS</small>
              {j.fora}
            </div>
            <div className="quando">
              <span>{formatarQuando(j.dataHora)}</span>
              {j.transmissao && <span className="tx">● Transmissão</span>}
            </div>
            {j.status === 'ao_vivo' && (
              <div className="ao-vivo-placar">
                <span className="badge-ao-vivo">🔴 AO VIVO</span>
                {j.placar && <span className="placar-ao-vivo">{j.placar}</span>}
              </div>
            )}
            {j.status === 'finalizado' && j.placar && (
              <span className="d">{j.placar}</span>
            )}
            {j.local && <span className="d">{j.local}</span>}
            <BotoesJogo item={j} baseUrl={baseUrl} youtubeHandle={youtubeHandle} albumId={albuns[chave] ?? null} />
          </article>
        );
      })}
    </div>
  );
}
