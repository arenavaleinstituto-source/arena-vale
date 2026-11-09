import type { AtletaPublico } from '@/lib/atletas/colunas';

/** Elenco público de uma equipe: o CPF aparece só mascarado ("529..."), calculado pelo banco (0013). */
export function ElencoEquipe({ atletas }: { atletas: AtletaPublico[] }) {
  if (atletas.length === 0) return <p className="vazio">Elenco ainda não cadastrado pelo capitão.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {atletas.map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-av-linha bg-av-grafite-2 p-3">
          {a.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- fotos enviadas pelos capitães
            <img src={a.foto_url} alt={a.nome} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/10 font-display text-lg font-black">
              {a.nome.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <strong className="block truncate font-display uppercase">{a.nome}</strong>
            {(a.numero_camisa != null || a.posicao) && (
              <small className="block text-av-cinza">{[a.numero_camisa != null ? `#${a.numero_camisa}` : null, a.posicao].filter(Boolean).join(' · ')}</small>
            )}
            {a.cpf_mascarado && <small className="block text-av-cinza">CPF {a.cpf_mascarado}</small>}
          </span>
        </li>
      ))}
    </ul>
  );
}
