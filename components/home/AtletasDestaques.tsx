import type { Destaque } from '@/lib/content/tipos';
import { Cartaz } from '@/components/midia/Cartaz';
import { Faixa } from '@/components/midia/Faixa';
import { Fileira } from '@/components/midia/Fileira';

/** "Atletas Destaques" (spec Fase 3, seção 5, bloco 9). */
export function AtletasDestaques({ destaques }: { destaques: Destaque[] }) {
  return (
    <Faixa
      id="atletas"
      titulo="Atletas Destaques"
      subtitulo="Quem brilhou em quadra e no campo — o jogo não termina no placar."
      verTodos={{ href: '/atletasdestaques' }}
    >
      {destaques.length === 0 ? (
        <p className="vazio">Em breve os destaques da temporada.</p>
      ) : (
        <Fileira rotulo="Atletas Destaques">
          {destaques.map((d) => (
            <Cartaz
              key={d.id}
              href="/atletasdestaques"
              titulo={d.nome}
              imagem={d.imagem_url}
              selo="ATLETA DESTAQUE"
              chapeu={[d.modalidade, d.equipe].filter(Boolean).join(' · ')}
            />
          ))}
        </Fileira>
      )}
    </Faixa>
  );
}
