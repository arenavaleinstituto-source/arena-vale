import Link from 'next/link';
import type { VideoYT } from '@/lib/midia/youtube';
import type { VideoExterno } from '@/lib/midia/videos-externos';
import { formatarDiaMes } from '@/lib/midia/datas';

export type ItemVideo = { id: string; titulo: string; capa: string; link: string; plataforma: 'youtube' | 'instagram' | 'outro'; data: string };

export function juntarVideos(videos: VideoYT[], externos: VideoExterno[], limite = 8): ItemVideo[] {
  return [
    ...videos.map((v) => ({ id: `yt-${v.id}`, titulo: v.titulo, capa: v.capa, link: v.link, plataforma: 'youtube' as const, data: v.publicadoEm })),
    ...externos.map((v) => ({
      id: `ex-${v.id}`,
      titulo: v.titulo,
      capa: v.capa_url,
      link: v.link,
      plataforma: v.plataforma === 'instagram' ? ('instagram' as const) : ('outro' as const),
      data: v.publicado_em,
    })),
  ]
    .sort((a, b) => Date.parse(b.data) - Date.parse(a.data))
    .slice(0, limite);
}

export const ROTULO_PLATAFORMA: Record<ItemVideo['plataforma'], string> = { youtube: 'YouTube', instagram: 'Instagram', outro: 'Vídeo' };

type Props = { videos: VideoYT[]; externos: VideoExterno[]; channelUrl: string };

/** "Últimos vídeos" (spec Fase 3, seção 5, bloco 6): YouTube + Instagram, os 8 mais recentes. */
export function UltimosVideos({ videos, externos, channelUrl }: Props) {
  const itens = juntarVideos(videos, externos);
  return (
    <section className="faixa" id="videos">
      <div className="dentro">
        <div className="cab">
          <div>
            <h2>Últimos vídeos</h2>
            <p>Direto do canal TV Arena Vale — atualiza sozinho.</p>
          </div>
          <Link href="/videos" className="ver">
            Ver todos →
          </Link>
        </div>
        {itens.length === 0 ? (
          <p className="vazio">
            <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="av-btn leve">
              Veja no canal
            </a>
          </p>
        ) : (
          <div className="videos">
            {itens.map((v) => (
              <a key={v.id} href={v.link} className="video" target="_blank" rel="noopener noreferrer">
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element -- capas do YouTube/Instagram */}
                  <img src={v.capa} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
                <span className="yt">
                  {ROTULO_PLATAFORMA[v.plataforma]} · {formatarDiaMes(v.data)}
                </span>
                <h3>{v.titulo}</h3>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
