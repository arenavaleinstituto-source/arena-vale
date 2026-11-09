import type { CSSProperties } from 'react';

/** Banner da página inicial (spec Fase 3, seção 2.4): sem botões, com a foto de capa ao fundo. */
export function Banner({ capaUrl }: { capaUrl: string }) {
  const estilo = { '--capa-img': `url("${capaUrl.replace(/"/g, '%22')}")` } as CSSProperties;
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
      </div>
    </section>
  );
}
