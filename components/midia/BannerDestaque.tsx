'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { modoReproducao, type NoticiaMidia } from '@/lib/midia/noticias';
import { IMAGEM_CARTAZ_PADRAO } from './Cartaz';

/** Pode tocar o vídeo de fundo? Não com "reduzir movimento" nem com "economia de dados". */
function podeAnimar(): boolean {
  if (typeof window === 'undefined') return false;
  const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const economia = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduz && !economia;
}

const semInscricao = () => () => {};

/** Banner de destaque do catálogo (spec 4.1): vídeo mudo em loop ou o cartaz com zoom lento. */
export function BannerDestaque({ n }: { n: NoticiaMidia }) {
  const modo = modoReproducao(n);
  // No servidor nunca anima; no navegador, decide pelas preferências do aparelho.
  const animar = useSyncExternalStore(semInscricao, podeAnimar, () => false);
  const capa = n.imagem_url || IMAGEM_CARTAZ_PADRAO;
  const video = modo.tipo !== 'foto';
  return (
    <section className="destaque-noticia">
      {modo.tipo === 'arquivo' && animar ? (
        <video className="fundo" src={modo.src} poster={capa} muted loop playsInline autoPlay aria-hidden="true" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- capas de várias origens
        <img className="fundo ken-burns" src={capa} alt="" style={n.enquadramento ? { objectPosition: n.enquadramento } : undefined} />
      )}
      <div className="conteudo">
        <span className="s">
          <b>AV</b>
          {video ? 'Vídeo' : 'Foto'} · Destaque
        </span>
        <h2>{n.titulo}</h2>
        {n.descricao && <p>{n.descricao.slice(0, 180)}</p>}
        <Link href={`/noticias/${n.id}`} className="av-btn forte w-fit">
          {video ? '▶ Assistir' : 'Ver'}
        </Link>
      </div>
    </section>
  );
}
