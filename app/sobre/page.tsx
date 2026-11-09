import type { Metadata } from 'next';
import { TopoPagina } from '@/components/midia/TopoPagina';
import { Faixa } from '@/components/midia/Faixa';
import { lerConfigSite } from '@/lib/midia/config';

export const metadata: Metadata = {
  title: 'Sobre | ARENA VALE',
  description: 'A ARENA VALE é uma marca de mídia esportiva: transmissões, notícias, análises e histórias de quem vive o esporte.',
};

const PILARES = [
  { titulo: 'Ao vivo', texto: 'Transmissões com narração, placar e replay — o jogo inteiro, de onde você estiver.' },
  { titulo: 'Informação', texto: 'Notícias, agenda e resultados apurados, com a velocidade que o esporte pede.' },
  { titulo: 'Análise', texto: 'O que aconteceu, por que aconteceu e o que vem por aí, com olhar de quem entende.' },
  { titulo: 'Histórias', texto: 'Personagens, trajetórias e bastidores — o jogo não termina no placar.' },
  { titulo: 'Comunidade', texto: 'Atletas, equipes, torcedores e marcas no mesmo palco, perto de quem faz o esporte acontecer.' },
];

const TEMPOS = [
  { titulo: 'Antes', texto: 'Agenda, expectativa, escalações e a preparação de cada equipe.' },
  { titulo: 'Durante', texto: 'A transmissão ao vivo, o placar e os lances que decidem o jogo.' },
  { titulo: 'Depois', texto: 'Melhores momentos, entrevistas, o craque do jogo e a análise do resultado.' },
];

/** Página Sobre (spec Fase 3, seção 9): manifesto, essência, pilares, contatos e redes. */
export default async function SobrePage() {
  const config = await lerConfigSite();
  return (
    <main className="w-full overflow-x-clip bg-av-preto text-av-branco">
      <TopoPagina
        chapeu="Sobre a ARENA VALE"
        titulo={
          <>
            O palco do <em className="text-av-vermelho not-italic">esporte</em> é aqui.
          </>
        }
        subtitulo="Somos uma marca de mídia esportiva. Transmitimos, informamos, analisamos e contamos as histórias de quem vive o esporte."
      />

      <Faixa id="essencia" titulo="Nossa essência" subtitulo="Dar palco ao esporte.">
        <div className="mx-auto grid max-w-3xl gap-4 text-center text-lg text-[#d4d4da]">
          <p>
            Cada atleta, cada equipe e cada jogo merecem ser vistos. A ARENA VALE existe para colocar o esporte no centro do palco — com energia de
            arquibancada e cabeça de jornalista.
          </p>
          <p>Nossa missão é levar o esporte a mais gente, com transmissões, informação de qualidade e histórias que valorizam quem está em campo.</p>
        </div>
      </Faixa>

      <Faixa id="pilares" titulo="Nossos pilares" alt>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILARES.map((p) => (
            <div key={p.titulo} className="ini">
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </Faixa>

      <Faixa id="tempos" titulo="Cada jogo tem três tempos" subtitulo="A cobertura da ARENA VALE acompanha o jogo do começo ao fim.">
        <div className="grid gap-4 md:grid-cols-3">
          {TEMPOS.map((t) => (
            <div key={t.titulo} className="ini">
              <h3>{t.titulo}</h3>
              <p>{t.texto}</p>
            </div>
          ))}
        </div>
      </Faixa>

      <Faixa id="contato" titulo="Fale com a ARENA VALE" alt>
        <div className="redes">
          <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <span>WhatsApp</span>
          </a>
          <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer">
            <span>Instagram</span>
          </a>
          <a href={`https://www.youtube.com/${config.youtubeHandle}`} target="_blank" rel="noopener noreferrer">
            <span>YouTube</span>
          </a>
        </div>
      </Faixa>
    </main>
  );
}
