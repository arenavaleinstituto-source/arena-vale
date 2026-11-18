'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TimesDoCampeonato, type TimeInscrito } from './TimesDoCampeonato';
import { CAMPO, CAMPO_CURTO } from './estilos';

type Props = {
  campeonatoId: string;
  times: TimeInscrito[];
  temJogos: boolean;
  ehCoordenacao: boolean;
  onMudou: () => void;
  /** Chamado quando os times mudam com jogos já gerados (a aba Forma de disputa recria os jogos). */
  onTimesMudaram?: () => void;
};

/** Aba Times: inscrever, tirar e — só nos times que a pessoa pode editar — mudar nome e sigla. O escudo é do capitão. */
export function AbaTimesCampeonato({ campeonatoId, times, temJogos, ehCoordenacao, onMudou, onTimesMudaram }: Props) {
  const sb = createClient();
  const [lista, setLista] = useState(times);
  const [podeEditar, setPodeEditar] = useState<Record<string, boolean>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [msg, setMsg] = useState('');
  const [mudou, setMudou] = useState(false);

  useEffect(() => {
    if (ehCoordenacao) return;
    let vivo = true;
    void (async () => {
      const r: Record<string, boolean> = {};
      for (const t of lista) {
        const { data } = await sb.rpc('pode_editar_time_cadastrado', { t: t.id });
        r[t.id] = data === true;
      }
      if (vivo) setPodeEditar(r);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confere de novo quando a lista muda
  }, [lista, ehCoordenacao]);

  async function salvarTime(t: TimeInscrito) {
    setMsg('');
    if (!nome.trim() || !sigla.trim()) return setMsg('Informe o nome e a sigla do time.');
    const mudanca = { nome: nome.trim(), sigla: sigla.trim().toUpperCase().slice(0, 4) };
    const { error } = await sb.from('times').update(mudanca).eq('id', t.id);
    if (error) return setMsg(`Não consegui salvar: ${error.message}`);
    setLista((l) => l.map((x) => (x.id === t.id ? { ...x, ...mudanca } : x)));
    setEditando(null);
    onMudou();
  }

  return (
    <div className="grid gap-4">
      {mudou && temJogos && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-av-amarelo/40 bg-av-amarelo/10 px-4 py-3 text-sm text-av-amarelo">
          <span className="flex-1">Os times mudaram depois de os jogos serem gerados.</span>
          {onTimesMudaram && (
            <button type="button" className="btn-leve" onClick={onTimesMudaram}>
              Recriar os jogos
            </button>
          )}
        </div>
      )}
      <TimesDoCampeonato
        campeonatoId={campeonatoId}
        inscritos={lista}
        onMudou={(l) => {
          setLista(l);
          setMudou(true);
          onMudou();
        }}
        acoes={(t) =>
          editando === t.id ? (
            <span className="flex flex-wrap items-center gap-2">
              <input aria-label={`Novo nome de ${t.nome}`} className={`${CAMPO} w-48 py-1`} value={nome} maxLength={60} onChange={(e) => setNome(e.target.value)} />
              <input aria-label={`Nova sigla de ${t.nome}`} className={`${CAMPO_CURTO} py-1`} value={sigla} maxLength={4} onChange={(e) => setSigla(e.target.value)} />
              <button type="button" className="btn-forte px-3 py-1" onClick={() => salvarTime(t)}>
                Salvar time
              </button>
            </span>
          ) : (
            (ehCoordenacao || podeEditar[t.id]) && (
              <button type="button" className="btn-leve px-3 py-1" aria-label={`Editar ${t.nome}`} onClick={() => (setEditando(t.id), setNome(t.nome), setSigla(t.sigla ?? ''))}>
                Editar
              </button>
            )
          )
        }
      />
      {msg && (
        <p role="alert" className="text-sm text-av-vermelho-claro">
          {msg}
        </p>
      )}
    </div>
  );
}
