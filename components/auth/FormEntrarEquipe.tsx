'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cargoDoBanco, destinoPorCargo } from '@/lib/auth/rotas';
import { MSG, mensagemDeErroLogin } from '@/lib/auth/mensagens';

const WHATSAPP = 'https://wa.me/5547988444404?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20acesso%20%C3%A0%20%C3%A1rea%20da%20equipe%20da%20Arena%20Vale.';

type Props = { next?: string | null; autoFocus?: boolean };

/**
 * Login da equipe (coordenadores, moderadores e capitães). Ninguém escolhe o
 * cargo: depois de entrar, o site lê o cargo no banco e leva ao painel certo.
 */
export function FormEntrarEquipe({ next = null, autoFocus = false }: Props) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const origem = () => (typeof window === 'undefined' ? '' : window.location.origin);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error || !data.user) {
        setErro(mensagemDeErroLogin(error));
        return;
      }
      const { data: perfil } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      const destino = destinoPorCargo(cargoDoBanco((perfil as { role?: string } | null)?.role ?? 'autenticado'), next);
      if (!destino) {
        await supabase.auth.signOut();
        setErro(MSG.semCargo);
        return;
      }
      router.push(destino);
    } catch {
      setErro(MSG.conexao);
    } finally {
      setEnviando(false);
    }
  }

  async function porLink() {
    setErro(null);
    setAviso(null);
    if (!email.trim()) return setErro(MSG.informeEmail);
    try {
      const { error } = await createClient().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origem()}/auth/confirm?next=/login`, shouldCreateUser: false },
      });
      if (error) setErro(mensagemDeErroLogin(error));
      else setAviso(MSG.linkEnviado);
    } catch {
      setErro(MSG.conexao);
    }
  }

  async function esqueci() {
    setErro(null);
    setAviso(null);
    if (!email.trim()) return setErro(MSG.informeEmail);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${origem()}/auth/confirm?next=/criar-senha` });
      if (error) setErro(MSG.conexao);
      else setAviso(MSG.resetEnviado);
    } catch {
      setErro(MSG.conexao);
    }
  }

  const campo =
    'w-full rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-base text-white placeholder:text-white/25 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/30';

  return (
    <div className="grid gap-4">
      <form onSubmit={entrar} className="grid gap-4">
        <label htmlFor={`${id}-email`} className="grid gap-1.5 text-sm text-white/60">
          E-mail
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="username"
            autoFocus={autoFocus}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className={campo}
          />
        </label>
        <label htmlFor={`${id}-senha`} className="grid gap-1.5 text-sm text-white/60">
          Senha
          <span className="relative">
            <input
              id={`${id}-senha`}
              type={mostrar ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`${campo} pr-24`}
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/15"
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
        </label>
        {erro && <p role="alert" className="rounded-2xl bg-[#e50914]/10 px-4 py-2.5 text-sm text-[#ff6b73]">{erro}</p>}
        {aviso && <p role="status" className="rounded-2xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{aviso}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-[#e50914] py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition hover:bg-[#ff1f2b] disabled:opacity-60"
        >
          Entrar
        </button>
      </form>
      <div className="flex items-center gap-3 text-xs text-white/40 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">ou</div>
      <button
        type="button"
        onClick={porLink}
        className="rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition hover:border-white/60"
      >
        Receber link de acesso por e-mail
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={esqueci} className="text-[#ff6b73] hover:underline">
          Esqueci minha senha
        </button>
        <a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white">
          Suporte pelo WhatsApp ↗
        </a>
      </div>
    </div>
  );
}
