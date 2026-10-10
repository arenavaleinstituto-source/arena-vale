'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      const emailLimpo = email.toLowerCase().trim();

      // Roteamento por Perfil de Acesso
      if (emailLimpo.includes('proprietario') || emailLimpo.includes('admin')) {
        router.push('/proprietario');
      } else if (emailLimpo.includes('coordenador') || emailLimpo.includes('coord')) {
        router.push('/coordenador');
      } else {
        router.push('/coordenador/atletasdestaques');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      <header className="w-full border-b border-white/10 bg-[#0b0d12]/95 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain" />
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-[#a0a8be] hover:text-white transition"
        >
          ← Voltar ao Portal
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <span className="rounded-full bg-[#e50914]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#e50914]">
              Área Restrita
            </span>
            <h1 className="mt-4 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Autenticação Oficial
            </h1>
            <p className="mt-2 text-xs text-[#8a92a6]">
              Acesso exclusivo para Coordenadores, Moderadores e Gestão.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                E-mail Registrado
              </label>
              <input
                type="email"
                required
                placeholder="coordenador@arenavale.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">
                Palavra-passe / Senha
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#e50914] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema →'}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-[11px] text-[#555d6e]">
        © Arena Vale · Plataforma Operacional Segura
      </footer>
    </div>
  );
}
