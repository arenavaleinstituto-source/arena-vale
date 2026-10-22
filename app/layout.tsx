<header className="w-full bg-[#070b13] py-4 border-b border-white/5">
  {/* O max-w-6xl é o que impede os itens de fugirem para as bordas da tela */}
  <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
    
    {/* 1. LOGO */}
    <div className="flex-shrink-0">
      <img src="/logo.png" alt="Arena Vale" className="h-10" />
    </div>

    {/* 2. MENU CENTRAL */}
    <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase text-slate-300">
      <Link href="/" className="hover:text-amber-400 transition">Início</Link>
      {/* ... outros links ... */}
      
      {/* CORREÇÃO DO LINK: Garanta que o href aponta para a rota correta */}
      <Link href="/projeto-social" className="hover:text-amber-400 transition">Projeto Social</Link>
    </nav>

    {/* 3. BOTÕES (ANUNCIE E PORTAIS) */}
    <div className="flex items-center gap-4 flex-shrink-0">
      {/* Mantenha as classes dos seus botões atuais aqui */}
      <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full">
        ANUNCIE
      </button>
      <button className="px-4 py-2 bg-transparent border border-amber-500 text-amber-500 text-xs font-bold rounded-full flex items-center gap-2">
        🔒 PORTAIS ▾
      </button>
    </div>

  </div>
</header>
