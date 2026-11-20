'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type JogoDelegado = {
  id: string;
  campeonato_id: string | null;
  data: string | null;
  local: string | null;
  status: string;
  placar_casa: number;
  placar_visitante: number;
  nome_casa_custom: string | null;
  nome_visitante_custom: string | null;
  casa: { id: string; nome: string } | null;
  fora: { id: string; nome: string } | null;
};

const A_DEFINIR = 'A definir';

function CartaoJogo({ jogo: inicial, ehCoordenador }: { jogo: JogoDelegado; ehCoordenador: boolean }) {
  const supabase = createClient();
  const [jogo, setJogo] = useState(inicial);
  const [msg, setMsg] = useState('');
  const [editandoCasa, setEditandoCasa] = useState(false);
  const [editandoFora, setEditandoFora] = useState(false);
  const [nomeCasa, setNomeCasa] = useState(jogo.nome_casa_custom ?? jogo.casa?.nome ?? '');
  const [nomeFora, setNomeFora] = useState(jogo.nome_visitante_custom ?? jogo.fora?.nome ?? '');
  const [ultimoGol, setUltimoGol] = useState<'casa' | 'fora' | null>(null);

  async function salvarNome(campo: 'nome_casa_custom' | 'nome_visitante_custom', valor: string) {
    const { error } = await supabase.from('jogos').update({ [campo]: valor || null }).eq('id', jogo.id);
    if (error) setMsg(`Erro: ${error.message}`);
    else setJogo((j) => ({ ...j, [campo]: valor || null }));
  }

  async function gol(time: 'casa' | 'fora') {
    const campo = time === 'casa' ? 'placar_casa' : 'placar_visitante';
    const novoValor = (time === 'casa' ? jogo.placar_casa : jogo.placar_visitante) + 1;
    const { error } = await supabase.from('jogos').update({ [campo]: novoValor }).eq('id', jogo.id);
    if (error) { setMsg(`Erro: ${error.message}`); return; }
    setJogo((j) => ({ ...j, [campo]: novoValor }));
    setUltimoGol(time);
    setMsg('');
  }

  async function desfazer(time: 'casa' | 'fora') {
    const campo = time === 'casa' ? 'placar_casa' : 'placar_visitante';
    const atual = time === 'casa' ? jogo.placar_casa : jogo.placar_visitante;
    const novoValor = Math.max(0, atual - 1);
    const { error } = await supabase.from('jogos').update({ [campo]: novoValor }).eq('id', jogo.id);
    if (error) { setMsg(`Erro: ${error.message}`); return; }
    setJogo((j) => ({ ...j, [campo]: novoValor }));
    setUltimoGol(null);
    setMsg('');
  }

  async function mudarStatus(novoStatus: 'ao_vivo' | 'finalizado') {
    const { error } = await supabase.from('jogos').update({ status: novoStatus }).eq('id', jogo.id);
    if (error) { setMsg(`Erro: ${error.message}`); return; }
    setJogo((j) => ({ ...j, status: novoStatus }));
    setMsg(novoStatus === 'ao_vivo' ? 'Jogo iniciado!' : 'Jogo finalizado!');
    // Com o jogo encerrado, a classificação e a chave do campeonato se atualizam. Uma falha aqui não trava a mesa.
    if (novoStatus === 'finalizado' && jogo.campeonato_id) {
      fetch(`/api/campeonatos/${jogo.campeonato_id}/recalcular`, { method: 'POST' }).catch(() => undefined);
    }
  }

  const exibirCasa = jogo.nome_casa_custom || jogo.casa?.nome || A_DEFINIR;
  const exibirFora = jogo.nome_visitante_custom || jogo.fora?.nome || A_DEFINIR;
  const finalizado = jogo.status === 'finalizado';

  return (
    <div className="panel grid gap-6">
      <div className="text-center text-xs text-[var(--text-dim)]">
        {jogo.data ? new Date(jogo.data).toLocaleString('pt-BR') : A_DEFINIR} · {jogo.local || 'Local não informado'}
        <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${jogo.status === 'ao_vivo' ? 'bg-red-600 text-white' : 'bg-white/10'}`}>
          {jogo.status === 'ao_vivo' ? '🔴 AO VIVO' : jogo.status}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div>
          {editandoCasa ? (
            <input
              autoFocus
              value={nomeCasa}
              onChange={(e) => setNomeCasa(e.target.value)}
              onBlur={() => { setEditandoCasa(false); salvarNome('nome_casa_custom', nomeCasa); }}
              className="input text-center w-full"
            />
          ) : (
            <button onClick={() => setEditandoCasa(true)} className="font-bold text-lg leading-tight hover:underline">{exibirCasa}</button>
          )}
        </div>
        <div className="text-4xl font-black tabular-nums px-4">{jogo.placar_casa} × {jogo.placar_visitante}</div>
        <div>
          {editandoFora ? (
            <input
              autoFocus
              value={nomeFora}
              onChange={(e) => setNomeFora(e.target.value)}
              onBlur={() => { setEditandoFora(false); salvarNome('nome_visitante_custom', nomeFora); }}
              className="input text-center w-full"
            />
          ) : (
            <button onClick={() => setEditandoFora(true)} className="font-bold text-lg leading-tight hover:underline">{exibirFora}</button>
          )}
        </div>
      </div>

      {!finalizado && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => gol('casa')}
              style={{ height: '72px', fontSize: '1.25rem' }}
              className="btn-forte rounded-xl font-bold"
            >
              + GOL {exibirCasa.toUpperCase()}
            </button>
            <button
              onClick={() => gol('fora')}
              style={{ height: '72px', fontSize: '1.25rem' }}
              className="btn-forte rounded-xl font-bold"
            >
              + GOL {exibirFora.toUpperCase()}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ultimoGol ? (
              <button onClick={() => desfazer(ultimoGol)} className="btn col-span-2 text-sm">
                − Desfazer último gol ({ultimoGol === 'casa' ? exibirCasa : exibirFora})
              </button>
            ) : (
              <>
                <button onClick={() => desfazer('casa')} className="btn text-xs">− {exibirCasa}</button>
                <button onClick={() => desfazer('fora')} className="btn text-xs">− {exibirFora}</button>
              </>
            )}
          </div>

          {jogo.status === 'agendado' && (
            <button onClick={() => mudarStatus('ao_vivo')} className="btn-forte text-sm py-3">
              🔴 Iniciar jogo
            </button>
          )}
          {jogo.status === 'ao_vivo' && (
            <button onClick={() => mudarStatus('finalizado')} className="btn text-sm py-3 border-green-500/40 text-green-300">
              ✓ Finalizar jogo
            </button>
          )}
        </>
      )}

      {finalizado && (
        <p className="text-center text-sm text-[var(--text-dim)]">Este jogo está finalizado.</p>
      )}

      {msg && <p role="status" className="text-center text-sm text-emerald-300">{msg}</p>}
    </div>
  );
}

export function MesaDoJogo({ jogos, ehCoordenador }: { jogos: JogoDelegado[]; ehCoordenador: boolean }) {
  const [jogoSelecionadoId, setJogoSelecionadoId] = useState(jogos[0]?.id ?? '');
  const jogoAtual = jogos.find((j) => j.id === jogoSelecionadoId) ?? jogos[0];

  if (jogos.length === 0) {
    return (
      <div className="panel text-center text-[var(--text-dim)]">
        Nenhum jogo atribuído a você hoje.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jogos.length > 1 && (
        <select
          value={jogoSelecionadoId}
          onChange={(e) => setJogoSelecionadoId(e.target.value)}
          className="input text-base py-3"
        >
          {jogos.map((j) => (
            <option key={j.id} value={j.id}>
              {j.casa?.nome ?? A_DEFINIR} × {j.fora?.nome ?? A_DEFINIR} ·{' '}
              {j.data ? new Date(j.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : A_DEFINIR}
            </option>
          ))}
        </select>
      )}
      {jogoAtual && <CartaoJogo key={jogoAtual.id} jogo={jogoAtual} ehCoordenador={ehCoordenador} />}
    </div>
  );
}
