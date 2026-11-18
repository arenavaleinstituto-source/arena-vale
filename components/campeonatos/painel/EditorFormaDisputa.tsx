'use client';

import type { FormaDisputa, OpcoesMataMata, TipoPlacar } from '@/lib/campeonatos/tipos';
import { CAIXA, CAMPO, CAMPO_CURTO, ROTULO, TITULO_BLOCO } from './estilos';
import { FASES_DO_MATA, fasesEmIdaEVolta } from '@/lib/campeonatos/chave';

export const MATA_PADRAO: OpcoesMataMata = {
  ida_volta: false, final_ida_volta: false, terceiro_lugar: false, chave: 'sorteio',
  desempate: { prorrogacao: false, gol_fora: false, final: 'penaltis' }, sets_melhor_de: 3,
};

const TIPOS: { tipo: FormaDisputa['tipo']; rotulo: string }[] = [
  { tipo: 'pontos_corridos', rotulo: 'Pontos corridos' },
  { tipo: 'mata_mata', rotulo: 'Mata-mata' },
  { tipo: 'grupos_mata_mata', rotulo: 'Grupos + mata-mata' },
];

/** Forma nova ao trocar o tipo, aproveitando as opções do mata-mata que já existiam. */
function formaDoTipo(tipo: FormaDisputa['tipo'], atual: FormaDisputa): FormaDisputa {
  const mata = atual.mata ?? MATA_PADRAO;
  if (tipo === 'pontos_corridos') return { tipo, ida_volta: false, final_entre: null, mata: null };
  if (tipo === 'mata_mata') return { tipo, mata };
  return { tipo, grupos: 2, passam_por_grupo: 2, melhores_extras: 0, montagem: 'sorteio', ida_volta_grupos: false, mata };
}

const inteiro = (v: string, min: number) => Math.max(min, Math.floor(Number(v) || min));

type PropsMata = { mata: OpcoesMataMata; tipoPlacar: TipoPlacar; comChave: boolean; temCampanha: boolean; onChange: (m: OpcoesMataMata) => void };

function OpcoesDoMataMata({ mata, tipoPlacar, comChave, temCampanha, onChange }: PropsMata) {
  const muda = (p: Partial<OpcoesMataMata>) => onChange({ ...mata, ...p });
  const des = (p: Partial<OpcoesMataMata['desempate']>) => muda({ desempate: { ...mata.desempate, ...p } });
  const idaVolta = fasesEmIdaEVolta(mata);
  return (
    <fieldset className="grid gap-3 rounded-xl border border-av-linha p-4">
      <legend className={`px-2 ${TITULO_BLOCO}`}>Mata-mata</legend>
      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Jogo único ou ida e volta, fase a fase</span>
        <p className="text-xs text-av-cinza">Só as fases que o campeonato tiver são usadas (depende do número de times).</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FASES_DO_MATA.filter((f) => f !== 'Disputa de 3º lugar' || mata.terceiro_lugar).map((fase) => (
            <label key={fase} className={ROTULO}>
              {fase}
              <select
                className={CAMPO}
                value={idaVolta.includes(fase) ? 'ida_volta' : 'unico'}
                onChange={(e) => {
                  const marcadas = e.target.value === 'ida_volta' ? [...idaVolta, fase] : idaVolta.filter((f) => f !== fase);
                  muda({ ida_volta_fases: FASES_DO_MATA.filter((f) => marcadas.includes(f)) });
                }}
              >
                <option value="unico">Jogo único</option>
                <option value="ida_volta">Ida e volta</option>
              </select>
            </label>
          ))}
        </div>
      </div>
      <label className={CAIXA}>
        <input type="checkbox" checked={mata.terceiro_lugar} onChange={(e) => muda({ terceiro_lugar: e.target.checked })} />
        Disputa de 3º lugar
      </label>
      {comChave && (
        <label className={ROTULO}>
          Chave
          <select className={CAMPO} value={mata.chave} onChange={(e) => muda({ chave: e.target.value as OpcoesMataMata['chave'] })}>
            <option value="sorteio">Sorteada pelo site</option>
            <option value="manual">Montada à mão</option>
          </select>
        </label>
      )}
      {tipoPlacar === 'gols' && (
        <>
          <label className={CAIXA}>
            <input type="checkbox" checked={mata.desempate.prorrogacao} onChange={(e) => des({ prorrogacao: e.target.checked })} />
            Prorrogação no jogo único
          </label>
          {idaVolta.length > 0 && (
            <label className={CAIXA}>
              <input type="checkbox" checked={mata.desempate.gol_fora} onChange={(e) => des({ gol_fora: e.target.checked })} />
              Gol fora de casa
            </label>
          )}
          <label className={ROTULO}>
            Se continuar empatado
            <select className={CAMPO} value={mata.desempate.final} onChange={(e) => des({ final: e.target.value as 'penaltis' | 'melhor_campanha' })}>
              <option value="penaltis">Pênaltis</option>
              {temCampanha && <option value="melhor_campanha">Passa quem teve melhor campanha</option>}
            </select>
          </label>
        </>
      )}
      {tipoPlacar === 'sets' && (
        <label className={ROTULO}>
          Melhor de
          <select className={CAMPO} value={mata.sets_melhor_de} onChange={(e) => muda({ sets_melhor_de: Number(e.target.value) === 5 ? 5 : 3 })}>
            <option value={3}>3 sets</option>
            <option value={5}>5 sets</option>
          </select>
        </label>
      )}
      {tipoPlacar === 'sets' && <p className="text-xs text-av-cinza">Na ida e volta, se cada time vencer um jogo, vale o set de ouro.</p>}
      {tipoPlacar === 'cestas' && <p className="text-xs text-av-cinza">No basquete não há empate: a prorrogação entra no placar.</p>}
    </fieldset>
  );
}

