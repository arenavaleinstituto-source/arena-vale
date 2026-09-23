'use client';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from '@/components/shield';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/coordenador';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('E-mail ou senha incorretos.');
        return;
      }
      // Verificar role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const dest = profile?.role === 'coordenador' ? '/coordenador' : profile?.role === 'moderador' ? '/moderador' : next;
      router.push(dest as any);
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface)] border border-[var(--primary)]/20 rounded-2xl p-10 w-full max-w-md relative shadow-2xl">
        <button onClick={() => router.push('/')} className="absolute top-4 right-4 w-8 h-8 grid place-items-center rounded-full border border-white/10 text-[var(--text-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)]">✕</button>
        <div className="flex justify-center mb-4">
          <Shield size={72} />
        </div>
        <h1 className="font-serif text-2xl font-extrabold text-center mb-2">Acesso restrito</h1>
        <p className="text-center text-[var(--text-dim)] text-sm mb-7">Coordenadores e moderadores de time.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          {error && <div className="bg-[rgba(255,59,59,0.12)] border border-[rgba(255,59,59,0.3)] text-[#ff8a8a] text-sm p-2.5 rounded-lg text-center">{error}</div>}
          <div>
            <label className="block text-[11px] tracking-wider text-[var(--text-dim)] uppercase font-bold mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-[11px] tracking-wider text-[var(--text-dim)] uppercase font-bold mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none" placeholder="••••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-base py-3.5 mt-2 disabled:opacity-50">
            {loading ? 'Entrando…' : '🔓 Entrar'}
          </button>
        </form>
        <p className="text-[11px] text-[var(--text-mute)] text-center mt-5 pt-4 border-t border-dashed border-white/10">
          Sem conta? Entre em contato com o coordenador principal.
        </p>
      </div>
    </main>
  );
}
