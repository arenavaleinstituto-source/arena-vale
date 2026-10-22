'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PainelMetricas from '@/components/PainelMetricas';

export default function PainelPage() {
  const [userEmail, setUserEmail] = useState('');
  const [coordenadores, setCoordenadores] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const PROPRIETARIO_EMAIL = 'pmmiranda2017@gmail.com';

  useEffect(() => {
    const savedEmail = localStorage.getItem('arenavale_user_email');
    if (!savedEmail) {
      router.push('/login');
    } else {
      setUserEmail(savedEmail);
    }

    try {
      const savedCoords = localStorage.getItem('cfg6_coordenadores');
      if (savedCoords) {
        setCoordenadores(JSON.parse(savedCoords));
      } else {
        // Coordenadores padrão iniciais
        const iniciais = [
          { email: 'lpostjen@gmail.com', nivel: 'Coordenador Ouro' },
          { email: 'iigoranjo@gmail.com', nivel: 'Coordenador Ouro' },
          { email: 'arenavale2026@gmail.com', nivel: 'Coordenador Ouro' },
        ];
        setCoordenadores(iniciais);
        localStorage.setItem('cfg6_coordenadores', JSON.stringify(iniciais));
      }
    } catch {
      // Fallback
    }
  }, [router]);

  const handleAddCoordenador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail || !novaSenha) {
      setMensagem('Preencha o e-mail e a palavra-passe do novo coordenador.');
      return;
    }

    const novo = { email: novoEmail.trim().toLowerCase(), senha: novaSenha, nivel: 'Coordenador Autorizado' };
    const atualizados = [...coordenadores, novo];
    setCoordenadores(atualizados);
    localStorage.setItem('cfg6_coordenadores', JSON.stringify(atualizados));
    setNovoEmail('');
    setNovaSenha('');
    setMensagem('Coordenador autorizado adicionado com sucesso!');
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleRemoveCoordenador = (emailRemover: string) => {
    const atualizados = coordenadores.filter((c) => c.email !== emailRemover);
    setCoordenadores(atualizados);
    localStorage.setItem('cfg6_coordenadores', JSON.stringify(atualizados));
    setMensagem(`Coordenador ${emailRemover} removido com sucesso.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('arenavale_user_email');
    router.push('/login');
  };

  const isProprietario = userEmail.toLowerCase() === PROPRIETARIO_EMAIL;

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
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Centro de Comando & Autorizações</h1>
          <p className="text-xs text-[#8a92a6] mt-2 uppercase tracking-wide">
            Gestão operacional, monitorização de conteúdos, relatórios de tráfego e controlo de acessos CFG6.
          </p>
        </div>

        {/* COMPONENTE DE MÉTRICAS E RELÓGIO DE VISITAS */}
        <PainelMetricas />

        {/* SECÇÃO DE GESTÃO DE AUTORIZAÇÕES E COORDENADORES */}
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-2">
                CONTROLO DE ACESSOS · CFG6
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Coordenadores & Autorizações Ativas</h2>
              <p className="text-xs text-[#8a92a6] uppercase mt-1">Lista oficial de contas com permissão de gestão no ecossistema</p>
            </div>
            {isProprietario && (
              <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300">
                ⭐ Modo Proprietário Ativo (Controlo Total)
              </span>
            )}
          </div>

          {/* MENSAGEM DE ALERTA */}
          {mensagem && (
            <div className="mb-6 rounded-xl bg-[#e50914]/10 border border-[#e50914]/30 p-4 text-center text-xs font-bold text-amber-300">
              {mensagem}
            </div>
          )}

          {/* FORMULÁRIO PARA ADICIONAR (APENAS PROPRIETÁRIO OU COORDENADORES AUTORIZADOS) */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#07080c] p-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4">Adicionar Novo Coordenador / Autorização</h3>
            <form onSubmit={handleAddCoordenador} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input 
                type="email" 
                value={novoEmail} 
                onChange={(e) => setNovoEmail(e.target.value)} 
                placeholder="coordenador@arenavale.com" 
                className="rounded-xl border border-white/15 bg-[#11141d] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
              />
              <input 
                type="password" 
                value={novaSenha} 
                onChange={(e) => setNovaSenha(e.target.value)} 
                placeholder="Palavra-passe de acesso" 
                className="rounded-xl border border-white/15 bg-[#11141d] px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none"
              />
              <button 
                type="submit" 
                className="rounded-xl bg-[#e50914] py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
              >
                Conceder Acesso ➕
              </button>
            </form>
          </div>

          {/* LISTA DE COORDENADORES ATIVOS */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#b8c0d4] mb-2">Equipa Autorizada Registada</h3>
            {coordenadores.map((coord, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#07080c] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-white block">{coord.email}</span>
                    <span className="text-[10px] text-amber-400 uppercase">{coord.nivel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveCoordenador(coord.email)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition"
                >
                  Remover Acesso ✕
                </button>
              </div>
            ))}
          </div>

        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados. CNPJ: 40.694.741/0001-34
      </footer>
    </div>
  );
}
