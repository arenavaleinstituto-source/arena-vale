import { Banner } from '@/components/home/Banner';
import { AoVivo } from '@/components/home/AoVivo';
import { HojeNaArena } from '@/components/home/HojeNaArena';
import { Cortes } from '@/components/home/Cortes';
import { FotosDosJogos } from '@/components/home/FotosDosJogos';
import { albunsDosJogos, buscarAlbuns } from '@/lib/midia/galeria-busca';
import { UltimosVideos } from '@/components/home/UltimosVideos';
import { Modalidades } from '@/components/home/Modalidades';
import { ProjetoSocialHome } from '@/components/home/ProjetoSocialHome';
import { AtletasDestaques } from '@/components/home/AtletasDestaques';
import { ParaMarcas } from '@/components/home/ParaMarcas';
import { SeuCampeonato } from '@/components/home/SeuCampeonato';
import { BannerTorneio } from '@/components/home/BannerTorneio';
import { Patrocinadores } from '@/components/home/Patrocinadores';
import { QuemSomos } from '@/components/home/QuemSomos';
import { Contato } from '@/components/home/Contato';
import { AgoraNaArena, EsporteMundial } from '@/components/home/NoticiasHome';
import { buscarNoticiasPublicadas } from '@/lib/midia/noticias-busca';
import { noticiaDaTelaInicial } from '@/lib/midia/noticias';
import { buscarPatrocinadores } from '@/lib/midia/patrocinadores';
import { lerConfigSite, linkAssistirAoVivo } from '@/lib/midia/config';
import { buscarCortesYT, buscarVideosYT, embedAoVivo, estaAoVivo } from '@/lib/midia/youtube';
import { aplicarGiros, buscarGirosDosCortes } from '@/lib/midia/cortes';
import { buscarAgenda, buscarHojeNaArena, resumoAgenda } from '@/lib/midia/agenda';
import { buscarVideosExternos } from '@/lib/midia/videos-externos-busca';
import { buscarDestaques } from '@/lib/content/destaques';
import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 60;

/** Cada bloco tem seu próprio "vazio": uma fonte fora do ar nunca derruba a página. */
async function seguro<T>(p: Promise<T>, vazio: T): Promise<T> {
  try {
    return await p;
  } catch {
    return vazio;
  }
}

/** Página inicial de mídia esportiva (spec Fase 3, seção 5). */
export default async function Home() {
  const config = await lerConfigSite();
  const [aoVivoDetectado, agenda, hojeNaArena, cortesYT, giros, albunsHome, albunsJogos, videos, externos, destaques, patrocinadores, arena, mundo] = await Promise.all([
    seguro(estaAoVivo(config.youtubeChannelId), false),
    seguro(buscarAgenda(30), []),
    seguro(buscarHojeNaArena(), { hoje: [], proximos: [] }),
    seguro(buscarCortesYT(config.youtubeChannelId), []),
    seguro(buscarGirosDosCortes(), {}),
    seguro(buscarAlbuns(8), []),
    seguro(albunsDosJogos(), {}),
    seguro(buscarVideosYT(config.youtubeChannelId), []),
    seguro(buscarVideosExternos(8), []),
    seguro(
      buscarDestaques(createPublicClient(), { limite: 12 }).then((r) => r.destaques),
      [],
    ),
    seguro(buscarPatrocinadores(), []),
    seguro(buscarNoticiasPublicadas({ aba: 'arena', limite: 12 }), []),
    seguro(buscarNoticiasPublicadas({ aba: 'mundo', limite: 12 }), []),
  ]);
  const aoVivo = config.aoVivoManual || aoVivoDetectado;
  const cortes = aplicarGiros(cortesYT, giros);
  const { proxima } = resumoAgenda(agenda, 6);
  // Fotos reais da Arena para os cartões do "O que fazemos": capas dos álbuns mais novos.
  const fotosServicos = albunsHome.map((a) => a.capaUrl).filter((u): u is string => Boolean(u)).slice(0, 4);
  const noticiaBanner = noticiaDaTelaInicial(arena, mundo);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';

  return (
    <main id="topo" className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <Banner capaUrl={config.capaUrl} whatsapp={config.whatsapp} proxima={proxima} noticia={noticiaBanner} />
      <AoVivo aoVivo={aoVivo} embed={embedAoVivo(config.youtubeChannelId)} linkAssistir={linkAssistirAoVivo(config)} proxima={proxima} />
      <QuemSomos fotos={fotosServicos} />
      <AgoraNaArena noticias={arena} />
      <EsporteMundial noticias={mundo} />
      <HojeNaArena hoje={hojeNaArena.hoje} proximos={hojeNaArena.proximos} baseUrl={baseUrl} youtubeHandle={config.youtubeHandle} albuns={albunsJogos} />
      <Cortes cortes={cortes} />
      <BannerTorneio whatsapp={config.whatsapp} />
      <UltimosVideos videos={videos} externos={externos} channelUrl={`https://www.youtube.com/${config.youtubeHandle}`} />
      <FotosDosJogos albuns={albunsHome} />
      <Modalidades />
      <SeuCampeonato whatsapp={config.whatsapp} />
      <ProjetoSocialHome whatsapp={config.whatsapp} />
      <AtletasDestaques destaques={destaques} />
      <Patrocinadores patrocinadores={patrocinadores} />
      <ParaMarcas whatsapp={config.whatsapp} />
      <Contato whatsapp={config.whatsapp} instagramUrl={config.instagramUrl} youtubeHandle={config.youtubeHandle} />
    </main>
  );
}
