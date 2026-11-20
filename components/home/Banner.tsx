import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ItemAgenda } from '@/lib/midia/agenda';

/** O mínimo de uma notícia que o cartão flutuante do banner precisa. */
type NoticiaBanner = { id: string; titulo: string; imagem_url: string | null; aba?: 'arena' | 'mundo' };

type Props = {
  capaUrl: string;
  whatsapp: string;
  proxima?: ItemAgenda | null;
  noticia?: NoticiaBanner | null;
};

/** "Qua 19/11 · 19:00" no horário de Brasília. */
function quando(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dia = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
    .format(d)
    .replace('.', '')
    .replace(',', '');
  const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(d);
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${hora}`;
}

/**
 * Banner da página inicial: texto e botões à esquerda; à direita, um "palco" em camadas —
 * a foto de capa num quadro em perspectiva, a logo e cartões de vidro flutuando à frente
 * (próxima transmissão e última notícia). As camadas se movem com a rolagem e o mouse
 * (ver EfeitosDaPagina); sem JavaScript ou com movimento reduzido, tudo fica parado.
 */
export function Banner({ capaUrl, whatsapp, proxima = null, noticia = null }: Props) {
  const estilo = { '--capa-img': `url("${capaUrl.replace(/"/g, '%22')}")` } as CSSProperties;
  const zap = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da ARENA VALE.')}`;
  return (
    <section className="hero hero-premium" id="inicio" style={estilo}>
      <div className="hero-fundo" aria-hidden="true">
        <span className="luz luz-1" />
        <span className="luz luz-2" />
        <span className="chao" />
      </div>
      <div className="cantos" aria-hidden="true" />

      <div className="dentro hero-grade">
        <div className="hero-texto">
          <h1>
            O palco do <em className="text-av-vermelho">esporte</em> é aqui.
          </h1>
          <p>Transmissões ao vivo, coberturas, informação, análises e histórias de quem vive o esporte.</p>
          <div className="botoes hero-botoes">
            <Link href="/ao-vivo" className="av-btn forte">
              <span className="ponto-vivo" aria-hidden="true" /> Assista ao vivo
            </Link>
            <Link href="/campeonatos" className="av-btn vidro">
              Ver campeonatos
            </Link>
            <a href={zap} className="av-btn leve" target="_blank" rel="noopener noreferrer">
              Fale com a gente
            </a>
          </div>
        </div>

        <div className="palco" data-palco>
          <div className="palco-foto camada" style={{ '--prof': 1 } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element -- capa do site_config (Supabase) */}
            <img src={capaUrl} alt="" fetchPriority="high" />
            <span className="brilho" aria-hidden="true" />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- logo oficial, sem alteração */}
          <img src="/logo-3d.png" alt="" className="palco-logo camada" style={{ '--prof': 2.4 } as CSSProperties} aria-hidden="true" />

          <div className="cartao-vidro palco-proxima camada" style={{ '--prof': 1.8 } as CSSProperties}>
            <span className="rotulo-vidro">
              <span className="ponto-vivo" aria-hidden="true" /> Próxima transmissão
            </span>
            {proxima ? (
              <>
                <strong>
                  {proxima.casa} × {proxima.fora}
                </strong>
                <small>{[proxima.modalidade, quando(proxima.dataHora)].filter(Boolean).join(' · ')}</small>
              </>
            ) : (
              <strong>Próxima transmissão a definir</strong>
            )}
          </div>

          {noticia && (
            <Link href={`/noticias/${noticia.id}`} className="cartao-vidro palco-noticia camada" style={{ '--prof': 2.8 } as CSSProperties}>
              {noticia.imagem_url && (
                // eslint-disable-next-line @next/next/no-img-element -- capa da notícia (Supabase)
                <img src={noticia.imagem_url} alt="" loading="lazy" />
              )}
              <span>
                <span className="rotulo-vidro">{noticia.aba === 'mundo' ? 'Esporte Mundial' : 'Notícias do Vale'}</span>
                <b>{noticia.titulo}</b>
              </span>
            </Link>
          )}

          <span className="palco-selo camada" style={{ '--prof': 3.2 } as CSSProperties} aria-hidden="true">
            <b>TV</b> Arena Vale
          </span>
        </div>
      </div>
    </section>
  );
}
