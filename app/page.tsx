'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Simulação de Base de Dados de Utilizadores (Futuramente será substituído por Supabase/Firebase)
const USUARIOS_SISTEMA = [
  { 
    email: 'admin@arenavale.com.br', 
    senha: 'admin', 
    role: 'coordenador', 
    nome: 'Maurício (Admin)',
    permissoes: 'all' 
  },
  { 
    email: 'mesario1@arenavale.com.br', 
    senha: '123', 
    role: 'coordenador', 
    nome: 'Mesário Principal',
    permissoes: 'all' 
  },
  { 
    email: 'cliente@ligavale.com', 
    senha: '123', 
    role: 'organizador', 
    nome: 'Organizador Liga Vale',
    campeonatoId: 'camp-privado-001' // Acesso EXCLUSIVO apenas a este campeonato
  },
  { 
    email: 'capitao@valefc.com', 
    senha: '123', 
    role: 'capitao', 
    nome: 'João (Capitão)',
    equipeId: 'eqp-010'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const usuario = USUARIOS_SISTEMA.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
      setErro('Credenciais inválidas. Verifique o seu e-mail e senha.');
      return;
    }

    // Salva a sessão no navegador de forma segura
    localStorage.setItem('arenavale_sessao', JSON.stringify({
      nome: usuario.nome,
      role: usuario.role,
      campeonatoId: usuario.campeonatoId || null,
      equipeId: usuario.equipeId || null
    }));

    setSucesso(true);

    // Redirecionamento inteligente baseado no cargo do utilizador
    setTimeout(() => {
      if (usuario.role === 'coordenador') {
        window.location.href = '/coordenador'; // Painel Total + Mesário
      } else if (usuario.role === 'organizador') {
        window.location.href = `/organizador?liga=${usuario.campeonatoId}`; // Painel Restrito da Liga Dele
      } else if (usuario.role === 'capitao') {
        window.location.href = '/inscricao'; // Painel de Gestão da Equipa
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050609] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#e50914] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img src="/logo 02.png" alt="Arena Vale" className="mx-auto h-24 w-auto mix-blend-lighten drop-shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black italic uppercase tracking-tight text-white">
          ACESSO AO PORTAL
        </h2>
        <p className="mt-2 text-center text-sm text-[#8a92a6] font-medium uppercase tracking-wider">
          Insira as suas credenciais para gerir os seus eventos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0b0d14] py-8 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] sm:rounded-3xl border border-white/10 sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e50914] to-[#ff4b52]" />
          
          {sucesso ? (
            <div className="text-center py-10">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/50 mb-6">
                <span className="text-2xl text-emerald-400">✓</span>
              </span>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">Autenticado com Sucesso!</h3>
              <p className="text-sm text-[#8a92a6] mt-2">A preparar o seu painel de trabalho...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                  Endereço de E-mail
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-white/10 bg-[#050609] px-4 py-3.5 text-white placeholder-white/30 focus:border-[#e50914] focus:outline-none focus:ring-1 focus:ring-[#e50914] sm:text-sm transition-all"
                    placeholder="coordenador@arenavale.com.br"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                  Senha de Acesso
                </label>
                <div className="mt-2">
                  <input
                    id="senha"
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-white/10 bg-[#050609] px-4 py-3.5 text-white placeholder-white/30 focus:border-[#e50914] focus:outline-none focus:ring-1 focus:ring-[#e50914] sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {erro && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                  <p className="text-xs font-bold text-red-400">{erro}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-[#e50914] px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:ring-offset-2 focus:ring-offset-[#0b0d14]"
                >
                  Entrar no Painel Seguramente
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-[#555d6e]">
          <p>Esqueceu a sua senha? <a href="https://wa.me/5547988444404" target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 font-bold">Solicitar suporte técnico ↗</a></p>
        </div>
      </div>
    </div>
  );
}
