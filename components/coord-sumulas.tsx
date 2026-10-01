'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  userId: string;
};

export function CoordSumulas({ userId }: Props) {
  const supabase = createClient();

  const [jogos, setJogos] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [jogoId, setJogoId] = useState('');
  const [arbitro, setArbitro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: jogosData } = await supabase
        .from('jogos')
        .select('*')
        .order('data', { ascending: false });

      const { data: timesData } = await supabase
        .from('times')
        .select('id, nome')
        .order('nome');

      setJogos(jogosData || []);
      setTimes(timesData || []);
    }

    carregar();
  }, []);

  function nomeTime(id: string) {
    return times.find((time) => time.id === id)?.nome || 'Time';
  }

  async function salvar() {
    if (!jogoId) {
      setMensagem('Selecione um jogo.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    const { error } = await supabase.from('sumulas').upsert(
      {
        jogo_id: jogoId,
        hash_conteudo: crypto.randomUUID(),
        status: 'rascunho',
        arbitro_nome: arbitro || null,
        observacoes: observacoes || null,
        criada_por: userId,
      },
      { onConflict: 'jogo_id' }
    );

    setSalvando(false);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Súmula salva com sucesso.');
    }
  }

  return (
    <div className="panel">
      <h2 className="font-serif text-xl font-bold mb-5">
        📄 Súmulas
      </h2>

      <label className="block text-sm font-semibold mb-2">
        Jogo
      </label>

      <select
        value={jogoId}
        onChange={(e) => setJogoId(e.target.value)}
        className="w-full px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 mb-5"
      >
        <option value="">Selecione um jogo</option>

        {jogos.map((jogo) => (
          <option key={jogo.id} value={jogo.id}>
            {nomeTime(jogo.time_casa_id)} x{' '}
            {nomeTime(jogo.time_visitante_id)} —{' '}
            {new Date(jogo.data).toLocaleDateString('pt-BR')}
          </option>
        ))}
      </select>

      <label className="block text-sm font-semibold mb-2">
        Árbitro
      </label>

      <input
        value={arbitro}
        onChange={(e) => setArbitro(e.target.value)}
        placeholder="Nome do árbitro"
        className="w-full px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 mb-5"
      />

      <label className="block text-sm font-semibold mb-2">
        Observações
      </label>

      <textarea
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        placeholder="Observações da partida"
        rows={5}
        className="w-full px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 mb-5"
      />

      <button
        onClick={salvar}
        disabled={salvando}
        className="btn-primary"
      >
        {salvando ? 'Salvando...' : 'Salvar súmula'}
      </button>

      {mensagem && (
        <p className="text-sm text-[var(--primary)] mt-4">
          {mensagem}
        </p>
      )}
    </div>
  );
}
