import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  HeartHandshake,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export const ProjetoSocialFocus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'modelo'>('diagnostico');

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/40 bg-[#e50914]/15 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#ff4b52]">
            <HeartHandshake className="h-3.5 w-3.5" />
            Raio-X Específico · URL Enviada (#projetosocial)
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
            Conferência Profunda de{' '}
            <span className="text-[#e50914]">/#projetosocial</span> vs{' '}
            <span className="text-amber-400">/projetosocial</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-3xl">
            Descobrimos que o projeto possui uma página dedicada inteira (<code className="text-amber-300 font-mono-code">/projetosocial</code>), mas quem clica em &ldquo;Projeto Social&rdquo; no menu da Home cai apenas num bloco resumido que não leva até ela.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-[#0d101a] p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('diagnostico')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'diagnostico'
                ? 'bg-[#e50914] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Comparativo Atual (Bugs)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('modelo')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'modelo'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Modelo Ideal p/ Ir ao Ar
          </button>
        </div>
      </div>

      {activeTab === 'diagnostico' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card 1: Current #projetosocial on Home */}
          <div className="rounded-3xl border border-red-500/30 bg-[#0d101a] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                    COMO ESTÁ NA HOME HOJE
                  </span>
                  <h3 className="text-lg font-extrabold text-white font-mono-code">
                    arena-vale.vercel.app/#projetosocial
                  </h3>
                </div>
                <a
                  href="https://arena-vale.vercel.app/#projetosocial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Ver ao vivo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Miniature Visual Reproduction of Current Block */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#161a24] p-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">
                  IMPACTO & INCLUSÃO
                </span>
                <p className="mt-1 font-display text-2xl font-extrabold uppercase text-white">
                  PROJETO SOCIAL <span className="text-[#e50914]">ARENA VALE</span>
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  &ldquo;O <span className="underline decoration-red-500 decoration-wavy text-red-300">desporto</span> como ferramenta de transformação comunitária. Apoio para formação de jovens talentos...&rdquo;
                </p>
                <div className="mt-4">
                  <span className="inline-block rounded-full bg-[#e50914] px-4 py-2 text-[10px] font-black uppercase text-white">
                    💼 Apoiar o Projeto Social (só abre wa.me cru)
                  </span>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sem link para /projetosocial:</strong> Toda a história de 20 anos e +1.200 jovens atendidos fica invisível para quem navega pela Home.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sem foto real nem números:</strong> É o bloco visualmente mais simples da Home inteira, reduzindo a conversão de doadores/empresas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>WhatsApp sem mensagem contextual:</strong> O clique abre <code className="font-mono-code text-amber-300">wa.me/5547988444404</code> em branco, sem identificar que o contato veio do Projeto Social.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Hidden /projetosocial dedicated route */}
          <div className="rounded-3xl border border-amber-500/30 bg-[#0d101a] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    ROTA EXISTENTE (MAS ISOLADA E COM 3 ERROS)
                  </span>
                  <h3 className="text-lg font-extrabold text-white font-mono-code">
                    arena-vale.vercel.app/projetosocial
                  </h3>
                </div>
                <a
                  href="https://arena-vale.vercel.app/projetosocial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Ver ao vivo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {[
                  { num: '+1.200', label: 'Jovens' },
                  { num: '20 Anos', label: 'Histórico' },
                  { num: '15+', label: 'Comunidades' },
                  { num: '100%', label: 'Gratuito' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-white/10 bg-[#141927] p-3"
                  >
                    <span className="block text-sm sm:text-base font-black text-amber-400">
                      {kpi.num}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {kpi.label}
                    </span>
                  </div>
                ))}
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Link quebrado 404 no topo:</strong> No menu de <code className="font-mono-code text-slate-200">/projetosocial</code>, clicar em &ldquo;Campeonatos&rdquo; manda para <code className="font-mono-code text-red-400">/campeonatos</code> (Erro 404).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Etiqueta interna de dev exposta:</strong> Exibe <code className="font-mono-code text-amber-300">RESPONSABILIDADE SOCIAL · CFG6</code> no topo e <code className="font-mono-code text-amber-300">**CFG6**</code> com asteriscos literais no rodapé.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Falta jornada para famílias + fotos reais:</strong> Não há botão para pais inscreverem crianças nos núcleos gratuitos nem fotos das atividades em quadra/campo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ponto positivo:</strong> É a única página do site que já possui <code className="font-mono-code text-emerald-300">&lt;title&gt;</code> exclusivo e meta description otimizada para SEO!
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Blueprint Preview Ready for Production */
        <div className="rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#131826] via-[#0d111c] to-[#07080c] p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Referência Visual Recomendada para a Seção #projetosocial na Home
            </span>
            <span className="text-xs text-slate-400">
              Une impacto emocional + prova numérica + 2 caminhos de conversão
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-amber-300">
                IMPACTO SOCIAL & INCLUSÃO NO VALE
              </span>
              <h3 className="font-display text-4xl sm:text-5xl font-extrabold uppercase text-white leading-none">
                TRANSFORMANDO VIDAS ATRAVÉS DO{' '}
                <span className="text-[#e50914]">ESPORTE GRATUITO</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Há 20 anos formando cidadãos e revelando talentos em mais de 15 comunidades do Vale. Treinos gratuitos, acompanhamento escolar e inclusão esportiva para crianças e adolescentes.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { v: '+1.200', l: 'Jovens Atendidos' },
                  { v: '20 Anos', l: 'De História' },
                  { v: '15+ Polos', l: 'No Vale' },
                  { v: '100%', l: 'Gratuito' },
                ].map((item) => (
                  <div
                    key={item.l}
                    className="rounded-2xl border border-white/10 bg-black/35 p-3.5 text-center"
                  >
                    <span className="block font-display text-2xl font-extrabold text-amber-400">
                      {item.v}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.l}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30">
                  Conhecer Projeto & Fotos Reais <ArrowUpRight className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-amber-300">
                  <Users className="h-4 w-4" /> Inscrever Criança / Atleta
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0a0d16] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Bloco de Credibilidade & Captação Direta
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Empresas apoiadoras recebem selo oficial de Responsabilidade Social, prestação de contas periódica e visibilidade institucional nas transmissões da TV Arena Vale.
                </p>
                <div className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono-code text-[11px] text-slate-300 space-y-1">
                  <div>Razão / CNPJ: 40.694.741/0001-34</div>
                  <div className="text-emerald-400">✓ Relatório de Impacto 2026 (PDF)</div>
                  <div className="text-amber-300">✓ Termo LGPD de Imagem dos Alunos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
