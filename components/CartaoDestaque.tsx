import type { Destaque } from '@/lib/content';
import { imagemDestaque } from '@/lib/content';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  CARTÃO DE DESTAQUE (atleta) — componente único do padrão editorial
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Mesma ideia do CartaoComunicado: a galeria /atletasdestaques e a Home
 *  mostram o MESMO cartão, com os MESMOS dados.
 *
 *  Antes, a galeria mostrava GABRIEL MENDES com avatar de placeholder e a
 *  Home mostrava o mesmo atleta com foto real — e, pior, a galeria lia
 *  colunas (`nome`, `imagem_url`) que não existem no banco, então ela
 *  NUNCA exibia os atletas publicados.
 *
 *  @see lib/content — tipos, vocabulário e normalização
 */

interface CartaoDestaqueProps {
  destaque: Destaque;
  /** Rótulo do destaque quando não há campeonato preenchido. */
  className?: string;
}

export default function CartaoDestaque({ destaque, className = '' }: CartaoDestaqueProps) {
  const temEstatisticas = Boolean(destaque.jogos || destaque.gols_ou_pontos || destaque.assistencias);

  return (
    <article
      className={`group relative rounded-[2rem] border border-white/10 bg-[#11141d] p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#e50914]/60 hover:-translate-y-1.5 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#11141d]/80 to-transparent opacity-90" />

      {/* Foto do atleta */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagemDestaque(destaque)}
        alt={destaque.nome}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-45 transition duration-500"
      />

      <div className="relative z-10">
        <span className="inline-block rounded-full bg-[#e50914] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-4 shadow-md">
          {destaque.modalidade}
        </span>

        {destaque.campeonato && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-400">
            {destaque.campeonato}
          </p>
        )}

        <h3 className="text-2xl font-black uppercase text-white tracking-tight mt-1">
          {destaque.nome}
        </h3>

        {destaque.equipe && (
          <p className="text-xs text-[#cad0e0] uppercase mt-1">{destaque.equipe}</p>
        )}
      </div>

      {temEstatisticas && (
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <span className="block text-base font-black text-white">{destaque.jogos || '—'}</span>
            <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Jogos</span>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <span className="block text-base font-black text-[#e50914]">
              {destaque.gols_ou_pontos || '—'}
            </span>
            <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Gols/Pts</span>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <span className="block text-base font-black text-white">
              {destaque.assistencias || '—'}
            </span>
            <span className="text-[9px] font-black text-[#8a92a6] uppercase tracking-wider">Assist.</span>
          </div>
        </div>
      )}
    </article>
  );
}
