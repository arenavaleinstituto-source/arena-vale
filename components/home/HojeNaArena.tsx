import Link from 'next/link';
import type { ItemAgenda } from '@/lib/midia/agenda';
import { ListaAgenda } from './AgendaArena';

/** Home: os jogos de hoje em destaque e, abaixo, os próximos dias. */
export function HojeNaArena({
  hoje,
  proximos,
  baseUrl,
  youtubeHandle,
  albuns,
}: {
  hoje: ItemAgenda[];
  proximos: ItemAgenda[];
  baseUrl: string;
  youtubeHandle: string;
  albuns: Record<string, string>;
}) {
  const comum = { baseUrl, youtubeHandle, albuns };
  const nada = hoje.length === 0 && proximos.length === 0;
  return (
    <section className="faixa alt" id="agenda">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Hoje na Arena</h2>
            <p>Jogos de hoje e dos próximos dias.</p>
          </div>
          <Link href="/agenda" className="ver">
            Agenda completa →
          </Link>
        </div>
        {nada ? (
          <ListaAgenda itens={[]} {...comum} />
        ) : (
          <>
            {hoje.length > 0 ? (
              <ListaAgenda itens={hoje} hoje {...comum} />
            ) : (
              <p className="vazio">Hoje não tem jogo na Arena — veja os próximos</p>
            )}
            {proximos.length > 0 && (
              <>
                <h3 className="sub-agenda">Próximos dias</h3>
                <ListaAgenda itens={proximos} {...comum} />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
