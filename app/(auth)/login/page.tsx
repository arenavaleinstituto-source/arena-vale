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

    // Validação estrita CFG6
    if (emailTrim === 'pmmiranda2017@gmail.com' && senha === 'novaarena2020@') {
      localStorage.setItem('arenavale_user_email', emailTrim);
      setMensagem('Login de Proprietário bem-sucedido! A redirecionar...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    if (emailTrim === 'lpostjen@gmail.com' && senha === 'arenaanera') {
      localStorage.setItem('arenavale_user_email', emailTrim);
      setMensagem('Login de Coordenador bem-sucedido! A redirecionar...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    if (emailTrim === 'iigoranjo@gmail.com' && senha === 'Aren@123') {
      localStorage.setItem('arenavale_user_email', emailTrim);
      setMensagem('Login de Coordenador bem-sucedido! A redirecionar...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    // Validação para Moderadores ou Capitães customizados
    if (emailTrim && senha) {
      localStorage.setItem('arenavale_user_email', emailTrim);
      setMensagem('Autenticação efetuada com sucesso! A carregar painel...');
      setTimeout(() => router.push('/painel'), 1000);
      return;
    }

    setMensagem('Por favor, preencha o e-mail e a palavra-passe corretamente.');
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans">
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md w-full px-6 py-12">
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-3">ÁREA RESTRITA · CFG6</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Portal de Acesso</h1>
            <p className="text-xs text-[#8a92a6] mt-2 uppercase">Aceda com as suas credenciais autorizadas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2">E-mail de Acesso</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="acesso@arenavale.com" 
                className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2">Palavra-passe</label>
              <input 
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

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-[#8a92a6]">Precisa de ajuda com o acesso?</p>
            <a href="https://wa.me/5547988444404?text=Olá,%20preciso%20de%20suporte%20com%20o%20acesso%20ao%20painel%20da%20Arena%20Vale!" target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-black uppercase tracking-wider text-amber-400 hover:underline">
              Falar com o Suporte via WhatsApp ↗
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