type Props = { valor: FormaDisputa; tipoPlacar: TipoPlacar; travada: boolean; temCampanha: boolean; onChange: (f: FormaDisputa) => void };

/** Escolha da forma de disputa e das opções de cada uma (spec 4.1). */
export function EditorFormaDisputa({ valor, tipoPlacar, travada, temCampanha, onChange }: Props) {
  const campanha = temCampanha && valor.tipo !== 'mata_mata';
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Forma de disputa">
        {TIPOS.map((t) => (
          <button
            key={t.tipo}
            type="button"
            disabled={travada && t.tipo !== valor.tipo}
            aria-pressed={valor.tipo === t.tipo}
            onClick={() => t.tipo !== valor.tipo && onChange(formaDoTipo(t.tipo, valor))}
            className={`rounded-full border px-4 py-2 font-rotulo text-sm font-bold uppercase tracking-wider disabled:opacity-40 ${valor.tipo === t.tipo ? 'border-av-vermelho bg-av-vermelho text-white' : 'border-av-linha text-av-cinza'}`}
          >
            {t.rotulo}
          </button>
        ))}
      </div>
      {travada && <p className="rounded-xl border border-av-amarelo/40 bg-av-amarelo/10 px-4 py-3 text-sm text-av-amarelo">Já há resultados: só as fases que ainda não começaram podem mudar.</p>}

      {valor.tipo === 'pontos_corridos' && (
        <div className="grid gap-3">
          <label className={CAIXA}>
            <input type="checkbox" checked={valor.ida_volta} onChange={(e) => onChange({ ...valor, ida_volta: e.target.checked })} />
            Ida e volta (returno com mando invertido)
          </label>
          <label className={CAIXA}>
            <input
              type="checkbox"
              checked={valor.final_entre != null}
              onChange={(e) => onChange({ ...valor, final_entre: e.target.checked ? 4 : null, mata: e.target.checked ? (valor.mata ?? MATA_PADRAO) : null })}
            />
            Final entre os primeiros colocados
          </label>
          {valor.final_entre != null && (
            <>
              <label className={ROTULO}>
                Quantos vão para a final
                <input type="number" min={2} className={CAMPO_CURTO} value={valor.final_entre} onChange={(e) => onChange({ ...valor, final_entre: inteiro(e.target.value, 2) })} />
              </label>
              <OpcoesDoMataMata mata={valor.mata ?? MATA_PADRAO} tipoPlacar={tipoPlacar} comChave={false} temCampanha={campanha} onChange={(m) => onChange({ ...valor, mata: m })} />
            </>
          )}
        </div>
      )}

      {valor.tipo === 'mata_mata' && (
        <OpcoesDoMataMata mata={valor.mata} tipoPlacar={tipoPlacar} comChave temCampanha={false} onChange={(m) => onChange({ ...valor, mata: m })} />
      )}

      {valor.tipo === 'grupos_mata_mata' && (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-4">
            <label className={ROTULO}>
              Quantidade de grupos
              <input type="number" min={1} className={CAMPO_CURTO} value={valor.grupos} onChange={(e) => onChange({ ...valor, grupos: inteiro(e.target.value, 1) })} />
            </label>
            <label className={ROTULO}>
              Passam por grupo
              <input type="number" min={1} className={CAMPO_CURTO} value={valor.passam_por_grupo} onChange={(e) => onChange({ ...valor, passam_por_grupo: inteiro(e.target.value, 1) })} />
            </label>
            <label className={ROTULO}>
              Melhores colocados extras
              <input type="number" min={0} className={CAMPO_CURTO} value={valor.melhores_extras} onChange={(e) => onChange({ ...valor, melhores_extras: inteiro(e.target.value, 0) })} />
            </label>
          </div>
          <label className={ROTULO}>
            Montagem dos grupos
            <select className={CAMPO} value={valor.montagem} onChange={(e) => onChange({ ...valor, montagem: e.target.value as typeof valor.montagem })}>
              <option value="sorteio">Sorteados pelo site</option>
              <option value="sorteio_cabecas">Sorteados, com cabeças de chave</option>
              <option value="manual">Montados à mão</option>
            </select>
          </label>
          <label className={CAIXA}>
            <input type="checkbox" checked={valor.ida_volta_grupos} onChange={(e) => onChange({ ...valor, ida_volta_grupos: e.target.checked })} />
            Ida e volta dentro do grupo
          </label>
          <p className="text-xs text-av-cinza">O cruzamento do mata-mata é olímpico (1º A x 2º B, 1º B x 2º A…).</p>
          <OpcoesDoMataMata mata={valor.mata} tipoPlacar={tipoPlacar} comChave={false} temCampanha={campanha} onChange={(m) => onChange({ ...valor, mata: m })} />
        </div>
      )}
    </div>
  );
}
