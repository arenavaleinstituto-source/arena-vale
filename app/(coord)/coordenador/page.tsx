export default function CoordenadorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            {/* GATILHO MASTER DO PROPRIETÁRIO */}
            <button
              type="button"
              onClick={() => {
                const senha = window.prompt('Digite a senha de Proprietário:');
                if (senha && senha.toUpperCase() === 'VINIGUTO2020') {
                  const nome = window.prompt('Nome do novo coordenador:');
                  if (nome) alert('Coordenador ' + nome + ' cadastrado!');
                } else if (senha) {
                  alert('Senha incorreta!');
                }
              }}
              title="Acesso Master"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition hover:border-amber-400"
            >
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </button>
            <a href="/" className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
            >
              Ver Site ↗
            </a>
            <a
              href="/login"
              className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              Sair
            </a>
          </div>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* Banner */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            PAINEL ADMINISTRATIVO
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            CENTRAL DE CONTROLE <br />
            <span className="text-[#e50914]">ARENA VALE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Gestão executiva da coordenação geral, atletas, equipas, transmissões e tabelas da temporada.
          </p>
        </div>

        {/* 3 COORDENADORES */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
                ALTA GESTÃO (3 VAGAS)
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Coordenadores Oficiais
              </h2>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#8a92a6]">
              3 / 3 Ocupadas
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">COORDENADOR 1</span>
                  <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                </div>
                <h3 className="mt-4 text-base font-black uppercase text-white">Coordenação Arena Vale</h3>
                <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">COORDENADOR GERAL</p>
                <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                  <p className="truncate">✉ arenavale2026@gmail.com</p>
                  <p>📱 (47) 98844-4404</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">COORDENADOR 2</span>
                  <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                </div>
                <h3 className="mt-4 text-base font-black uppercase text-white">Gestão de Campeonatos</h3>
                <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">COORD. COMPETIÇÕES</p>
                <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                  <p className="truncate">✉ competicoes@arenavale.com.br</p>
                  <p>📱 (47) 98844-4404</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">COORDENADOR 3</span>
                  <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                </div>
                <h3 className="mt-4 text-base font-black uppercase text-white">Mídia & TV Arena Vale</h3>
                <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">COORD. COMUNICAÇÃO</p>
                <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                  <p className="truncate">✉ imprensa@arenavale.com.br</p>
                  <p>📱 (47) 98844-4404</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MÓDULOS DE MANUTENÇÃO */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-[2rem] border border-[#e50914]/40 bg-[#161a24] p-8 shadow-xl">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">EDITORIAL</span>
              <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">ATLETAS EM DESTAQUE</h3>
              <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">Aprovação editorial, fotos e perfil de novos talentos.</p>
            </div>
            <div className="mt-8 border-t border-white/5 pt-5">
              <a href="/coordenador/atletasdestaques" className="inline-flex items-center rounded-full bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27]">Acessar Galeria →
