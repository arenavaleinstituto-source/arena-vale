import Link from 'next/link';
import type { ReactNode } from 'react';

export const IMPACTO_SOCIAL = [
  { valor: '+1.200', rotulo: 'Jovens beneficiados' },
  { valor: '20 anos', rotulo: 'De histórico e dedicação' },
  { valor: '15+', rotulo: 'Comunidades atendidas' },
  { valor: '100%', rotulo: 'Gratuito para os atletas' },
];

export const INICIATIVAS_SOCIAIS = [
  { icone: '⚽', titulo: 'Inclusão através do esporte', texto: 'Garantimos acesso gratuito a treinos e campeonatos para centenas de jovens em situação de vulnerabilidade.' },
  { icone: '📚', titulo: 'Educação e cidadania', texto: 'Aliamos a prática esportiva ao acompanhamento escolar e a valores fundamentais de disciplina e respeito.' },
  { icone: '🏟️', titulo: 'Infraestrutura comunitária', texto: 'Projetos de melhoria em pistas e espaços públicos para a prática de atletismo e futebol.' },
];

type Props = { whatsapp: string; resultados?: ReactNode; titulo?: 'h1' | 'h2'; id?: string; children?: ReactNode };

/** Bloco do Projeto Social (home e página /projetosocial). `children` entra antes do apoio. */
export function ProjetoSocialHome({ whatsapp, resultados, titulo = 'h2', id = 'projetosocial', children }: Props) {
  const Titulo = titulo;
  const apoiar = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero apoiar o Projeto Social da ARENA VALE.')}`;
  return (
    <section className="faixa social" id={id}>
      <div className="dentro">
        <div className="intro">
          <span className="selo">Responsabilidade social</span>
          <Titulo>Projeto Social ARENA VALE</Titulo>
          <p>O esporte como ferramenta de transformação social, apoio à formação de jovens talentos e integração comunitária no Vale.</p>
        </div>
        <div className="impacto">
          {IMPACTO_SOCIAL.map((i) => (
            <div key={i.rotulo}>
              <b>{i.valor}</b>
              <span>{i.rotulo}</span>
            </div>
          ))}
        </div>
        <div className="iniciativas">
          {INICIATIVAS_SOCIAIS.map((i) => (
            <div className="ini" key={i.titulo}>
              <span className="ic" aria-hidden="true">
                {i.icone}
              </span>
              <h3>{i.titulo}</h3>
              <p>{i.texto}</p>
            </div>
          ))}
        </div>
        {resultados}
        {children}
        <div className="apoio">
          <h3>Quer apoiar o nosso projeto social?</h3>
          <p>Junte-se a nós como parceiro ou patrocinador e ajude a expandir o acesso ao esporte para mais crianças e atletas da região.</p>
          <div className="botoes">
            <a href={apoiar} className="av-btn forte" target="_blank" rel="noopener noreferrer">
              Apoiar o projeto social
            </a>
            <Link href="/patrocinio" className="av-btn forte">
              Conhecer cotas de patrocínio
            </Link>
            <Link href="/inscricao" className="av-btn forte">
              Inscrever criança / atleta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
