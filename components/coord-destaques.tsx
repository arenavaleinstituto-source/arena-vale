'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatarCpf, soDigitos } from '@/lib/atletas/cpf';



export function CoordDestaques({ userId }: { userId: string }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [atletaNome, setAtletaNome] = useState('');
  const [timeNome, setTimeNome] = useState('');
  const [campeonatoNome, setCampeonatoNome] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  /** Foto já guardada na inscrição do atleta (achada pelo CPF): usada sem novo envio. */
  const [fotoInscricao, setFotoInscricao] = useState<string | null>(null);
  const [cpf, setCpf] = useState('');
  const [buscando, setBuscando] = useState(false);
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
    if ((!foto && !fotoInscricao) || !atletaNome || !timeNome || !campeonatoNome) {
      setMensagem('Preencha foto, atleta, time e campeonato.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    let fotoUrl = fotoInscricao;
    if (foto) {

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
    fotoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('atletas_destaque')
      .insert({
        foto_url: fotoUrl,
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
      setFotoInscricao(null);
      setCpf('');

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

  /** Puxa nome, time, campeonato e foto da inscrição do atleta, pelo CPF. */
  async function buscarPorCpf() {
    if (soDigitos(cpf).length !== 11) {
      setMensagem('Digite o CPF completo do atleta.');
      return;
    }
    setBuscando(true);
    setMensagem('');
    try {
      const r = await fetch(`/api/atletas/por-cpf?cpf=${soDigitos(cpf)}`);
      const j = (await r.json()) as { atleta?: { nome: string; foto_url: string | null; time: string | null; campeonato: string | null }; erro?: string };
      if (!r.ok || !j.atleta) {
        setMensagem(j.erro ?? 'Não encontrei esse atleta.');
        return;
      }
      setAtletaNome(j.atleta.nome);
      if (j.atleta.time) setTimeNome(j.atleta.time);
      if (j.atleta.campeonato) setCampeonatoNome(j.atleta.campeonato);
      setFotoInscricao(j.atleta.foto_url);
      setFoto(null);
      if (fileRef.current) fileRef.current.value = '';
      setMensagem(j.atleta.foto_url ? 'Atleta encontrado: confira os dados e adicione.' : 'Atleta encontrado, mas a inscrição não tem foto: envie uma abaixo.');
    } catch {
      setMensagem('Sem conexão com o site. Tente de novo.');
    } finally {
      setBuscando(false);
    }
  }

  useEffect(() => {
  carregar();
}, []);

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          ⭐ Adicionar atleta em destaque
        </h2>

        <div className="mb-5 grid gap-2 rounded-2xl border border-white/10 p-4">
          <label htmlFor="cpf-destaque" className="text-sm text-av-cinza">
            Puxar da inscrição: digite o CPF do atleta para trazer a foto, o nome, o time e o campeonato
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="cpf-destaque"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatarCpf(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void buscarPorCpf();
              }}
              placeholder="000.000.000-00"
              className="min-w-[200px] flex-1 px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
            />
            <button type="button" onClick={buscarPorCpf} disabled={buscando} className="btn-primary">
              {buscando ? 'Buscando...' : 'Buscar atleta'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={atletaNome}
            onChange={(e) => setAtletaNome(e.target.value)}
            placeholder="Nome do atleta"
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          />

          <input
            value={timeNome}
            onChange={(e) => setTimeNome(e.target.value)}
            placeholder="Nome do time"
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          />

          <input
            value={campeonatoNome}
            onChange={(e) => setCampeonatoNome(e.target.value)}
            placeholder="Nome do campeonato"
            className="px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10"
          />

          <div className="grid gap-2">
            {fotoInscricao && !foto && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- foto da inscrição (Supabase) */}
                <img src={fotoInscricao} alt="Foto da inscrição" className="h-20 w-16 rounded-lg object-cover" />
                <span className="text-sm text-av-cinza">
                  Foto da inscrição
                  <button type="button" onClick={() => setFotoInscricao(null)} className="block text-xs text-red-300 hover:text-red-200">
                    Usar outra foto
                  </button>
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Enviar foto do atleta"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
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
