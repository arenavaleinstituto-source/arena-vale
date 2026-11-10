import Link from 'next/link';

export const IMAGEM_CARTAZ_PADRAO = '/og-banner.jpg';

type Props = {
  href: string;
  titulo: string;
  imagem: string | null;
  /** Texto ao lado da marca "AV" no canto superior esquerdo (ex.: "Vídeo", "Foto"). */
  /** Selo no canto (ex.: "ATLETA DESTAQUE"); sem ele, a capa fica limpa. */
  selo?: string;
  /** Linha pequena abaixo do título (ex.: categoria ou fonte). */
  chapeu?: string;
  novo?: boolean;
  video?: boolean;
  externo?: boolean;
  /** Ponto focal da imagem no recorte 2:3 (CSS object-position), ex.: "50% 30%". */
  enquadramento?: string | null;
  /** Notícia em vídeo: faixa de cima (30%) com a logo e os times do jogo; a imagem fica embaixo. */
  cabecalho?: { confronto: string | null };
  /** Fonte da notícia (Esporte Mundial), mostrada sobre o cartaz. */
  fonte?: string | null;
};

/** Cartaz 2:3, como capa de filme (spec 2026-11-08, 4.1). */
export function Cartaz({ href, titulo, imagem, selo, chapeu, novo, video, externo, enquadramento, fonte, cabecalho }: Props) {
  const conteudo = (
    <>
      {cabecalho && (
        <span className="cab-video">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo pequena e fixa */}
          <img src="/logo-transparente.png" alt="ARENA VALE" />
          {cabecalho.confronto && (
            <strong>
              {cabecalho.confronto.split(/\s+x\s+/i).map((time, i) => (
                <span key={i}>
                  {i > 0 && <i aria-label="contra"> x </i>}
                  {time}
                </span>
              ))}
            </strong>
          )}
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- imagens de várias origens (Supabase, YouTube, Instagram) */}
      <img
        src={imagem || IMAGEM_CARTAZ_PADRAO}
        alt={titulo}
        loading="lazy"
        decoding="async"
        className="cartaz-img"
        style={enquadramento ? { objectPosition: enquadramento } : undefined}
      />
      {selo && (
        <span className="s">{selo}</span>
      )}
      {novo && <span className="n">NOVO</span>}
      {fonte && <span className="fonte">Fonte: {fonte}</span>}
      {video && (
        <span className="play" aria-label="Vídeo" role="img">
          ▶
        </span>
      )}
      <span className="t">
        {titulo}
        {chapeu && <span className="c">{chapeu}</span>}
      </span>
    </>
  );
  if (externo) {
    return (
      <a href={href} className={cabecalho ? 'cartaz com-cabecalho' : 'cartaz'} target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }
  return (
    <Link href={href} className={cabecalho ? 'cartaz com-cabecalho' : 'cartaz'}>
      {conteudo}
    </Link>
  );
}
