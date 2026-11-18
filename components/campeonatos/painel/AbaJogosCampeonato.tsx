'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { classificar } from '@/lib/campeonatos/classificacao';
import { rotuloDaVaga } from '@/lib/campeonatos/vagas';
import type { JogoCalc, Regulamento, Sorteios, Vaga } from '@/lib/campeonatos/tipos';
import { FormResultado, type ValoresResultado } from '@/components/moderador/FormResultado';
import { recalcularVagas } from './api';
import { CAMPO, ROTULO, TITULO_BLOCO } from './estilos';

export type JogoDoPainel = JogoCalc & { data: string | null; local: string | null; delegado_id: string | null };
type Correcao = { jogo_id: string; corrigido_em: string; corrigido_por: string | null; antes: Record<string, unknown>; depois: Record<string, unknown> };

type Props = {
  campeonato: { id: string; regulamento: Regulamento; ordem_sorteio: Sorteios };
  jogos: JogoDoPainel[];
  times: Record<string, { nome: string }>;
  grupos: Record<string, string[]>;
  ehCoordenacao: boolean;
  delegados: { id: string; nome: string }[];
  onMudou: () => void;
};

const DE_TABELA = new Set(['Pontos corridos', 'Fase de grupos']);
const UNIDADE = { gols: 'Gols', sets: 'Sets', cestas: 'Pontos' } as const;

/** "2026-11-20T19:30:00" ↔ valor do <input type="datetime-local"> (horário de Brasília, sem fuso). */
const paraInput = (d: string | null) => (d ? d.slice(0, 16) : '');
const doInput = (v: string) => (v ? `${v}:00` : null);

