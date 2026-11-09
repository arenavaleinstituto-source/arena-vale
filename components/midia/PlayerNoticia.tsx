import { modoReproducao, type NoticiaMidia } from '@/lib/midia/noticias';
import { IMAGEM_CARTAZ_PADRAO } from './Cartaz';

/** O que aparece no lugar do vídeo, na ordem do spec 4.5: arquivo → YouTube → link externo → foto. */
export function PlayerNoticia({ n }: { n: NoticiaMidia }) {
  const modo = modoReproducao(n);
  const capa = n.imagem_url || IMAGEM_CARTAZ_PADRAO;
  if (modo.tipo === 'arquivo') {
    return <video controls playsInline preload="metadata" poster={capa} src={modo.src} className="aspect-video w-full rounded-[22px] bg-black" />;
  }
  if (modo.tipo === 'youtube') {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[22px] bg-black">
        <iframe src={modo.embed} title={n.titulo} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-av-grafite-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- capas de várias origens */}
      <img src={capa} alt={n.titulo} className="max-h-[70vh] w-full object-cover" style={n.enquadramento ? { objectPosition: n.enquadramento } : undefined} />
      {modo.tipo === 'link' && (
        <div className="absolute inset-0 grid place-items-center bg-black/45">
          <a href={modo.href} target="_blank" rel="noopener noreferrer" className="av-btn forte">
            ▶ Assistir no {modo.servico}
          </a>
        </div>
      )}
    </div>
  );
}
