'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function CoordCapitaes() {
  const supabase = createClient();

  const [capitaes, setCapitaes] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [profileId, setProfileId] = useState('');
  const [timeId, setTimeId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const [{ data: capitaesData }, { data: perfisData }, { data: timesData }] =
      await Promise.all([
        supabase
          .from('time_capitaes')
          .select(`
            id,
            profiles(id, full_name, email),
            times(id, nome)
          `)
          .order('appointed_at', { ascending: false }),

        supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name'),

        supabase
          .from('times')
          .select('id, nome')
          .order('nome'),
      ]);

    setCapitaes(capitaesData || []);
    setPerfis(perfisData || []);
    setTimes(timesData || []);
  }

  async function adicionar() {
    if (!profileId || !timeId) {
      setMensagem('Selecione o usuário e o time.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    const { error } = await supabase
      .from('time_capitaes')
      .insert({
        profile_id: profileId,
        time_id: timeId,
      });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Capitão adicionado.');
      setProfileId('');
      setTimeId('');
      await carregar();
    }

    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este capitão?')) return;

    const { error } = await supabase
      .from('time_capitaes')
      .delete()
      .eq('id', id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Capitão excluído.');
      await carregar();
    }
  }

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          👑 Adicionar capitão
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          >
            <option value="">Selecione o usuário</option>

            {perfis.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.full_name} — {perfil.email}
              </option>
            ))}
          </select>

          <select
            value={timeId}
            onChange={(e) => setTimeId(e.target.value)}
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          >
            <option value="">Selecione o time</option>

            {times.map((time) => (
              <option key={time.id} value={time.id}>
                {time.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={adicionar}
          disabled={salvando}
          className="btn-primary mt-5"
        >
          {salvando ? 'Salvando...' : '+ Adicionar capitão'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)] mt-4">
            {mensagem}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          Capitães cadastrados
        </h2>

        {capitaes.length === 0 && (
          <p className="text-[var(--text-mute)]">
            Nenhum capitão cadastrado.
          </p>
        )}

        <div className="grid gap-3">
          {capitaes.map((capitao) => (
            <div
              key={capitao.id}
              className="flex justify-between items-center gap-4 border-b border-white/10 py-4"
            >
              <div>
                <strong className="block">
                  {capitao.profiles?.full_name || 'Usuário'}
                </strong>

                <small className="text-[var(--text-mute)]">
                  {capitao.profiles?.email} ·{' '}
                  {capitao.times?.nome || 'Sem time'}
                </small>
              </div>

              <button
                onClick={() => excluir(capitao.id)}
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

