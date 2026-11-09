import Link from 'next/link';
import { Faixa } from '@/components/midia/Faixa';
import { Fileira } from '@/components/midia/Fileira';
import { ordenarPorCota, type PatrocinadorSite } from '@/lib/midia/patrocinadores';

function Cartao({ p }: { p: PatrocinadorSite }) {
  const conteudo = (
    <>
      <span className="logo">
        {p.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- logos enviados pela coordenação
          <img src={p.logo_url} alt={p.nome} loading="lazy" />
        ) : (
          <b style={{ color: p.logo_cor || '#e50914' }}>{p.logo_initials || p.nome.slice(0, 4).toUpperCase()}</b>
        )}
      </span>
      <span className="info">
        <h3>{p.nome}</h3>
        <small>Cota {p.cota}</small>
      </span>
    </>
  );
  if (p.site_url) {
    return (
      <a href={p.site_url} className="patro" target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }
  return (
    <Link href="/patrocinio" className="patro">
      {conteudo}
    </Link>
  );
}

/** "Patrocinadores" na página inicial: fileira como as notícias, com mais espaço entre os cartões. */
export function Patrocinadores({ patrocinadores }: { patrocinadores: PatrocinadorSite[] }) {
  const lista = ordenarPorCota(patrocinadores);
  return (
    <Faixa id="patrocinadores" titulo="Patrocinadores" subtitulo="Marcas que jogam junto com a ARENA VALE." alt verTodos={{ href: '/patrocinio', rotulo: 'Seja um patrocinador →' }}>
      {lista.length === 0 ? (
        <p className="vazio">As primeiras marcas parceiras aparecem aqui.</p>
      ) : (
        <div className="patros">
          <Fileira rotulo="Patrocinadores">
            {lista.map((p) => (
              <Cartao key={p.id} p={p} />
            ))}
          </Fileira>
        </div>
      )}
    </Faixa>
  );
}