function quandoCorrigido(iso: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}/${p.month} às ${p.hour}:${p.minute}`;
}

function resumo(v: Record<string, unknown>): string {
  const pen = v.penaltis_casa != null ? ` (${v.penaltis_casa} x ${v.penaltis_visitante})` : '';
  const wo = v.wo ? ` · W.O. ${v.wo === 'casa' ? 'mandante' : 'visitante'}` : '';
  return `${v.placar_casa ?? '-'} x ${v.placar_visitante ?? '-'}${pen}${wo}`;
}

/** Jogos do campeonato no painel: datas, resultados, W.O., desempate, vagas, sorteio, delegado e correção. */
export function AbaJogosCampeonato({ campeonato, jogos, times, grupos, ehCoordenacao, delegados, onMudou }: Props) {
  const sb = createClient();
  const [avisos, setAvisos] = useState<string[]>([]);
  const [correcoes, setCorrecoes] = useState<Correcao[]>([]);
  const r = campeonato.regulamento;

  useEffect(() => {
    // O registro das correções é só da coordenação: o moderador nem consulta a tabela.
    if (!ehCoordenacao || !jogos.length) return;
    let vivo = true;
    void (async () => {
      const { data } = await sb.from('correcoes_jogo').select('jogo_id,corrigido_em,corrigido_por,antes,depois').in('jogo_id', jogos.map((j) => j.id)).order('corrigido_em', { ascending: false });
      if (vivo) setCorrecoes((data ?? []) as Correcao[]);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega quando a lista de jogos muda
  }, [ehCoordenacao, jogos]);

  async function depoisDeGravar() {
    setAvisos(await recalcularVagas(campeonato.id));
    onMudou();
  }

  const ordens = new Map(jogos.filter((j) => j.ordem != null).map((j) => [j.ordem as number, { fase: j.fase ?? '', volta: j.jogo_volta_de != null }]));
  const nome = (t: string | null, v: Vaga | null) => (t ? (times[t]?.nome ?? 'Time') : v ? rotuloDaVaga(v, ordens) : 'A definir');

  // Empates aguardando sorteio (pontos corridos e grupos).
  const pendentes: { chave: string; titulo: string; ids: string[] }[] = [];
  const tabelas: [string, string, string[], JogoDoPainel[]][] =
    r.forma.tipo === 'pontos_corridos'
      ? [['geral', 'Classificação geral', Object.keys(times), jogos.filter((j) => j.fase === 'Pontos corridos')]]
      : Object.keys(grupos).sort().map((g) => [`grupo:${g}`, `Grupo ${g}`, grupos[g], jogos.filter((j) => j.fase === 'Fase de grupos' && j.grupo === g)]);
  for (const [chave, titulo, ids, js] of tabelas) {
    const linhas = classificar(ids, js, r, campeonato.ordem_sorteio[chave]);
    const empatados = linhas.filter((l) => l.aguardando_sorteio).map((l) => l.time_id);
    if (empatados.length) pendentes.push({ chave, titulo, ids: empatados });
  }

  // Blocos por rodada (tabela) ou por fase (mata-mata).
  const blocos: { titulo: string; jogos: JogoDoPainel[] }[] = [];
  for (const j of jogos) {
    const titulo = j.fase && DE_TABELA.has(j.fase) ? `Rodada ${j.rodada ?? '—'}` : (j.fase ?? 'Jogos');
    let b = blocos.find((x) => x.titulo === titulo);
    if (!b) blocos.push((b = { titulo, jogos: [] }));
    b.jogos.push(j);
  }

  return (
    <div className="grid gap-6">
      {avisos.length > 0 && (
        <div role="status" className="grid gap-1 rounded-xl border border-av-amarelo/40 bg-av-amarelo/10 px-4 py-3 text-sm text-av-amarelo">
          {avisos.map((a) => (
            <p key={a}>{a}</p>
          ))}
        </div>
      )}
      {pendentes.map((p) => (
        <RegistrarSorteio key={p.chave} {...p} times={times} onSalvar={async (ordem) => {
          const { error } = await sb.from('campeonatos').update({ ordem_sorteio: { ...campeonato.ordem_sorteio, [p.chave]: ordem } }).eq('id', campeonato.id);
          if (!error) await depoisDeGravar();
        }} />
      ))}
      {jogos.length === 0 && <p className="text-av-cinza">Os jogos aparecem aqui depois de gerados.</p>}
      {blocos.map((b) => (
        <section key={b.titulo} className="grid gap-3">
          <h3 className="font-display text-xl font-extrabold uppercase">{b.titulo}</h3>
          {b.jogos.map((j) => (
            <JogoNoPainel
              key={j.id}
              jogo={j}
              jogos={jogos}
              campeonatoId={campeonato.id}
              regulamento={r}
              nomeCasa={nome(j.casa, j.vaga_casa)}
              nomeFora={nome(j.visitante, j.vaga_visitante)}
              times={times}
              ehCoordenacao={ehCoordenacao}
              delegados={delegados}
              correcao={correcoes.find((c) => c.jogo_id === j.id) ?? null}
              historico={correcoes.filter((c) => c.jogo_id === j.id)}
              onGravou={depoisDeGravar}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function RegistrarSorteio({ titulo, ids, times, onSalvar }: { titulo: string; ids: string[]; times: Record<string, { nome: string }>; onSalvar: (ordem: string[]) => Promise<void> }) {
  const [ordem, setOrdem] = useState(ids);
  const mover = (i: number, d: -1 | 1) => setOrdem((l) => { const n = [...l]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });
  return (
    <div className="grid gap-2 rounded-xl border border-av-amarelo/40 p-4">
      <span className={TITULO_BLOCO}>Empate aguardando sorteio — {titulo}</span>
      <p className="text-xs text-av-cinza">Faça o sorteio e deixe os times na ordem sorteada (o primeiro fica à frente).</p>
      <ol className="grid gap-1">
        {ordem.map((id, i) => (
          <li key={id} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-av-cinza">{i + 1}º</span>
            <span className="flex-1">{times[id]?.nome ?? 'Time'}</span>
            <button type="button" className="btn-leve px-3 py-1 disabled:opacity-30" disabled={i === 0} aria-label={`Subir ${times[id]?.nome}`} onClick={() => mover(i, -1)}>↑</button>
            <button type="button" className="btn-leve px-3 py-1 disabled:opacity-30" disabled={i === ordem.length - 1} aria-label={`Descer ${times[id]?.nome}`} onClick={() => mover(i, 1)}>↓</button>
          </li>
        ))}
      </ol>
      <button type="button" className="btn-forte w-fit" onClick={() => onSalvar(ordem)}>Salvar resultado do sorteio</button>
    </div>
  );
}

type PropsJogo = {
  jogo: JogoDoPainel;
  jogos: JogoDoPainel[];
  campeonatoId: string;
  regulamento: Regulamento;
  nomeCasa: string;
  nomeFora: string;
  times: Record<string, { nome: string }>;
  ehCoordenacao: boolean;
  delegados: { id: string; nome: string }[];
  correcao: Correcao | null;
  historico: Correcao[];
  onGravou: () => Promise<void>;
};

function JogoNoPainel({ jogo, jogos, campeonatoId, regulamento: r, nomeCasa, nomeFora, times, ehCoordenacao, delegados, correcao, historico, onGravou }: PropsJogo) {
  const sb = createClient();
  const [data, setData] = useState(paraInput(jogo.data));
  const [local, setLocal] = useState(jogo.local ?? '');
  const [msg, setMsg] = useState('');
  const [wo, setWo] = useState(false);
  const [corrigindo, setCorrigindo] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);
  const [trocaCasa, setTrocaCasa] = useState('');
  const [trocaFora, setTrocaFora] = useState('');
  const [manual, setManual] = useState(jogo.vaga_manual);

  const comTimes = Boolean(jogo.casa && jogo.visitante);
  const encerrado = jogo.status === 'finalizado';
  const mataMata = Boolean(jogo.fase && !DE_TABELA.has(jogo.fase));
  const ida = jogo.jogo_volta_de ? jogos.find((x) => x.id === jogo.jogo_volta_de) ?? null : null;
  const temVolta = jogos.some((x) => x.jogo_volta_de === jogo.id);
  const desempate = mataMata && !temVolta ? (r.tipo_placar === 'gols' ? 'Pênaltis' : r.tipo_placar === 'sets' ? 'Set de ouro' : null) : null;

  /** Empate no confronto: no jogo único, placar igual; na volta, soma igual (sets: um jogo para cada). */
  function empatou(pc: number, pf: number): boolean {
    if (!ida) return pc === pf;
    // Placar da ida de cada time deste jogo (na volta o mando é invertido).
    const casaInverteu = ida.casa === jogo.visitante;
    const idaDaCasaAgora = casaInverteu ? (ida.placar_visitante ?? 0) : (ida.placar_casa ?? 0);
    const idaDaForaAgora = casaInverteu ? (ida.placar_casa ?? 0) : (ida.placar_visitante ?? 0);
    // Sets: cada time venceu um jogo → set de ouro.
    if (r.tipo_placar === 'sets') return pc !== pf && Math.sign(pc - pf) === Math.sign(idaDaForaAgora - idaDaCasaAgora);
    return pc + idaDaCasaAgora === pf + idaDaForaAgora;
  }

  async function gravar(mudanca: Record<string, unknown>, filtro?: { rodada: number }) {
    setMsg('');
    let q = sb.from('jogos').update(mudanca);
    // Na rodada inteira, os jogos já disputados (ou em andamento) mantêm a data em que aconteceram.
    q = filtro ? q.eq('campeonato_id', campeonatoId).eq('rodada', filtro.rodada).not('status', 'in', '("finalizado","ao_vivo")') : q.eq('id', jogo.id);
    const { error } = await q;
    if (error) {
      setMsg(error.message);
      return false;
    }
    await onGravou();
    return true;
  }

  async function marcarWo(faltou: 'casa' | 'visitante') {
    const v = r.wo_placar;
    await gravar({ wo: faltou, placar_casa: faltou === 'casa' ? v.perdedor : v.vencedor, placar_visitante: faltou === 'casa' ? v.vencedor : v.perdedor, status: 'finalizado' });
    setWo(false);
  }

  async function trocar() {
    const m: Record<string, unknown> = {};
    if (trocaCasa) m.time_casa_id = trocaCasa;
    if (trocaFora) m.time_visitante_id = trocaFora;
    if (!Object.keys(m).length) return;
    if (await gravar({ ...m, vaga_manual: true })) setManual(true);
  }

  const titulo = `${nomeCasa} × ${nomeFora}`;
  const listaTimes = Object.entries(times).sort((a, b) => a[1].nome.localeCompare(b[1].nome));

  return (
    <fieldset aria-label={titulo} className="grid gap-3 rounded-2xl border border-av-linha bg-av-grafite-2 p-4">
      <legend className="px-2 text-sm font-black uppercase">{titulo}</legend>
      <p className="font-rotulo text-xs font-bold uppercase tracking-wider text-av-cinza">
        {[jogo.ordem ? `Jogo ${jogo.ordem}` : null, jogo.grupo ? `Grupo ${jogo.grupo}` : null, ida ? 'Volta' : temVolta ? 'Ida' : null, encerrado ? 'Encerrado' : null].filter(Boolean).join(' · ')}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className={ROTULO}>
          Data e hora
          <input type="datetime-local" className={CAMPO} value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label className={`${ROTULO} min-w-40 flex-1`}>
          Local
          <input className={CAMPO} value={local} onChange={(e) => setLocal(e.target.value)} />
        </label>
        <button type="button" className="btn-leve" onClick={() => gravar({ data: doInput(data), local: local.trim() || null })}>
          Salvar data e local
        </button>
        {jogo.rodada != null && (
          <button type="button" className="btn-leve" onClick={() => gravar({ data: doInput(data) }, { rodada: jogo.rodada as number })}>
            Aplicar esta data à rodada inteira
          </button>
        )}
      </div>

      {(jogo.vaga_casa || jogo.vaga_visitante) && !encerrado && (
        <div className="grid gap-2 border-t border-av-linha pt-3">
          <div className="flex flex-wrap items-end gap-3">
            {jogo.vaga_casa && (
              <label className={ROTULO}>
                Trocar o time da casa
                <select className={CAMPO} value={trocaCasa} onChange={(e) => setTrocaCasa(e.target.value)}>
                  <option value="">—</option>
                  {listaTimes.map(([id, t]) => <option key={id} value={id}>{t.nome}</option>)}
                </select>
              </label>
            )}
            {jogo.vaga_visitante && (
              <label className={ROTULO}>
                Trocar o time visitante
                <select className={CAMPO} value={trocaFora} onChange={(e) => setTrocaFora(e.target.value)}>
                  <option value="">—</option>
                  {listaTimes.map(([id, t]) => <option key={id} value={id}>{t.nome}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="btn-leve" onClick={trocar}>Salvar troca</button>
          </div>
          {manual && <p className="text-xs text-av-amarelo">Troca manual: o recálculo automático não mexe mais nesta vaga.</p>}
        </div>
      )}

      {comTimes && !encerrado && (
        <div className="grid gap-2 border-t border-av-linha pt-3">
          <FormResultado
            nomeCasa={nomeCasa}
            nomeFora={nomeFora}
            unidade={UNIDADE[r.tipo_placar]}
            inicial={{ placar_casa: jogo.placar_casa ?? undefined, placar_visitante: jogo.placar_visitante ?? undefined, penaltis_casa: jogo.penaltis_casa, penaltis_visitante: jogo.penaltis_visitante, status: jogo.status }}
            comStatus
            desempate={desempate}
            mostrarDesempate={empatou}
            onSalvar={(v: ValoresResultado) => void gravar(v)}
          />
          {!wo ? (
            <button type="button" className="btn-leve w-fit" onClick={() => setWo(true)}>W.O.</button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-av-cinza">Quem não compareceu?</span>
              <button type="button" className="btn-leve" onClick={() => marcarWo('casa')}>Faltou {nomeCasa}</button>
              <button type="button" className="btn-leve" onClick={() => marcarWo('visitante')}>Faltou {nomeFora}</button>
              <button type="button" className="btn-leve" onClick={() => setWo(false)}>Cancelar</button>
            </div>
          )}
        </div>
      )}

      {comTimes && encerrado && (
        <div className="grid gap-2 border-t border-av-linha pt-3">
          <p className="text-sm">
            Resultado: <strong>{resumo(jogo)}</strong>
          </p>
          {ehCoordenacao && correcao && (
            <div className="grid gap-1">
              <button type="button" className="w-fit text-left text-xs text-av-amarelo underline" onClick={() => setVerHistorico((v) => !v)}>
                Corrigido em {quandoCorrigido(correcao.corrigido_em)}
              </button>
              {verHistorico && (
                <ul className="grid gap-1 text-xs text-av-cinza">
                  {historico.map((h) => (
                    <li key={h.corrigido_em}>
                      {quandoCorrigido(h.corrigido_em)}: {resumo(h.antes)} → {resumo(h.depois)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!corrigindo ? (
            <button type="button" className="btn-leve w-fit" onClick={() => setCorrigindo(true)}>Corrigir súmula</button>
          ) : (
            <div className="grid gap-2">
              <p className="text-xs text-av-amarelo">Correção de jogo encerrado: o delegado não volta a ter acesso.</p>
              <FormResultado
                nomeCasa={nomeCasa}
                nomeFora={nomeFora}
                unidade={UNIDADE[r.tipo_placar]}
                inicial={{ placar_casa: jogo.placar_casa ?? 0, placar_visitante: jogo.placar_visitante ?? 0, penaltis_casa: jogo.penaltis_casa, penaltis_visitante: jogo.penaltis_visitante, wo: jogo.wo }}
                desempate={desempate}
                mostrarDesempate={empatou}
                comWo
                botao="Salvar correção"
                onSalvar={async (v) => {
                  if (await gravar(v)) setCorrigindo(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {ehCoordenacao && (
        <label className={`${ROTULO} max-w-sm`}>
          Delegado do jogo
          <select className={CAMPO} value={jogo.delegado_id ?? ''} onChange={(e) => void gravar({ delegado_id: e.target.value || null })}>
            <option value="">— sem delegado —</option>
            {delegados.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </label>
      )}

      {msg && <p role="alert" className="text-sm text-av-vermelho-claro">{msg}</p>}
    </fieldset>
  );
}
