'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function CoordModeradores() {
  const supabase = createClient();

  const [moderadores, setModeradores] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [profileId, setProfileId] = useState('');
  const [timeId, setTimeId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: mods } = await supabase
      .from('time_moderadores')
      .select('*, profiles(id, full_name, email), times(id, nome)')
      .order('appointed_at', { ascending: false });

    const { data: timesData } = await supabase
      .from('times')
      .select('id, nome')
      .order('nome');

    const { data: perfisData } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name');

    setModeradores(mods || []);
    setTimes(timesData || []);
    setPerfis(perfisData || []);
  }

  async function hashSenha(texto: string) {
    const buffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(texto)
    );

    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async function adicionar() {
    if (!profileId || !timeId || !username || !password) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    setSalvando(true);
    setMensagem('');

    const passwordHash = await hashSenha(password);

    const { error } = await supabase
      .from('time_moderadores')
      .insert({
        profile_id: profileId,
        time_id: timeId,
        username: username.trim(),
        password_hash: passwordHash,
      });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Moderador adicionado.');
      setProfileId('');
      setTimeId('');
      setUsername('');
      setPassword('');
      await carregar();
    }

    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este moderador?')) return;

    const { error } = await supabase
      .from('time_moderadores')
      .delete()
      .eq('id', id);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem('Moderador excluído.');
      await carregar();
    }
  }

  return (
    <div className="grid gap-6">
      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          🛡️ Adicionar moderador
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

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome de usuário"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha do moderador"
            className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
          />
        </div>

        <button
          onClick={adicionar}
          disabled={salvando}
          className="btn-primary mt-5"
        >
          {salvando ? 'Salvando...' : '+ Adicionar moderador'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)] mt-4">
            {mensagem}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="font-serif text-xl font-bold mb-5">
          Moderadores cadastrados
        </h2>

        {moderadores.length === 0 && (
          <p className="text-[var(--text-mute)]">
            Nenhum moderador cadastrado.
          </p>
        )}

        <div className="grid gap-3">
          {moderadores.map((moderador) => (
            <div
              key={moderador.id}
              className="flex justify-between items-center gap-4 border-b border-white/10 py-4"
            >
              <div>
                <strong className="block">
                  {moderador.profiles?.full_name || 'Usuário'}
                </strong>

                <small className="text-[var(--text-mute)]">
                  @{moderador.username} ·{' '}
                  {moderador.times?.nome || 'Sem time'}
                </small>
              </div>

              <button
                onClick={() => excluir(moderador.id)}
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

