import Link from 'next/link';
import type { ItemAgenda } from '@/lib/midia/agenda';
import { Contagem } from './Contagem';

type Props = { aoVivo: boolean; embed: string; linkAssistir: string; proxima: ItemAgenda | null; id?: string };

/** "Arena Vale Ao Vivo" (spec Fase 3, seção 5, bloco 2). */
export function AoVivo({ aoVivo, embed, linkAssistir, proxima, id = 'aovivo' }: Props) {
  return (
    <section className="faixa" id={id}>
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Arena Vale Ao Vivo</h2>
            <p>A transmissão do canal TV Arena Vale aparece aqui assim que entrar no ar.</p>
          </div>
          <a href={linkAssistir} className="av-btn forte" target="_blank" rel="noopener noreferrer">
            ▶ Assista ao vivo
          </a>
        </div>
        <div className="aovivo">
          {aoVivo ? (
            <div className="player">
              <iframe
                src={embed}
                title="Transmissão ao vivo ARENA VALE"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="player" role="img" aria-label="Transmissão fora do ar">
              <span className="tag">Fora do ar agora</span>
              <span className="play" aria-hidden="true">
                ▶
              </span>
            </div>
          )}
          <div className="proxima">
            <span className="rot">● Próxima transmissão</span>
            {proxima ? (
              <>
                <h3>
                  {proxima.casa} × {proxima.fora}
                </h3>
                <span className="meta">
                  {[proxima.modalidade, proxima.fase].filter(Boolean).join(' · ')}
                  {proxima.local && (
                    <>
                      <br />
                      {proxima.local}
                    </>
                  )}
                </span>
                <Contagem alvo={proxima.dataHora} />
              </>
            ) : (
              <h3>Próxima transmissão a definir</h3>
            )}
            <Link href="/agenda" className="av-btn leve" style={{ width: 'fit-content' }}>
              Ver toda a agenda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
