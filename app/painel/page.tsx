'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PainelMetricas from '@/components/PainelMetricas';

export default function PainelPage() {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('arenavale_user_email');
    if (!savedEmail) {
      router.push('/login');
    } else {
      setUserEmail(savedEmail);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arenavale_user_email');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO DO PAINEL */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-10 w-auto object-contain rounded-lg mix-blend-lighten" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block">PAINEL RESTRITO · CFG6</span>
              <span className="text-xs font-bold text-[#b8c0d4]">{userEmail || 'A carregar utilizador...'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden sm:inline-block rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
              Ver Site Principal ↗
            </Link>
            <button 
              onClick={handleLogout}
              className="rounded-full bg-[#e50914] px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
            >
              Sair 🔒
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO PAINEL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-10 space-y-8">
        
        {/* BOAS-VINDAS */}
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Bem-vindo ao Centro de Comando</h1>
          <p className="text-xs text-[#8a92a6] mt-2 uppercase tracking-wide">
            Gestão operacional, monitorização de conteúdos e relatórios de desempenho da Arena Vale Sports.
          </p>
        </div>

        {/* COMPONENTE DE MÉTRICAS E RELÓGIO DE VISITAS */}
        <PainelMetricas />

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados. CNPJ: 40.694.741/0001-34
      </footer>
    </div>
  );
}
