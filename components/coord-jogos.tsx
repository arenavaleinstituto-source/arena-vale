'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function CoordJogos() {
  const supabase = createClient();

  const [jogos, setJogos] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [campeonatos, setCampeonatos] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [campeonatoId, setCampeonatoId] = useState('');
  const [timeCasaId, setTimeCasaId] = useState('');
  const [timeVisitanteId, setTimeVisitanteId] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const [{ data: jogosData }, { data: timesData }, { data: campeonatosData }] =
      await Promise.all([
        supabase.from('jogos').select('*').order('data', { ascending: true }),
        supabase.from('times').select('id, nome').order('nome'),
        supabase.from('campeonatos').select('id, nome').order('nome'),
      ]);

    setJogos(jogosData || []);
    setTimes(timesData || []);
    setCampeonatos(campeonatosData || []);
  }

  function nomeTime(id: string) {
    return times.find((time) => time.id === id)?.nome || 'Time';
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

    const { error } = await supabase.from('jogos').insert({
      campeonato_id: campeonatoId,
      time_casa_id: timeCasaId,
      time_visitante_id: timeVisitanteId,
      data: new Date(data).toISOString(),
      local: local || null,
      placar_casa: 0,
      placar_visitante: 0,
      status: 'agendado',
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Jogo criado.');
      setCampeonatoId('');
      setTimeCasaId('');
      setTimeVisitanteId('');
      setData('');
      setLocal('');
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
    );
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
    );
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
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
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
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <select
            value={timeCasaId}
            onChange={(e) => setTimeCasaId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
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
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
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
            className="md:col-span-2 px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />
        </div>

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
                    {new Date(jogo.data).toLocaleString('pt-BR')} ·{' '}
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
