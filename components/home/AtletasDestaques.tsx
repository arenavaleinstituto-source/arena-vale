import Link from 'next/link';
import type { Destaque } from '@/lib/content/tipos';
import { Cartaz } from '@/components/midia/Cartaz';
import { Fileira } from '@/components/midia/Fileira';

/** "Atletas Destaques" — portrait spotlight do primeiro + fileira dos restantes. */
export function AtletasDestaques({ destaques }: { destaques: Destaque[] }) {
  const [primeiro, ...resto] = destaques;
  return (
    <section className="faixa" id="atletas">
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Atletas destaque</span>
          <h2>O jogo não termina <em className="accent">no placar.</em></h2>
        </div>
        {destaques.length === 0 ? (
          <p className="vazio">Em breve os destaques da temporada.</p>
        ) : (
          <>
            <div className="atleta-sobre">
              <div className="atleta-foto">
                {primeiro.imagem_url && (
                  <img src={primeiro.imagem_url} alt={primeiro.nome} />
                )}
              </div>
              <div className="atleta-info">
                <span className="eyebrow">Atleta destaque</span>
                <h3>{primeiro.nome}</h3>
                <p>{[primeiro.modalidade, primeiro.equipe].filter(Boolean).join(' · ')}</p>
                <Link href="/atletasdestaques" className="av-btn leve" style={{ width: 'fit-content', marginTop: '12px' }}>
                  Ver todos os destaques
                </Link>
              </div>
            </div>
            {resto.length > 0 && (
              <Fileira rotulo="Mais destaques">
                {resto.map((d) => (
                  <Cartaz
                    key={d.id}
                    href="/atletasdestaques"
                    titulo={d.nome}
                    imagem={d.imagem_url}
                    selo="ATLETA DESTAQUE"
                    chapeu={[d.modalidade, d.equipe].filter(Boolean).join(' · ')}
                  />
                ))}
              </Fileira>
            )}
          </>
        )}
      </div>
    </section>
  );
}
