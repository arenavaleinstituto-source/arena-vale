import type { CSSProperties } from 'react';

type Props = { capaUrl: string; whatsapp: string; linkAssistir: string };

/** Banner da página inicial (redesign): com CTAs e stats bullets. */
export function Banner({ capaUrl, whatsapp, linkAssistir }: Props) {
  const estilo = { '--capa-img': `url("${capaUrl.replace(/"/g, '%22')}")` } as CSSProperties;
  const linkWpp = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero divulgar o meu torneio na ARENA VALE.')}`;
  return (
    <section className="hero" id="inicio" style={estilo}>
      <div className="cantos" aria-hidden="true" />
      <div className="dentro">
        <div className="marca-hero">
          <strong>
            ARENA <em>VALE</em>
          </strong>
          <span>Mídia Esportiva</span>
        </div>
        <h1>
          O palco do <em className="text-av-vermelho">esporte</em> é aqui.
        </h1>
        <p>Transmissões ao vivo, coberturas, informação, análises e histórias de quem vive o esporte.</p>
        <div className="hero-acoes">
          <a href={linkWpp} className="av-btn forte" target="_blank" rel="noopener noreferrer">
            Falar com a ARENA VALE
          </a>
          <a href={linkAssistir} className="av-btn leve" target="_blank" rel="noopener noreferrer">
            Assistir ao vivo
          </a>
        </div>
        <ul className="hero-stats">
          <li><b>+1.200</b> jovens no projeto social</li>
          <li><b>Todo o esporte</b> futebol, futsal, society, basquete, vôlei</li>
          <li><b>Ao vivo</b> no canal TV Arena Vale</li>
        </ul>
      </div>
    </section>
  );
}
