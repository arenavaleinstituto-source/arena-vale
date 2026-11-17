'use client';

import { criteriosDisponiveis, pontuacaoPadrao, validarRegulamento } from '@/lib/campeonatos/regulamento';
import { fraseCriterio } from '@/lib/campeonatos/texto';
import type { Criterio, Pontuacao, Regulamento, TipoPlacar } from '@/lib/campeonatos/tipos';
import { CAIXA, CAMPO, CAMPO_CURTO, ROTULO, TITULO_BLOCO } from './estilos';

const UNIDADE: Record<TipoPlacar, string> = { gols: 'gols', sets: 'sets', cestas: 'cestas' };
const NOME_PLACAR: Record<TipoPlacar, string> = { gols: 'Gols', sets: 'Sets (vôlei)', cestas: 'Cestas (basquete)' };

const CAMPOS_PONTUACAO: Record<Pontuacao['tipo'], [string, string][]> = {
  gols: [['vitoria', 'Vitória'], ['empate', 'Empate'], ['derrota', 'Derrota']],
  sets: [['vitoria_direta', 'Vitória sem o set decisivo'], ['vitoria_decisivo', 'Vitória no set decisivo'], ['derrota_decisivo', 'Derrota no set decisivo'], ['derrota', 'Outras derrotas']],
  cestas: [['vitoria', 'Vitória'], ['derrota', 'Derrota']],
};

const numero = (v: string) => Math.max(0, Math.floor(Number(v) || 0));

/** Regulamento do campeonato: placar, pontuação, critérios de desempate em ordem, W.O. e regras adicionais (spec 4.2). */
export function EditorRegulamento({ valor, onChange }: { valor: Regulamento; onChange: (r: Regulamento) => void }) {
  const u = UNIDADE[valor.tipo_placar];
  const disponiveis = criteriosDisponiveis(valor.tipo_placar);
  const desligados = disponiveis.filter((c) => !valor.criterios.includes(c));
  const erro = validarRegulamento(valor);
  const muda = (p: Partial<Regulamento>) => onChange({ ...valor, ...p });

  function mover(i: number, d: -1 | 1) {
    const lista = [...valor.criterios];
    [lista[i], lista[i + d]] = [lista[i + d], lista[i]];
    muda({ criterios: lista });
  }
  /** Ligar põe o critério no fim da lista, mas antes do sorteio (que precisa ser o último). */
  function ligar(c: Criterio, ligado: boolean) {
    if (!ligado) return muda({ criterios: valor.criterios.filter((x) => x !== c) });
    const semSorteio = valor.criterios.filter((x) => x !== 'sorteio');
    const temSorteio = valor.criterios.includes('sorteio') || c === 'sorteio';
    muda({ criterios: [...semSorteio, ...(c === 'sorteio' ? [] : [c]), ...(temSorteio ? (['sorteio'] as Criterio[]) : [])] });
  }
  function trocarPlacar(t: TipoPlacar) {
    const criterios = valor.criterios.filter((c) => criteriosDisponiveis(t).includes(c));
    muda({ tipo_placar: t, pontuacao: pontuacaoPadrao(t), criterios: criterios.length ? criterios : ['vitorias', 'saldo', 'sorteio'] });
  }

  return (
    <div className="grid gap-5">
      <label className={ROTULO}>
        Tipo de placar
        <select className={CAMPO} value={valor.tipo_placar} onChange={(e) => trocarPlacar(e.target.value as TipoPlacar)}>
          {(Object.keys(NOME_PLACAR) as TipoPlacar[]).map((t) => (
            <option key={t} value={t}>
              {NOME_PLACAR[t]}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="grid gap-3">
        <legend className={TITULO_BLOCO}>Pontuação</legend>
        <div className="flex flex-wrap gap-4">
          {CAMPOS_PONTUACAO[valor.pontuacao.tipo].map(([k, rotulo]) => (
            <label key={k} className={ROTULO}>
              {rotulo}
              <input
                type="number"
                min={0}
                className={CAMPO_CURTO}
                value={(valor.pontuacao as Record<string, number | string>)[k] as number}
                onChange={(e) => muda({ pontuacao: { ...valor.pontuacao, [k]: numero(e.target.value) } as Pontuacao })}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className={TITULO_BLOCO}>Critérios de desempate (em ordem)</legend>
        <ol className="grid gap-2">
          {valor.criterios.map((c, i) => {
            const frase = fraseCriterio(c, u);
            return (
              <li key={c} className="flex items-center gap-2 rounded-xl border border-av-linha bg-av-grafite-2 px-3 py-2">
                <span className="w-6 font-display font-extrabold text-av-vermelho">{i + 1}º</span>
                <label className={`${CAIXA} flex-1`}>
                  <input type="checkbox" checked onChange={() => ligar(c, false)} aria-label={frase} />
                  {frase}
                </label>
                <button type="button" aria-label={`Subir ${frase}`} disabled={i === 0} onClick={() => mover(i, -1)} className="btn-leve px-3 py-1 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" aria-label={`Descer ${frase}`} disabled={i === valor.criterios.length - 1} onClick={() => mover(i, 1)} className="btn-leve px-3 py-1 disabled:opacity-30">
                  ↓
                </button>
              </li>
            );
          })}
          {desligados.map((c) => {
            const frase = fraseCriterio(c, u);
            return (
              <li key={c} className="flex items-center gap-2 rounded-xl border border-dashed border-av-linha px-3 py-2 opacity-70">
                <span className="w-6" />
                <label className={`${CAIXA} flex-1`}>
                  <input type="checkbox" checked={false} onChange={() => ligar(c, true)} aria-label={frase} />
                  {frase}
                </label>
              </li>
            );
          })}
        </ol>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className={TITULO_BLOCO}>Placar do W.O.</legend>
        <div className="flex items-center gap-2">
          <input type="number" min={0} aria-label="Placar do vencedor no W.O." className={CAMPO_CURTO} value={valor.wo_placar.vencedor} onChange={(e) => muda({ wo_placar: { ...valor.wo_placar, vencedor: numero(e.target.value) } })} />
          <span className="text-av-cinza">x</span>
          <input type="number" min={0} aria-label="Placar de quem faltou no W.O." className={CAMPO_CURTO} value={valor.wo_placar.perdedor} onChange={(e) => muda({ wo_placar: { ...valor.wo_placar, perdedor: numero(e.target.value) } })} />
        </div>
      </fieldset>

      <label className={ROTULO}>
        Regras adicionais
        <textarea className={CAMPO} rows={5} maxLength={3000} value={valor.regras_adicionais} placeholder="Inscrição, uniforme, tolerância de horário…" onChange={(e) => muda({ regras_adicionais: e.target.value })} />
      </label>

      {erro && (
        <p role="alert" className="rounded-xl border border-av-vermelho/50 bg-av-vermelho/10 px-4 py-3 text-sm text-av-vermelho-claro">
          {erro}
        </p>
      )}
    </div>
  );
}
