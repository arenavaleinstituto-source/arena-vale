import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { FiltroVideos } from '@/components/midia/FiltroVideos';
import { juntarVideos } from '@/components/home/UltimosVideos';
import { lerConfigSite } from '@/lib/midia/config';
import { buscarVideosYT } from '@/lib/midia/youtube';
import { buscarVideosExternos } from '@/lib/midia/videos-externos-busca';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Vídeos | ARENA VALE',
  description: 'Os vídeos do canal TV Arena Vale no YouTube e do Instagram @arenavaleoficial.',
};

/** Página Vídeos (spec Fase 3, seção 9): YouTube + Instagram com filtro. */
export default async function VideosPage() {
  const config = await lerConfigSite();
  const [yt, externos] = await Promise.all([buscarVideosYT(config.youtubeChannelId), buscarVideosExternos(60).catch(() => [])]);
  const videos = juntarVideos(yt, externos, 100);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="TV Arena Vale" titulo="Vídeos" subtitulo="Jogos, melhores momentos e bastidores — direto do YouTube e do Instagram." />
      <section className="faixa">
        <div className="dentro">
          {videos.length === 0 ? (
            <p className="vazio">
              <a href={`https://www.youtube.com/${config.youtubeHandle}`} target="_blank" rel="noopener noreferrer" className="av-btn leve">
                Veja no canal
              </a>
            </p>
          ) : (
            <FiltroVideos videos={videos} />
          )}
        </div>
      </section>
    </main>
  );
}
