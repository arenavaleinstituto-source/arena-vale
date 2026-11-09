import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { AoVivo } from '@/components/home/AoVivo';
import { ListaAgenda } from '@/components/home/AgendaArena';
import { Faixa } from '@/components/midia/Faixa';
import { lerConfigSite, linkAssistirAoVivo } from '@/lib/midia/config';
import { embedAoVivo, estaAoVivo } from '@/lib/midia/youtube';
import { buscarAgenda, proximaTransmissao } from '@/lib/midia/agenda';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Ao Vivo | ARENA VALE',
  description: 'Transmissões ao vivo da TV Arena Vale e a agenda das próximas transmissões.',
};

/** Página Ao Vivo (spec Fase 3, seção 9): o player ou "fora do ar", e a agenda de transmissões. */
export default async function AoVivoPage() {
  const config = await lerConfigSite();
  const [detectado, agenda] = await Promise.all([estaAoVivo(config.youtubeChannelId).catch(() => false), buscarAgenda(30).catch(() => [])]);
  const transmissoes = agenda.filter((i) => i.transmissao);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina chapeu="TV Arena Vale" titulo="Ao Vivo" subtitulo="Os jogos da ARENA VALE ao vivo, com narração e os melhores momentos." />
      <AoVivo
        id="player"
        aoVivo={config.aoVivoManual || detectado}
        embed={embedAoVivo(config.youtubeChannelId)}
        linkAssistir={linkAssistirAoVivo(config)}
        proxima={proximaTransmissao(agenda)}
      />
      <Faixa id="transmissoes" titulo="Próximas transmissões" subtitulo="Jogos com transmissão confirmada." alt>
        <ListaAgenda itens={transmissoes} />
      </Faixa>
    </main>
  );
}
