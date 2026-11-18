'use client';

import { useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EscudoTime } from '@/components/campeonatos/EscudoTime';
import { CAMPO, CAMPO_CURTO, ROTULO, TITULO_BLOCO } from './estilos';

export type TimeInscrito = { id: string; nome: string; sigla: string | null; escudo_url: string | null; escudo_cor: string | null; inscricao_id?: string };

type Props = {
  campeonatoId: string;
  inscritos: TimeInscrito[];
  onMudou: (lista: TimeInscrito[]) => void;
  /** Ações extras por time (ex.: editar nome), usadas na aba Times do gerenciador. */
  acoes?: (t: TimeInscrito) => ReactNode;
};

const COLUNAS = 'id,nome,sigla,escudo_url,escudo_cor';

/** Times do campeonato: buscar os que já existem ou cadastrar (nome e sigla). O escudo é sempre do capitão. */
export function TimesDoCampeonato({ campeonatoId, inscritos, onMudou, acoes }: Props) {
  const sb = createClient();
  const [busca, setBusca] = useState('');
  const [achados, setAchados] = useState<TimeInscrito[]>([]);
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [msg, setMsg] = useState('');

  async function buscar() {
    setMsg('');
    const { data, error } = await sb.from('times').select(COLUNAS).ilike('nome', `%${busca.trim()}%`).order('nome').limit(20);
    if (error) return setMsg('Não consegui buscar os times.');
    setAchados(((data ?? []) as TimeInscrito[]).filter((t) => !inscritos.some((i) => i.id === t.id)));
  }

  async function inscrever(t: TimeInscrito) {
    setMsg('');
    const { data, error } = await sb.from('inscricoes').insert({ campeonato_id: campeonatoId, time_id: t.id, status: 'aprovada' }).select('id').single();
    if (error) return setMsg(error.code === '23505' ? `${t.nome} já está inscrito.` : `Não consegui inscrever: ${error.message}`);
    setAchados((l) => l.filter((x) => x.id !== t.id));
    onMudou([...inscritos, { ...t, inscricao_id: (data as { id: string } | null)?.id }]);
  }

  async function cadastrar() {
    setMsg('');
    if (!nome.trim() || !sigla.trim()) return setMsg('Informe o nome e a sigla do time.');
    const { data, error } = await sb.from('times').insert({ nome: nome.trim(), sigla: sigla.trim().toUpperCase().slice(0, 4) }).select(COLUNAS).single();
    if (error || !data) return setMsg(`Não consegui cadastrar o time${error ? `: ${error.message}` : '.'}`);
    setNome('');
    setSigla('');
    await inscrever(data as TimeInscrito);
  }

  async function tirar(t: TimeInscrito) {
    setMsg('');
    const { error } = await sb.from('inscricoes').delete().eq('campeonato_id', campeonatoId).eq('time_id', t.id);
    if (error) return setMsg(`Não consegui tirar o time: ${error.message}`);
    onMudou(inscritos.filter((x) => x.id !== t.id));
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-av-cinza">O escudo do time é colocado pelo capitão.</p>
      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Inscritos ({inscritos.length})</span>
        {inscritos.length === 0 ? (
          <p className="text-sm text-av-cinza">Nenhum time inscrito ainda.</p>
        ) : (
          <ul className="grid gap-2">
            {inscritos.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-av-linha bg-av-grafite-2 px-3 py-2">
                <EscudoTime time={t} tamanho={24} />
                <span className="min-w-0 flex-1 truncate font-bold">{t.nome}</span>
                {acoes?.(t)}
                <button type="button" className="btn-leve px-3 py-1" onClick={() => tirar(t)} aria-label={`Tirar ${t.nome}`}>
                  Tirar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Escolher um time que já existe</span>
        <div className="flex flex-wrap gap-2">
          <input aria-label="Buscar time pelo nome" className={`${CAMPO} flex-1`} value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void buscar())} />
          <button type="button" className="btn-leve" onClick={buscar}>
            Buscar
          </button>
        </div>
        {achados.length > 0 && (
          <ul className="grid gap-1">
            {achados.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-1 py-1">
                <EscudoTime time={t} tamanho={24} />
                <span className="flex-1">{t.nome}</span>
                <button type="button" className="btn-forte px-3 py-1" onClick={() => inscrever(t)} aria-label={`Inscrever ${t.nome}`}>
                  Inscrever
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Cadastrar um time novo</span>
        <div className="flex flex-wrap items-end gap-2">
          <label className={`${ROTULO} flex-1`}>
            Nome do time
            <input className={CAMPO} value={nome} maxLength={60} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label className={ROTULO}>
            Sigla
            <input className={CAMPO_CURTO} value={sigla} maxLength={4} onChange={(e) => setSigla(e.target.value)} />
          </label>
          <button type="button" className="btn-leve" onClick={cadastrar}>
            Cadastrar e inscrever
          </button>
        </div>
      </div>
      {msg && (
        <p role="alert" className="text-sm text-av-vermelho-claro">
          {msg}
        </p>
      )}
    </div>
  );
}
