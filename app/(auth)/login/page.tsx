'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim().toLowerCase();

    // 1. Validação Proprietário (CFG6)
    if (emailTrim === 'pmmiranda2017@gmail.com' && senha === 'novaarena2020@') {
      localStorage.setItem('arenavale_user_email', emailTrim);
      localStorage.setItem('arenavale_user_nivel', 'Proprietario');
      setMensagem('Login de Proprietário bem-sucedido! A redirecionar...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    // 2. Validação Coordenadores Oficiais
    if (
      (emailTrim === 'lpostjen@gmail.com' && senha === 'arenaanera') ||
      (emailTrim === 'iigoranjo@gmail.com' && senha === 'Aren@123') ||
      emailTrim === 'arenavale2026@gmail.com'
    ) {
      localStorage.setItem('arenavale_user_email', emailTrim);
      localStorage.setItem('arenavale_user_nivel', 'Coordenador');
      setMensagem('Login de Coordenador bem-sucedido! A redirecionar...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    // 3. Validação Dinâmica de Contas (Moderadores, Capitães e Coordenadores adicionados)
    try {
      const savedAccounts = localStorage.getItem('cfg6_all_accounts');
      if (savedAccounts) {
        const accountsList = JSON.parse(savedAccounts);
        const match = accountsList.find((acc: any) => acc.email.toLowerCase() === emailTrim && acc.senha === senha);
        if (match) {
          localStorage.setItem('arenavale_user_email', emailTrim);
          localStorage.setItem('arenavale_user_nivel', match.nivel);
          setMensagem(`Login de ${match.nivel} efetuado! A redirecionar...`);
          setTimeout(() => router.push('/painel'), 1000);
          return;
        }
      }
    } catch {
      // Fallback local seguro
    }

    setMensagem('E-mail ou palavra-passe inválidos. Confira os dados e tente novamente.');
  };

  // Função de Acesso Rápido para o Proprietário
  const preencherAcessoProprietario = () => {
    setEmail('pmmiranda2017@gmail.com');
    setSenha('novaarena2020@');
    setMensagem('Credenciais de Proprietário preenchidas automaticamente.');
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arena Vale" className="h-10 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-md w-full px-6 py-12">
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-3">ÁREA RESTRITA · CFG6</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Portal de Acesso</h1>
            <p className="text-xs text-[#8a92a6] mt-2 uppercase">Hierarquia: Proprietário, Coordenador, Moderador e Capitão</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2">E-mail de Acesso</label>
              <input 
                id="login-email"
                name="email"
                autoComplete="username"
                required
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="acesso@arenavale.com" 
                className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2">Palavra-passe</label>
              <input 
                id="login-password"
                name="password"
                autoComplete="current-password"
                required
                type="password"
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                placeholder="••••••••" 
                className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none transition"
              />
            </div>

            {mensagem && (
              <div className="rounded-xl bg-[#e50914]/10 border border-[#e50914]/30 p-3 text-center text-xs font-bold text-amber-300">
                {mensagem}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e50914]/30 hover:scale-[1.02] transition"
            >
              Entrar no Painel 🔒
            </button>
          </form>

          {/* BOTÃO DE ACESSO RÁPIDO AO PROPRIETÁRIO */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button 
              type="button"
              onClick={preencherAcessoProprietario}
              className="w-full rounded-xl border border-amber-400/40 bg-amber-500/10 py-3 text-[11px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition"
            >
              ⭐ Acesso Rápido: Login do Proprietário
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="https://wa.me/5547988444404?text=Olá,%20preciso%20de%20suporte%20com%20o%20acesso%20ao%20painel%20da%20Arena%20Vale!" target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-wider text-[#8a92a6] hover:text-white transition">
              Suporte via WhatsApp ↗
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados. CNPJ: 40.694.741/0001-34
      </footer>
    </div>
  );
}
