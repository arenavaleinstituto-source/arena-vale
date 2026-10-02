'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';


export function CoordDestaques({ userId }: { userId: string }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [atletaNome, setAtletaNome] = useState('');
  const [timeNome, setTimeNome] = useState('');
  const [campeonatoNome, setCampeonatoNome] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [destaques, setDestaques] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const { data } = await supabase
      .from('atletas_destaque')
      .select('*')
      .order('ordem')
      .order('created_at', { ascending: false });

    setDestaques(data || []);
  }

  async function adicionar() {
    if (!foto || !atletaNome || !timeNome || !campeonatoNome) {
      setMensagem('Preencha foto, atleta, time e campeonato.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    const extensao = foto.name.split('.').pop();
    const nomeArquivo = `${userId}-${Date.now()}.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from('atletas-destaque')
      .upload(nomeArquivo, foto, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      setMensagem(`Erro no upload: ${uploadError.message}`);
      setSalvando(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('atletas-destaque')
      .getPublicUrl(nomeArquivo);

    const { error } = await supabase
      .from('atletas_destaque')
      .insert({
        foto_url: urlData.publicUrl,
        atleta_nome: atletaNome.trim(),
        time_nome: timeNome.trim(),
        campeonato_nome: campeonatoNome.trim(),
        created_by: userId,
      });

    if (error) {
      setMensagem(`Erro ao salvar: ${error.message}`);
    } else {
      setMensagem('Atleta destaque adicionado.');
      setAtletaNome('');
      setTimeNome('');
      setCampeonatoNome('');
      setFoto(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await carregar();
    }

    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este destaque?')) return;

    const { error } = await supabase
      .from('atletas_destaque')
      .delete()
      .eq('id', id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    setDestaques((lista) =>
      lista.filter((item) => item.id !== id)
    );

    setMensagem('Destaque excluído.');
  }

  useState(() => {
    carregar();
  });

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          ⭐ Adicionar atleta em destaque
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={atletaNome}
            onChange={(e) => setAtletaNome(e.target.value)}
            placeholder="Nome do atleta"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            value={timeNome}
            onChange={(e) => setTimeNome(e.target.value)}
            placeholder="Nome do time"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            value={campeonatoNome}
            onChange={(e) => setCampeonatoNome(e.target.value)}
            placeholder="Nome do campeonato"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>

        <button
          onClick={adicionar}
          disabled={salvando}
          className="btn-primary mt-5"
        >
          {salvando ? 'Salvando...' : '+ Adicionar destaque'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)] mt-4">
            {mensagem}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          Destaques cadastrados
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {destaques.map((item) => (
            <div key={item.id} className="panel">
              <img
                src={item.foto_url}
                alt={item.atleta_nome}
                className="w-full h-44 object-cover rounded-xl"
              />

              <strong className="block mt-3">
                {item.atleta_nome}
              </strong>

              <p className="text-sm text-[var(--text-dim)]">
                {item.time_nome}
              </p>

              <p className="text-xs text-[var(--text-mute)]">
                {item.campeonato_nome}
              </p>

              <button
                onClick={() => excluir(item.id)}
                className="mt-3 text-xs px-3 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300"
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
