'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    // 1. Acesso do Proprietário
    if (emailLimpo === 'pmmiranda2017@gmail.com' && senhaLimpa === 'VINIGUTO2020') {
      router.push('/proprietario');
      return;
    }

    // 2. Acesso da Coordenação Geral
    if (
      (emailLimpo === 'arenavale2026@gmail.com' ||
        emailLimpo === 'competicoes@arenavale.com.br' ||
        emailLimpo === 'imprensa@arenavale.com.br') &&
      senhaLimpa.length >= 4
    ) {
      router.push('/coordenador');
      return;
    }

    // 3. Acesso de Moderador
    if (emailLimpo.includes('moderador') || emailLimpo.includes('mesa')) {
      router.push('/moderador');
      return;
    }

    // 4. Acesso de Capitão
    if (emailLimpo.includes('capitao')) {
      router.push('/capitao');
      return;
    }

    // Caso não coincida com nenhum perfil credenciado
    setTimeout(() => {
      setCarregando(false);
      setErro('Credenciais inválidas. Verifique o seu e-mail e palavra-passe.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* CABEÇALHO */}
      <header className="border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-[#e50914]"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </Link>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </Link>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
          >
            ← Voltar ao Portal
          </Link>
        </div>
      </header>

      {/* ÁREA CENTRAL DO LOGIN */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white/15 bg-[#13161f] p-8 sm:p-10 shadow-2xl">
          <div className="text-center pb-6 border-b border-white/10">
            <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#e50914]">
              ÁREA RESTRITA
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Autenticação Oficial
            </h1>
            <p className="mt-2 text-xs text-[#8a92a6]">
              Acesso exclusivo para o Proprietário, Coordenadores, Moderadores e Capitães credenciados.
            </p>
          </div>

          {erro && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs font-bold text-red-400">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1.5">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@arenavale.com"
                className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#cad0e0] mb-1.5">
                Palavra-passe
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-2.5 text-xs text-white outline-none focus:border-[#e50914]"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-2 rounded-full bg-[#e50914] py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 transition hover:bg-[#ff1e27] disabled:opacity-50"
            >
              {carregando ? 'A autenticar...' : 'Entrar no Sistema →'}
            </button>
          </form>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-6 text-center text-xs text-[#8a92a6]">
        © 2026 Arena Vale · Sistema Seguro de Acesso
      </footer>
    </div>
  );
}
