import type { Metadata } from 'next';
import { ProjetoSocialHome } from '@/components/home/ProjetoSocialHome';
import { Cartaz } from '@/components/midia/Cartaz';
import { Fileira } from '@/components/midia/Fileira';
import { lerConfigSite } from '@/lib/midia/config';
import { buscarResultadosProjeto } from '@/lib/midia/noticias-projeto';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Projeto Social | ARENA VALE',
  description: 'O compromisso social da ARENA VALE com o esporte, a inclusão e o desenvolvimento de crianças, jovens e atletas da comunidade.',
};

/** Página Projeto Social (spec Fase 3, seção 9): todo o conteúdo da página antiga + resultados dos projetos. */
export default async function ProjetoSocialPage() {
  const [config, resultados] = await Promise.all([lerConfigSite(), buscarResultadosProjeto().catch(() => [])]);
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <ProjetoSocialHome
        whatsapp={config.whatsapp}
        titulo="h1"
        completo
        resultados={
          resultados.length > 0 ? (
            <>
              <p className="resultados-t">Resultados dos projetos</p>
              <Fileira rotulo="Resultados dos projetos">
                {resultados.map((r) => (
                  <Cartaz key={r.id} href={`/noticias/${r.id}`} titulo={r.titulo} imagem={r.imagem_url} selo={r.tipo_midia === 'video' ? 'Vídeo' : 'Foto'} video={r.tipo_midia === 'video'} chapeu="Projeto social" />
                ))}
              </Fileira>
            </>
          ) : null
        }
      />
    </main>
  );
}
