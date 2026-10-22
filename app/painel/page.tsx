'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PainelPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. Limpar sessão/tokens (ex: Supabase auth ou cookies)
    // await supabase.auth.signOut();
    
    // 2. Redirecionar para o login
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#070b13] text-white p-6">
      {/* BARRA SUPERIOR */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="font-black text-xl tracking-wider text-amber-400">ARENA VALE</div>
          <span className="text-xs text-amber-300 font-semibold uppercase">Painel Restrito</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Link para o site público */}
          <Link 
            href="/" 
            target="_blank" 
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            Ver Site Principal ↗
          </Link>

          {/* Botão de Logout */}
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition"
          >
            Sair 🔒
          </button>
        </div>
      </header>

      {/* FERRAMENTAS DE CONTEÚDO & CAMPEONATOS */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Ferramentas de Conteúdo & Campeonatos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Gerir Campeonatos */}
          <Link 
            href="/painel/campeonatos"
            className="group block p-6 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-amber-400/50 hover:bg-slate-800/60 transition shadow-lg"
          >
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-bold text-lg group-hover:text-amber-400 transition">Gerir Campeonatos</h3>
            <p className="text-sm text-slate-400 mt-1">Criar novas copas, jornadas e inscrições.</p>
          </Link>

          {/* Card: Publicar Notícias */}
          <Link 
            href="/painel/noticias"
            className="group block p-6 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-amber-400/50 hover:bg-slate-800/60 transition shadow-lg"
          >
            <div className="text-2xl mb-2">📰</div>
            <h3 className="font-bold text-lg group-hover:text-amber-400 transition">Publicar Notícias</h3>
            <p className="text-sm text-slate-400 mt-1">Lançar comunicados, destaques e novidades.</p>
          </Link>

          {/* Card: Atualizar TV Arena Vale */}
          <Link 
            href="/painel/tv"
            className="group block p-6 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-amber-400/50 hover:bg-slate-800/60 transition shadow-lg"
          >
            <div className="text-2xl mb-2">📺</div>
            <h3 className="font-bold text-lg group-hover:text-amber-400 transition">Atualizar TV Arena Vale</h3>
            <p className="text-sm text-slate-400 mt-1">Gerir transmissões e vídeos ao vivo.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
