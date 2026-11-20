import Link from 'next/link';

/** Frentes de trabalho da ARENA VALE — os textos são os mesmos do Sobre, do Patrocínio e das seções do site. */
const SERVICOS = [
  { titulo: 'Transmissões ao vivo', texto: 'Narração, placar e replay: o jogo inteiro, de onde você estiver.', href: '/ao-vivo', rotulo: 'Ao vivo' },
  { titulo: 'Organização de campeonatos', texto: 'Página própria, tabela automática, agenda, súmula online e o elenco das equipes.', href: '/campeonatos', rotulo: 'Campeonatos' },
  { titulo: 'Cobertura e notícias', texto: 'Notícias, agenda e resultados apurados, com a velocidade que o esporte pede.', href: '/noticias', rotulo: 'Notícias' },
  { titulo: 'Galeria de imagens', texto: 'As melhores imagens da Arena. Baixe e compartilhe.', href: '/galeria', rotulo: 'Galeria' },
  { titulo: 'Projeto social', texto: 'O esporte como ferramenta de transformação social e de formação de jovens talentos.', href: '/projetosocial', rotulo: 'Comunidade' },
  { titulo: 'Parcerias e patrocínios', texto: 'Presença antes, durante e depois do jogo, para quem vive o esporte.', href: '/patrocinio', rotulo: 'Para marcas' },
];

const TEMPOS = [
  { titulo: 'Antes', texto: 'Agenda, expectativa e a preparação de cada equipe.' },
  { titulo: 'Durante', texto: 'Transmissão ao vivo, placar e os lances que decidem.' },
  { titulo: 'Depois', texto: 'Melhores momentos, entrevistas e análise do resultado.' },
];

/**
 * "Quem somos" + "O que fazemos" na página inicial. `fotos` (capas de álbuns e da home)
 * entram no fundo dos primeiros cartões; sem foto, o cartão fica no vidro com brilho vermelho.
 */
export function QuemSomos({ fotos }: { fotos: string[] }) {
  return (
    <section className="faixa quem-somos" id="quem-somos">
      <div className="dentro">
        <div className="qs-topo">
          <div className="qs-texto">
            <span className="chapeu-secao">Quem somos</span>
            <h2>
              Dar palco ao <em>esporte.</em>
            </h2>
            <p>
              Cada atleta, cada equipe e cada jogo merecem ser vistos. A ARENA VALE existe para colocar o esporte no centro do palco.
            </p>
            <Link href="/sobre" className="av-btn vidro">
              Conheça a ARENA VALE →
            </Link>
          </div>
          <ol className="qs-tempos" aria-label="Cada jogo tem três tempos">
            {TEMPOS.map((t, i) => (
              <li key={t.titulo} className="cartao-vidro">
                <span className="qs-num">0{i + 1}</span>
                <b>{t.titulo}</b>
                <span>{t.texto}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="cab cab-esq">
          <div>
            <span className="chapeu-secao">O que fazemos</span>
            <h2>Do apito inicial ao último lance.</h2>
          </div>
        </div>
        <ul className="servicos" aria-label="O que a ARENA VALE faz">
          {SERVICOS.map((s, i) => {
            const foto = fotos[i];
            return (
              <li key={s.href} className={`servico s${i + 1}${foto ? ' com-foto' : ''}`}>
                <Link href={s.href}>
                  {foto && (
                    // eslint-disable-next-line @next/next/no-img-element -- capas dos álbuns (Supabase)
                    <img src={foto} alt="" loading="lazy" />
                  )}
                  <span className="servico-rot">{s.rotulo}</span>
                  <span className="servico-txt">
                    <h3>{s.titulo}</h3>
                    <span>{s.texto}</span>
                  </span>
                  <span className="servico-seta" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
