'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type Delegado = { id: string; full_name?: string | null; email?: string | null };

/** Gerenciamento de contas de delegado no painel da coordenação. */
export function CoordDelegados() {
  const id = useId();
  const [delegados, setDelegados] = useState<Delegado[]>([]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomePessoa, setNomePessoa] = useState('');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'delegado').order('full_name');
    setDelegados((data ?? []) as Delegado[]);
  }, []);

  useEffect(() => {
    let vivo = true;
    carregar().then(() => { if (!vivo) setDelegados([]); });
    return () => { vivo = false; };
  }, [carregar]);

  async function cadastrar(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!nomePessoa.trim()) {
      setMsg({ tipo: 'erro', texto: 'Informe o nome da pessoa.' });
      return;
    }
    if (senha.length < 8) {
      setMsg({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 8 caracteres.' });
      return;
    }
    setOcupado(true);
    const alvo = email.trim();
    try {
      const resp = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alvo, cargo: 'delegado', senha, nome: nomePessoa.trim() }),
      });
      const corpo = (await resp.json()) as { ok: boolean; erro?: string; jaTinhaConta?: boolean };
      if (!corpo.ok) setMsg({ tipo: 'erro', texto: corpo.erro ?? 'Não foi possível cadastrar.' });
      else {
        setMsg({
          tipo: 'ok',
          texto: corpo.jaTinhaConta
            ? `${alvo} já tinha conta: entra com a senha que já usa.`
            : `Pronto: ${alvo} pode entrar com o e-mail e a senha cadastrada.`,
        });
        setEmail('');
        setSenha('');
        setNomePessoa('');
        await carregar();
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível cadastrar. Verifique sua conexão.' });
    } finally {
      setOcupado(false);
    }
  }

  async function remover(d: Delegado) {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role: 'autenticado' }).eq('id', d.id);
    if (error) setMsg({ tipo: 'erro', texto: error.message });
    else await carregar();
  }

  const nome = (d: Delegado) => d.full_name || d.email || 'Sem nome';

  return (
    <section className="panel grid gap-5">
      <div>
        <h2 className="text-2xl font-black uppercase">DELEGADOS</h2>
        <p className="mt-1 text-sm text-[var(--text-dim)]">O delegado atualiza o placar ao vivo no dia do jogo. A conta é bloqueada automaticamente ao finalizar o jogo.</p>
        <p className="mt-1 text-sm text-[var(--text-dim)]">A pessoa entra pelo botão Entrar do site com este e-mail e a senha. Passe a senha a ela pelo WhatsApp.</p>
      </div>

      <form onSubmit={cadastrar} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <label htmlFor={`${id}-nome`} className="grid gap-1.5 text-sm">
          Nome completo
          <input id={`${id}-nome`} type="text" value={nomePessoa} onChange={(e) => setNomePessoa(e.target.value)} className="input" placeholder="Nome de quem vai usar a conta" />
        </label>
        <label htmlFor={`${id}-email`} className="grid gap-1.5 text-sm">
          E-mail
          <input id={`${id}-email`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="pessoa@exemplo.com" />
        </label>
        <label htmlFor={`${id}-senha`} className="grid gap-1.5 text-sm">
          Senha
          <input id={`${id}-senha`} type="text" autoComplete="off" required value={senha} onChange={(e) => setSenha(e.target.value)} className="input" placeholder="mínimo 8 caracteres" />
        </label>
        <button type="submit" disabled={ocupado} className="btn-forte">Cadastrar delegado</button>
      </form>

      {msg && <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={msg.tipo === 'erro' ? 'text-red-400' : 'text-emerald-300'}>{msg.texto}</p>}

      <ul className="grid gap-2">
        {delegados.length === 0 && <li className="text-sm text-[var(--text-dim)]">Nenhum delegado cadastrado ainda.</li>}
        {delegados.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
            <div>
              <p className="font-bold">{nome(d)}</p>
              <p className="text-xs text-[var(--text-dim)]">{d.email}</p>
            </div>
            <button type="button" onClick={() => remover(d)} className="btn" aria-label={`Remover delegado ${nome(d)}`}>
              Remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
