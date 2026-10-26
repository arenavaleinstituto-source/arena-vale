import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Projeto Social | Arena Vale Sports',
  description: 'Conheça o nosso compromisso social com o esporte, inclusão e desenvolvimento de crianças, jovens e atletas na comunidade.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProjetoSocialPage() {
  const pilaresSociais = [
    {
      titulo: 'Inclusão Através do Esporte',
      descricao: 'Garantimos acesso gratuito a treinos e campeonatos para centenas de jovens em situação de vulnerabilidade.',
      icone: '⚽',
    },
    {
      titulo: 'Educação e Cidadania',
      descricao: 'Aliamos a prática desportiva ao acompanhamento escolar e valores fundamentais de disciplina e respeito.',
      icone: '📚',
    },
    {
      titulo: 'Infraestrutura Comunitária',
      descricao: 'Desenvolvimento de projetos de melhoria em pistas e espaços públicos para a prática de atletismo e futebol.',
      icone: '🏟️',
    },
  ];

  const impactoNumeros = [
    { dado: '+1.200', rotulo: 'Jovens Beneficiados' },
    { dado: '20 Anos', rotulo: 'De Histórico e Dedicação' },
    { dado: '15+', rotulo: 'Comunidades Atendidas' },
    { dado: '100%', rotulo: 'Gratuito para Atletas do Projeto' },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arena Vale" className="h-10 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#b8c0d4]">
            <Link href="/" className="hover:text-white transition">Início</Link>
            <Link href="/tv" className="hover:text-white transition">TV Arena Vale</Link>
            <Link href="/campeonatos" className="hover:text-white transition">Campeonatos</Link>
            <Link href="/atletasdestaques" className="hover:text-white transition">Atletas</Link>
            <Link href="/patrocinio" className="text-[#e50914] hover:underline transition">Patrocínio</Link>
          </nav>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-16 space-y-16">
        
        {/* HERO DO PROJETO */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4f]">
            RESPONSABILIDADE SOCIAL · CFG6
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Projeto Social Arena Vale
          </h1>
          <p className="text-xs sm:text-sm text-[#8a92a6] uppercase tracking-wide leading-relaxed">
            O esporte como ferramenta de transformação social, apoio à formação de jovens talentos e integração comunitária no vale.
          </p>
        </div>

        {/* ESTATÍSTICAS DE IMPACTO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactoNumeros.map((item, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-[#11141d] p-6 text-center shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#e50914]/10 blur-2xl pointer-events-none" />
              <div className="text-2xl sm:text-4xl font-black text-[#e50914]">{item.dado}</div>
              <div className="text-[11px] font-bold text-[#b8c0d4] uppercase tracking-wider mt-2">{item.rotulo}</div>
            </div>
          ))}
        </div>

        {/* PILARES DO PROJETO */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Iniciativas e Apoio Direto</h2>
            <p className="text-xs text-[#8a92a6] uppercase mt-1">Como estruturamos o nosso impacto na comunidade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pilaresSociais.map((pilar, index) => (
              <div key={index} className="rounded-3xl border border-white/15 bg-[#11141d] p-8 shadow-xl flex flex-col justify-between relative group hover:border-[#e50914]/50 transition duration-300">
                <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />
                <div>
                  <div className="text-3xl mb-4 p-3 inline-block rounded-2xl bg-white/5 border border-white/10">{pilar.icone}</div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">{pilar.titulo}</h3>
                  <p className="text-xs text-[#8a92a6] uppercase leading-relaxed">{pilar.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA DE APOIO / PARCERIA */}
        <div className="rounded-[2.5rem] border border-[#e50914]/30 bg-gradient-to-r from-[#11141d] via-[#181d2a] to-[#11141d] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">Quer Apoiar o Nosso Projeto Social?</h2>
          <p className="text-xs sm:text-sm text-[#b8c0d4] max-w-xl mx-auto uppercase tracking-wide mb-8 leading-relaxed">
            Junte-se a nós como parceiro ou patrocinador e ajude a expandir o acesso ao esporte para mais crianças e atletas da região.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/5547988444404?text=Olá,%20gostaria%20de%20saber%20como%20apoiar%20o%20Projeto%20Social%20da%20Arena%20Vale!" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto rounded-full bg-[#e50914] px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition shadow-lg shadow-[#e50914]/30"
            >
              Apoiar o Projeto Social ↗
            </a>
            <Link 
              href="/patrocinio" 
              className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition"
            >
              Conhecer Cotas de Patrocínio
            </Link>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-8 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**. Todos os direitos reservados. CNPJ: 40.694.741/0001-34
      </footer>
    </div>
  );
}
