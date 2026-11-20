import { ICONES, IconeRede } from '@/components/IconesRedes';

type Props = { whatsapp: string; instagramUrl: string; youtubeHandle: string };

/** Seção "Contato" no fim da página inicial (o botão Contato do cabeçalho leva para cá). */
export function Contato({ whatsapp, instagramUrl, youtubeHandle }: Props) {
  const zap = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da ARENA VALE.')}`;
  const canais = [
    { nome: 'WhatsApp', detalhe: 'Atendimento direto', href: zap, icone: ICONES.whatsapp, forte: true },
    { nome: 'Instagram', detalhe: '@arenavaleoficial', href: instagramUrl, icone: ICONES.instagram },
    { nome: 'YouTube', detalhe: 'TV Arena Vale', href: `https://www.youtube.com/${youtubeHandle}`, icone: ICONES.youtube },
  ];
  return (
    <section className="faixa contato" id="contato">
      <div className="dentro">
        <div className="contato-caixa">
          <div className="contato-texto">
            <span className="chapeu-secao">Contato</span>
            <h2>
              Fale com a <em>ARENA VALE.</em>
            </h2>
            <p>Campeonato, transmissão, notícia ou patrocínio: chame a gente pelo canal que preferir.</p>
          </div>
          <div className="contato-canais">
            {canais.map((c) => (
              <a key={c.nome} href={c.href} target="_blank" rel="noopener noreferrer" className={`canal${c.forte ? ' forte' : ''}`}>
                <span className="canal-ic">
                  <IconeRede d={c.icone} />
                </span>
                <span>
                  <b>{c.nome}</b>
                  <small>{c.detalhe}</small>
                </span>
                <span className="canal-seta" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
