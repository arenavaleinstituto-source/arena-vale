'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // Importação corrigida que resolve o erro
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de login - ajuste para a sua função real do Supabase
    setTimeout(() => {
      router.push('/painel');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#0a1120] border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-amber-400 tracking-wider">ARENA VALE</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Acesso ao Centro de Comando</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coordenador@arenavale.com"
              className="w-full bg-[#070b13] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold uppercase">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#070b13] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-[#070b13] font-bold rounded-lg text-sm transition cursor-pointer"
          >
            {loading ? 'Acessando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-amber-400 transition font-semibold">
            ← VOLTAR AO SITE PRINCIPAL
          </Link>
        </div>
      </div>
    </main>
  );
}
