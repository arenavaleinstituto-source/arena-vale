'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!email || !password) {
        throw new Error('Por favor, preencha o e-mail e a senha.');
      }

      // Redireciona diretamente para o painel do coordenador
      router.push('/coordenador');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* Topo / Voltar */}
      <div className="mx-auto w-full max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
            <span className="text-sm font-black tracking-tighter text-white">
              <span className="text-[#e50914]">A</span>V
            </span>
          </div>
          <span className="text-xl font-black tracking-tight leading-none text-white">
            ARENA <span className="text-[#e50914]">VALE</span>
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#8a92a6] transition hover:border-white/30 hover:text-white"
        >
          ← Voltar ao Portal
        </Link>
      </div>

      {/* Caixa de Login Centralizada */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 sm:p-10 shadow-2xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/30 bg-[#e50914]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#e50914]">
              PAINEL INTERNO
            </span>
            <h1 className="mt-4 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              ACESSO AO SISTEMA
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8a92a6]">
              Entre com as suas credenciais para gerir coberturas, atletas e transmissões.
            </p>
          </div>

          {errorMsg && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs font-semibold text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@arenavale.com.br"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                  Senha
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#e50914] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Acessando...' : 'Entrar no Painel'}
            </button>
          </form>

          {/* Atalho direto para o Painel do Coordenador */}
          <div className="mt-4">
            <Link
              href="/coordenador"
              className="block w-full text-center rounded-full border border-white/10 bg-white/5 py-3 text-xs font-bold text-[#cad0e0] transition hover:border-white/30 hover:bg-white/10"
            >
              Acessar Painel Direto (Modo Gestor) →
            </Link>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-[11px] text-[#8a92a6]">
              Suporte técnico ou credenciamento de equipe?{' '}
              <a
                href="https://wa.me/5547988444404"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#e50914] hover:underline"
              >
                Fale com a Arena Vale
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="py-6 text-center text-[11px] text-[#555d6e]">
        © 2026 Arena Vale · Mídia Esportiva. Todos os direitos reservados.
      </div>
    </div>
  );
}
