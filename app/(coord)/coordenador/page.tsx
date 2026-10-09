export default function CoordenadorDashboardPage() {
  const coordenadores = [
    { cargo: 'COORDENADOR GERAL', nome: 'Coordenação Arena Vale', email: 'arenavale2026@gmail.com', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMPETIÇÕES', nome: 'Gestão de Campeonatos', email: 'competicoes@arenavale.com.br', tel: '(47) 98844-4404' },
    { cargo: 'COORD. COMUNICAÇÃO', nome: 'Mídia & TV Arena Vale', email: 'imprensa@arenavale.com.br', tel: '(47) 98844-4404' }
  ];

  const usuarios = [
    { nome: 'Carlos Eduardo', papel: 'MODERADOR', equipe: 'Arena Vale Oficial', email: 'carlos@arenavale.com' },
    { nome: 'Lucas Silveira', papel: 'CAPITAO', equipe: 'Fênix Club', email: 'lucas@fenix.com' },
    { nome: 'Rodrigo Matos', papel: 'CAPITAO', equipe: 'Vale United', email: 'rodrigo@valeunited.com' }
  ];

  const modulos = [
    { titulo: 'ATLETAS EM DESTAQUE', subtitulo: 'Gestão de fotos, perfis e aprovação de atletas.', tag: 'EDITORIAL', link: '/coordenador/atletasdestaques', botao: 'Acessar Galeria →', destaque: true },
    { titulo: 'TRANSMISSÕES AO VIVO', subtitulo: 'Configuração do player, YouTube e placar da rodada.', tag: 'TV ARENA', link: '/#aovivo', botao: 'Configurar →', destaque: false },
    { titulo: 'SOLICITAÇÕES DE INSCRIÇÃO', subtitulo: 'Acompanhamento de novos atletas cadastrados no formulário.', tag: 'CADASTROS', link: '/inscricao', botao: 'Ver Inscrições →', destaque: false },
    { titulo: 'CAMPEONATOS & TABELAS', subtitulo: 'Estruturação de torneios regionais e fases.', tag: 'COMPETIÇÕES', link: '/#campeonatos', botao: 'Gerir Torneios →', destaque: false }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
          </a>

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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-1">
        {/* BANNER */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">
            PAINEL ADMINISTRATIVO
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            CENTRAL DE CONTROLE <br />
            <span className="text-[#e50914]">ARENA VALE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Gestão executiva da coordenação geral, atletas, equipas e permissões de acesso ao sistema.
          </p>
        </div>

        {/* 3 COORDENADORES */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white">
              Coordenadores Oficiais (3 Vagas)
            </h2>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#8a92a6]">
              3 / 3 Ocupadas
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {coordenadores.map((coord, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#13161f] p-6 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="rounded-full bg-[#e50914]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                      COORDENADOR {idx + 1}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400">● ATIVO</span>
                  </div>

                  <h3 className="mt-4 text-base font-black uppercase text-white">
                    {coord.nome}
                  </h3>
                  <p className="text-[11px] font-bold text-[#e50914] mt-0.5 uppercase tracking-wider">
                    {coord.cargo}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-[#8a92a6]">
                    <p className="truncate">✉ {coord.email}</p>
                    <p>📱 {coord.tel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODERADORES E CAPITÃES */}
        <section className="mb-12 rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl">
          <div className="border-b border-white/10 pb-5">
            <span className="text-xs font-black uppercase tracking-wider text-[#e50914]">
              EQUIPA & PERMISSÕES
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
              Moderadores e Capitães Credenciados
            </h2>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8a92a6] uppercase tracking-wider">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4">Equipa</th>
                  <th className="py-3 px-4">E-mail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map((u, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-bold text-white">{u.nome}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          u.papel === 'MODERADOR'
                            ? 'bg-[#e50914]/20 text-[#ff4d56]'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {u.papel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#cad0e0]">{u.equipe}</td>
                    <td className="py-4 px-4 text-[#8a92a6]">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* MÓDULOS DE ATALHO */}
        <div className="grid gap-6 sm:grid-cols-2">
          {modulos.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-[2rem] border p-8 shadow-xl transition hover:border-[#e50914]/50 ${
                m.destaque
                  ? 'border-[#e50914]/40 bg-[#161a24]'
                  : 'border-white/10 bg-[#13161f]'
              }`}
            >
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                  {m.tag}
                </span>
                <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                  {m.titulo}
                </h2>
                <p className="mt-2 text-sm text-[#8a92a6] leading-relaxed">
                  {m.subtitulo}
                </p>
              </div>

              <div className="mt-8 border-t border-white/5 pt-5">
                <a
                  href={m.link}
                  className={`inline-flex items-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider transition ${
                    m.destaque
                      ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27]'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                  }`}
                >
                  {m.botao}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>© 2026 Arena Vale · Sistema de Gestão Interna</div>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-white">Portal</a>
            <a href="/coordenador/atletasdestaques" className="hover:text-white">Galeria de Atletas</a>
            <a href="/login" className="hover:text-white">Sair</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
