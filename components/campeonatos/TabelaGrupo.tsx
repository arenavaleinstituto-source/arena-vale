import type { LinhaTabela } from '@/lib/campeonatos/classificacao';
import type { TimeDaPagina } from '@/lib/campeonatos/busca';
import type { TipoPlacar } from '@/lib/campeonatos/tipos';
import { EscudoTime } from './EscudoTime';

type Props = { titulo?: string; linhas: LinhaTabela[]; times: Record<string, TimeDaPagina>; tipoPlacar: TipoPlacar; classificam: number };

const fmtMedia = (pro: number, contra: number) => (contra === 0 ? (pro > 0 ? '∞' : '0') : (pro / contra).toFixed(2));

/** Tabela de classificação de um grupo (ou do campeonato todo nos pontos corridos). */
export function TabelaGrupo({ titulo, linhas, times, tipoPlacar, classificam }: Props) {
  const sets = tipoPlacar === 'sets';
  const unidade = tipoPlacar === 'gols' ? 'Gols' : tipoPlacar === 'sets' ? 'Sets' : 'Cestas';
  const pendente = linhas.some((l) => l.aguardando_sorteio);
  return (
    <div className="grid gap-2">
      {titulo && <h3 className="font-display text-xl font-extrabold uppercase">{titulo}</h3>}
      <div className="overflow-x-auto rounded-xl border border-av-linha">
        <table className="w-full min-w-[520px] text-sm tabular-nums">
          <caption className="sr-only">{titulo ? `Classificação: ${titulo}` : 'Classificação'}</caption>
          <thead className="bg-av-grafite font-rotulo text-xs uppercase tracking-wider text-av-cinza">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">#</th>
              <th scope="col" className="px-3 py-2 text-left">Time</th>
              <th scope="col" className="px-2 py-2" title="Pontos">P</th>
              <th scope="col" className="px-2 py-2" title="Jogos">J</th>
              <th scope="col" className="px-2 py-2" title="Vitórias">V</th>
              {tipoPlacar === 'gols' && <th scope="col" className="px-2 py-2" title="Empates">E</th>}
              <th scope="col" className="px-2 py-2" title="Derrotas">D</th>
              <th scope="col" className="px-2 py-2" title={`${unidade} pró`}>{sets ? 'SP' : 'Pró'}</th>
              <th scope="col" className="px-2 py-2" title={`${unidade} contra`}>{sets ? 'SC' : 'Contra'}</th>
              <th scope="col" className="px-2 py-2" title="Saldo">Saldo</th>
              {sets && <th scope="col" className="px-2 py-2" title="Média de sets">Média</th>}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const t = times[l.time_id] ?? { nome: 'Time', sigla: null, escudo_url: null, escudo_cor: null };
              const classifica = l.posicao <= classificam;
              return (
                <tr key={l.time_id} className={`border-t border-av-linha ${classifica ? 'bg-av-vermelho/10' : ''}`}>
                  <td className={`px-3 py-2 font-display font-extrabold ${classifica ? 'border-l-4 border-av-vermelho' : 'border-l-4 border-transparent'}`}>{l.posicao}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <EscudoTime time={t} tamanho={24} />
                      <span className="font-bold">{t.nome}</span>
                      {l.aguardando_sorteio && <span className="text-av-amarelo" aria-hidden="true">*</span>}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-display font-extrabold">{l.pontos}</td>
                  <td className="px-2 py-2 text-center">{l.jogos}</td>
                  <td className="px-2 py-2 text-center">{l.vitorias}</td>
                  {tipoPlacar === 'gols' && <td className="px-2 py-2 text-center">{l.empates}</td>}
                  <td className="px-2 py-2 text-center">{l.derrotas}</td>
                  <td className="px-2 py-2 text-center">{l.pro}</td>
                  <td className="px-2 py-2 text-center">{l.contra}</td>
                  <td className="px-2 py-2 text-center">{l.saldo}</td>
                  {sets && <td className="px-2 py-2 text-center">{fmtMedia(l.sets_pro, l.sets_contra)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pendente && <p className="text-xs text-av-amarelo">* Empate, aguardando sorteio</p>}
    </div>
  );
}
