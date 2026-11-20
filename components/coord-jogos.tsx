'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { recalcularVagas } from '@/components/campeonatos/painel/api';
import { AgendaTransmissoes } from '@/components/painel/AgendaTransmissoes';
import { mapearConfig } from '@/lib/midia/config-padrao';

/** `transmissoes` vem como objeto único (jogo_id é único) ou lista, conforme a consulta. */
function temTransmissao(t: unknown): boolean {
  return Array.isArray(t) ? t.length > 0 : Boolean(t);
}

export function CoordJogos() {
  const supabase = createClient();

  const [jogos, setJogos] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [campeonatos, setCampeonatos] = useState<any[]>([]);
  const [delegados, setDelegados] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [campeonatoId, setCampeonatoId] = useState('');
  const [timeCasaId, setTimeCasaId] = useState('');
  const [timeVisitanteId, setTimeVisitanteId] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [delegadoId, setDelegadoId] = useState('');
  const [comTransmissao, setComTransmissao] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const [{ data: jogosData }, { data: timesData }, { data: campeonatosData }, { data: delegadosData }] =
      await Promise.all([
        supabase.from('jogos').select('*, delegado_id, transmissoes(id)').order('data', { ascending: true }),
        supabase.from('times').select('id, nome').order('nome'),
        supabase.from('campeonatos').select('id, nome').order('nome'),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'delegado').order('full_name'),
      ]);

    setJogos(jogosData || []);
    setTimes(timesData || []);
    setCampeonatos(campeonatosData || []);
    setDelegados((delegadosData as typeof delegados) || []);
  }

  function nomeTime(id: string | null) {
    if (!id) return 'A definir';
    return times.find((time) => time.id === id)?.nome || 'Time';
  }

  /** Link do canal para a linha de `transmissoes` (o player do site segue o canal do YouTube). */
  async function linkDoCanal(): Promise<string> {
    const { data: cfg } = await supabase.from('site_config').select('*').eq('id', 'main').maybeSingle();
    return `https://www.youtube.com/${mapearConfig(cfg as Record<string, unknown> | null).youtubeHandle}`;
  }

  /** Liga ou desliga a transmissão de um jogo de campeonato (tabela `transmissoes`). */
  async function marcarTransmissao(jogoId: string, ligar: boolean): Promise<boolean> {
    const { error } = ligar
      ? await supabase.from('transmissoes').insert({ jogo_id: jogoId, plataforma: 'youtube', url: await linkDoCanal() })
      : await supabase.from('transmissoes').delete().eq('jogo_id', jogoId);
    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return false;
    }
    setJogos((prev) => prev.map((j) => (j.id === jogoId ? { ...j, transmissoes: ligar ? { id: 'nova' } : null } : j)));
    return true;
  }

  async function criarJogo() {
    if (!campeonatoId || !timeCasaId || !timeVisitanteId || !data) {
      setMensagem('Preencha campeonato, times e data.');
      return;
    }

    if (timeCasaId === timeVisitanteId) {
      setMensagem('Selecione dois times diferentes.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    const { data: criado, error } = await supabase.from('jogos').insert({
      campeonato_id: campeonatoId,
      time_casa_id: timeCasaId,
      time_visitante_id: timeVisitanteId,
      data: new Date(data).toISOString(),
      local: local || null,
      delegado_id: delegadoId || null,
      placar_casa: 0,
      placar_visitante: 0,
      status: 'agendado',
    }).select('id').single();

    if (!error && comTransmissao && criado) {
      const { error: errT } = await supabase.from('transmissoes').insert({ jogo_id: (criado as { id: string }).id, plataforma: 'youtube', url: await linkDoCanal() });
      if (errT) setMensagem(`Jogo criado, mas a transmissão não foi marcada: ${errT.message}`);
    }

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem((m) => m || 'Jogo criado.');
      setCampeonatoId('');
      setTimeCasaId('');
      setTimeVisitanteId('');
      setData('');
      setLocal('');
      setDelegadoId('');
      setComTransmissao(false);
      await carregar();
    }

    setSalvando(false);
  }

  async function atualizarPlacar(
    jogo: any,
    campo: 'placar_casa' | 'placar_visitante',
    valor: number
  ) {
    const novoValor = Math.max(0, valor);

    const { error } = await supabase
      .from('jogos')
      .update({ [campo]: novoValor })
      .eq('id', jogo.id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    setJogos((atual) =>
      atual.map((item) =>
        item.id === jogo.id ? { ...item, [campo]: novoValor } : item
      )
    );    // Todo resultado salvo recalcula as vagas dos jogos seguintes (spec 4.3).
    if (jogo.campeonato_id) void recalcularVagas(jogo.campeonato_id);
  }

  async function atribuirDelegado(jogoId: string, delegadoId: string | null) {
    const { error } = await supabase.from('jogos').update({ delegado_id: delegadoId }).eq('id', jogoId);
    if (error) return setMensagem(`Erro: ${error.message}`);
    setJogos((prev) => prev.map((j) => j.id === jogoId ? { ...j, delegado_id: delegadoId } : j));
  }

  async function finalizarJogo(jogo: any) {
    const { error } = await supabase
      .from('jogos')
      .update({ status: 'finalizado' })
      .eq('id', jogo.id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    setJogos((atual) =>
      atual.map((item) =>
        item.id === jogo.id ? { ...item, status: 'finalizado' } : item
      )
    );    if (jogo.campeonato_id) void recalcularVagas(jogo.campeonato_id);
  }

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          ⚽ Cadastrar jogo
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={campeonatoId}
            onChange={(e) => setCampeonatoId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          >
            <option value="">Selecione o campeonato</option>
            {campeonatos.map((campeonato) => (
              <option key={campeonato.id} value={campeonato.id}>
                {campeonato.nome}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          />

          <select
            value={timeCasaId}
            onChange={(e) => setTimeCasaId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          >
            <option value="">Time da casa</option>
            {times.map((time) => (
              <option key={time.id} value={time.id}>
                {time.nome}
              </option>
            ))}
          </select>

          <select
            value={timeVisitanteId}
            onChange={(e) => setTimeVisitanteId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          >
            <option value="">Time visitante</option>
            {times.map((time) => (
              <option key={time.id} value={time.id}>
                {time.nome}
              </option>
            ))}
          </select>

          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Local da partida"
            className="self-end px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          />

          {/* O delegado escolhido aqui entra com o próprio login e lança o placar na Mesa do Jogo. */}
          <label className="grid gap-1 text-sm text-av-cinza">
            Delegado (opcional)
            <select
              value={delegadoId}
              onChange={(e) => setDelegadoId(e.target.value)}
              className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10 text-base text-av-branco"
            >
              <option value="">{delegados.length ? 'Escolher depois' : 'Nenhum delegado cadastrado: convide na aba Delegados'}</option>
              {delegados.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name || d.email || 'Delegado'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex items-center gap-3 text-av-branco">
          <input type="checkbox" checked={comTransmissao} onChange={(e) => setComTransmissao(e.target.checked)} className="h-5 w-5 accent-[#e50914]" />
          📺 Terá transmissão (entra no cartão &quot;Próxima transmissão&quot; da página inicial)
        </label>

        <button
          onClick={criarJogo}
          disabled={salvando}
          className="btn-primary mt-5"
        >
          {salvando ? 'Salvando...' : '+ Criar jogo'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)] mt-4">
            {mensagem}
          </p>
        )}
      </div>

      <AgendaTransmissoes />

      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          Jogos cadastrados
        </h2>

        {jogos.length === 0 && (
          <p className="text-[var(--text-mute)]">
            Nenhum jogo cadastrado.
          </p>
        )}

        <div className="grid gap-4">
          {jogos.map((jogo) => (
            <div
              key={jogo.id}
              className="border-b border-white/10 pb-4"
            >
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <strong>
                    {nomeTime(jogo.time_casa_id)} x{' '}
                    {nomeTime(jogo.time_visitante_id)}
                  </strong>

                  <p className="text-xs text-[var(--text-mute)] mt-1">
                    {jogo.data ? new Date(jogo.data).toLocaleString('pt-BR') : 'A definir'} ·{' '}
                    {jogo.local || 'Local não informado'}
                  </p>
                </div>

                <span className="text-xs text-[var(--text-mute)]">
                  {jogo.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <strong>{nomeTime(jogo.time_casa_id)}</strong>

                <button
                  onClick={() =>
                    atualizarPlacar(
                      jogo,
                      'placar_casa',
                      jogo.placar_casa - 1
                    )
                  }
                  className="px-3 py-1 rounded border border-white/10"
                >
                  −
                </button>

                <strong className="text-xl">{jogo.placar_casa}</strong>

                <button
                  onClick={() =>
                    atualizarPlacar(
                      jogo,
                      'placar_casa',
                      jogo.placar_casa + 1
                    )
                  }
                  className="px-3 py-1 rounded border border-white/10"
                >
                  +
                </button>

                <span>×</span>

                <button
                  onClick={() =>
                    atualizarPlacar(
                      jogo,
                      'placar_visitante',
                      jogo.placar_visitante - 1
                    )
                  }
                  className="px-3 py-1 rounded border border-white/10"
                >
                  −
                </button>

                <strong className="text-xl">
                  {jogo.placar_visitante}
                </strong>

                <button
                  onClick={() =>
                    atualizarPlacar(
                      jogo,
                      'placar_visitante',
                      jogo.placar_visitante + 1
                    )
                  }
                  className="px-3 py-1 rounded border border-white/10"
                >
                  +
                </button>

                <strong>{nomeTime(jogo.time_visitante_id)}</strong>
              </div>

              <label className="grid gap-1 text-xs mt-3">
                Delegado do jogo
                <select
                  value={jogo.delegado_id ?? ''}
                  onChange={(e) => atribuirDelegado(jogo.id, e.target.value || null)}
                  className="input text-sm"
                >
                  <option value="">Sem delegado</option>
                  {delegados.map((d) => (
                    <option key={d.id} value={d.id}>{d.full_name ?? d.email}</option>
                  ))}
                </select>
              </label>

              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={temTransmissao(jogo.transmissoes)}
                  onChange={(e) => void marcarTransmissao(jogo.id, e.target.checked)}
                  className="h-4 w-4 accent-[#e50914]"
                />
                📺 Terá transmissão
              </label>

              {jogo.status !== 'finalizado' && (
                <button
                  onClick={() => finalizarJogo(jogo)}
                  className="mt-4 text-xs px-3 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300"
                >
                  ✓ Finalizar jogo
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
