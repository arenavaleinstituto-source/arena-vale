'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  timeId: string;
  jogadoresIniciais: any[];
};

export function CapitaoElenco({
  timeId,
  jogadoresIniciais,
}: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [jogadores, setJogadores] = useState(jogadoresIniciais);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [posicao, setPosicao] = useState('');
  const [numero, setNumero] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function adicionarJogador() {
    if (!nome.trim() || !cpf.trim() || !numero) {
      setMensagem('Informe nome, documento e número da camisa.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    let fotoUrl: string | null = null;

    if (foto) {
      const extensao = foto.name.split('.').pop();
      const nomeArquivo = `${timeId}-${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from('jogadores')
        .upload(nomeArquivo, foto, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setMensagem(`Erro no upload: ${uploadError.message}`);
        setSalvando(false);
        return;
      }

      const { data } = supabase.storage
        .from('jogadores')
        .getPublicUrl(nomeArquivo);

      fotoUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('jogadores')
      .insert({
        nome: nome.trim(),
        cpf: cpf.trim(),
        posicao: posicao || null,
        numero_camisa: Number(numero),
        foto_url: fotoUrl,
        time_id: timeId,
      })
      .select()
      .single();

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setJogadores((lista) => [...lista, data]);
      setNome('');
      setCpf('');
      setPosicao('');
      setNumero('');
      setFoto(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      setMensagem('Atleta adicionado.');
    }

    setSalvando(false);
  }

  async function excluirJogador(id: string) {
    if (!confirm('Excluir este atleta?')) return;

    const { error } = await supabase
      .from('jogadores')
      .delete()
      .eq('id', id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    setJogadores((lista) =>
      lista.filter((jogador) => jogador.id !== id)
    );

    setMensagem('Atleta excluído.');
  }

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          👤 Adicionar atleta
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Número do documento"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            value={posicao}
            onChange={(e) => setPosicao(e.target.value)}
            placeholder="Posição"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            type="number"
            min="0"
            max="99"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número da camisa"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="md:col-span-2 text-sm"
          />
        </div>

        <button
          onClick={adicionarJogador}
          disabled={salvando}
          className="btn-primary mt-5"
        >
          {salvando ? 'Salvando...' : '+ Adicionar atleta'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)] mt-4">
            {mensagem}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          Atletas do time
        </h2>

        {jogadores.length === 0 && (
          <p className="text-[var(--text-mute)]">
            Nenhum atleta cadastrado.
          </p>
        )}

        <div className="grid gap-3">
          {jogadores.map((jogador) => (
            <div
              key={jogador.id}
              className="flex items-center justify-between gap-4 border-b border-white/10 py-4"
            >
              <div className="flex items-center gap-3">
                {jogador.foto_url ? (
                  <img
                    src={jogador.foto_url}
                    alt={jogador.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full grid place-items-center bg-white/10">
                    👤
                  </div>
                )}

                <div>
                  <strong className="block">
                    {jogador.nome}
                  </strong>

                  <small className="text-[var(--text-mute)]">
                    Camisa {jogador.numero_camisa} ·{' '}
                    {jogador.posicao || 'Posição não informada'}
                  </small>
                </div>
              </div>

              <button
                onClick={() => excluirJogador(jogador.id)}
                className="text-xs px-3 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300"
              >
                🗑️ Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
