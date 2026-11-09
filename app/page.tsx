import { Banner } from '@/components/home/Banner';
import { AoVivo } from '@/components/home/AoVivo';
import { AgendaArena } from '@/components/home/AgendaArena';
import { UltimosVideos } from '@/components/home/UltimosVideos';
import { Modalidades } from '@/components/home/Modalidades';
import { ProjetoSocialHome } from '@/components/home/ProjetoSocialHome';
import { AtletasDestaques } from '@/components/home/AtletasDestaques';
import { ParaMarcas } from '@/components/home/ParaMarcas';
import { Patrocinadores } from '@/components/home/Patrocinadores';
import { buscarPatrocinadores } from '@/lib/midia/patrocinadores';
import { lerConfigSite, linkAssistirAoVivo } from '@/lib/midia/config';
import { buscarVideosYT, embedAoVivo, estaAoVivo } from '@/lib/midia/youtube';
import { buscarAgenda, proximaTransmissao } from '@/lib/midia/agenda';
import { buscarVideosExternos } from '@/lib/midia/videos-externos';
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
  const [aoVivoDetectado, agenda, videos, externos, destaques, patrocinadores] = await Promise.all([
    seguro(estaAoVivo(config.youtubeChannelId), false),
    seguro(buscarAgenda(6), []),
    seguro(buscarVideosYT(config.youtubeChannelId), []),
    seguro(buscarVideosExternos(8), []),
    seguro(
      buscarDestaques(createPublicClient(), { limite: 12 }).then((r) => r.destaques),
      [],
    ),
    seguro(buscarPatrocinadores(), []),
  ]);
  const aoVivo = config.aoVivoManual || aoVivoDetectado;

  return (
    <main id="topo" className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <Banner capaUrl={config.capaUrl} />
      <AoVivo aoVivo={aoVivo} embed={embedAoVivo(config.youtubeChannelId)} linkAssistir={linkAssistirAoVivo(config)} proxima={proximaTransmissao(agenda)} />
      {/* Agora na Arena e Esporte Mundial: Task 12 (notícias em cartazes). */}
      <AgendaArena itens={agenda} />
      <UltimosVideos videos={videos} externos={externos} channelUrl={`https://www.youtube.com/${config.youtubeHandle}`} />
      <Modalidades />
      <ProjetoSocialHome whatsapp={config.whatsapp} />
      <AtletasDestaques destaques={destaques} />
      <Patrocinadores patrocinadores={patrocinadores} />
      <ParaMarcas whatsapp={config.whatsapp} />
    </main>
  );
}
