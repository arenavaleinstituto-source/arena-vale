import type { LinhaClassificacao } from '@/lib/midia/campeonatos';

/** Classificação calculada pelo banco (v_classificacao): nunca editada à mão. */
export function TabelaClassificacao({ linhas }: { linhas: LinhaClassificacao[] }) {
  if (linhas.length === 0) return <p className="mt-3 text-sm text-av-cinza">A classificação aparece depois dos primeiros jogos.</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left font-rotulo text-xs uppercase tracking-widest text-av-cinza">
            <th className="py-2 pr-2">#</th>
            <th className="py-2">Equipe</th>
            {['P', 'J', 'V', 'E', 'D', 'SG'].map((h) => (
              <th key={h} className="py-2 text-center">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={l.time_id} className="border-t border-av-linha">
              <td className="py-2 pr-2 font-display font-extrabold text-av-vermelho">{i + 1}</td>
              <td className="py-2 font-bold">{l.time_nome}</td>
              <td className="py-2 text-center font-display font-extrabold">{l.pontos}</td>
              <td className="py-2 text-center">{l.jogos}</td>
              <td className="py-2 text-center">{l.vitorias}</td>
              <td className="py-2 text-center">{l.empates}</td>
              <td className="py-2 text-center">{l.derrotas}</td>
              <td className="py-2 text-center">{l.saldo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
