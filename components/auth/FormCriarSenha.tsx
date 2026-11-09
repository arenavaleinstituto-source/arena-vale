'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cargoDoBanco, destinoPorCargo } from '@/lib/auth/rotas';
import { MSG } from '@/lib/auth/mensagens';

const MIN = 8;

/**
 * Primeiro acesso por convite e redefinição de senha. O link do e-mail já
 * abre uma sessão; aqui a pessoa escolhe a senha e vai para o painel dela.
 */
export function FormCriarSenha() {
  const router = useRouter();
  const id = useId();
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'sem-sessao'>('carregando');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let vivo = true;
    // Link padrão do Supabase (convite enviado pelo servidor): os tokens chegam
    // depois do "#". Abre a sessão com eles e limpa o endereço.
    const abrirSessaoDoLink = async () => {
      if (typeof window === 'undefined' || !window.location.hash.includes('access_token=')) return;
      const p = new URLSearchParams(window.location.hash.slice(1));
      const access_token = p.get('access_token');
      const refresh_token = p.get('refresh_token');
      window.history.replaceState(null, '', window.location.pathname);
      if (access_token && refresh_token) await createClient().auth.setSession({ access_token, refresh_token });
    };
    abrirSessaoDoLink()
      .then(() => createClient().auth.getUser())
      .then(async ({ data: { user } }) => {
        if (!vivo) return;
        if (!user) return setEstado('sem-sessao');
        const { data } = await createClient().from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (!vivo) return;
        setNome((data as { full_name?: string } | null)?.full_name ?? '');
        setEstado('pronto');
      })
      .catch(() => vivo && setEstado('sem-sessao'));
    return () => {
      vivo = false;
    };
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < MIN) return setErro(`A senha precisa ter pelo menos ${MIN} caracteres.`);
    if (senha !== confirma) return setErro('As duas senhas não são iguais.');
    setSalvando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) return setErro(MSG.conexao);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle();
      router.push(destinoPorCargo(cargoDoBanco((data as { role?: string } | null)?.role ?? 'autenticado')) ?? '/');
    } catch {
      setErro(MSG.conexao);
    } finally {
      setSalvando(false);
    }
  }

  if (estado === 'carregando') return <p className="text-white/60">Carregando…</p>;
  if (estado === 'sem-sessao') {
    return (
      <p role="alert" className="rounded-2xl bg-[#e50914]/10 px-4 py-3 text-sm text-[#ff6b73]">
        O link expirou ou já foi usado. Peça um novo convite à coordenação ou use “Esqueci minha senha” na área da equipe.
      </p>
    );
  }

  const campo =
    'w-full rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-base text-white focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/30';

  return (
    <form onSubmit={salvar} className="grid gap-4">
      {nome && <p className="text-white/70">Olá, <strong className="text-white">{nome}</strong>. Escolha a sua senha de acesso.</p>}
      <label htmlFor={`${id}-s1`} className="grid gap-1.5 text-sm text-white/60">
        Nova senha
        <input id={`${id}-s1`} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className={campo} />
      </label>
      <label htmlFor={`${id}-s2`} className="grid gap-1.5 text-sm text-white/60">
        Repita a senha
        <input id={`${id}-s2`} type="password" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} className={campo} />
      </label>
      {erro && <p role="alert" className="rounded-2xl bg-[#e50914]/10 px-4 py-2.5 text-sm text-[#ff6b73]">{erro}</p>}
      <button type="submit" disabled={salvando} className="rounded-full bg-[#e50914] py-3.5 text-sm font-black uppercase tracking-widest text-white disabled:opacity-60">
        Salvar senha
      </button>
    </form>
  );
}
