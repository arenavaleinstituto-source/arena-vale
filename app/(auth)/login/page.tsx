'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // A lógica de conexão com o Supabase entrará aqui no próximo passo!
    console.log('Tentativa de login:', email);
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#101726] rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Arena Vale Sports" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h1>
          <p className="text-sm text-[#8a92a6] mt-2">Painel de Gestão Arena Vale</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
              placeholder="admin@arenavale.com.br"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-[#070b13] font-black uppercase tracking-wider py-3 rounded-lg transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[#8a92a6] hover:text-white transition">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
