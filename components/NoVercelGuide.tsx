import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Server,
  Globe,
  ShieldCheck,
  ArrowRight,
  FolderArchive,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { NO_VERCEL_HOSTING_OPTIONS } from '../data/arenaSiteData';

interface NoVercelGuideProps {
  onOpenRebuiltSite: () => void;
}

export const NoVercelGuide: React.FC<NoVercelGuideProps> = ({
  onOpenRebuiltSite,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    NO_VERCEL_HOSTING_OPTIONS[0].id
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeOption =
    NO_VERCEL_HOSTING_OPTIONS.find((o) => o.id === selectedId) ||
    NO_VERCEL_HOSTING_OPTIONS[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10 py-8 sm:py-12 space-y-10">
      {/* Direct Answer Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#0e1b18] via-[#0c111d] to-[#07080c] p-6 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              SIM! 100% INDEPENDENTE DA VERCEL ANTIGA
            </span>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.03]">
              Já Refizemos o Site da{' '}
              <span className="text-[#e50914]">Arena Vale</span> Pronto Para
              Qualquer Hospedagem!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Você <strong className="text-white">não precisa ter acesso à conta antiga da Vercel</strong> para colocar a Arena Vale no ar. O site que acabamos de reconstruir aqui usa arquitetura{' '}
              <strong className="text-emerald-300">Estática Universal (React + Vite)</strong>: ele compila em uma pasta leve (<code className="font-mono-code text-amber-300">dist/</code>) que funciona gratuitamente no{' '}
              <strong className="text-white">Cloudflare Pages</strong>,{' '}
              <strong className="text-white">Netlify Drop</strong> (só arrastar a pasta!),{' '}
              <strong className="text-white">GitHub Pages</strong> ou em qualquer hospedagem comum (<strong className="text-white">Hostinger, Locaweb, cPanel</strong>).
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onOpenRebuiltSite}
                className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-[1.02] transition cursor-pointer"
              >
                Abrir Site Arena Vale Refeito Agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Summary Comparison Box: Old Vercel vs New Rebuilt */}
          <div className="lg:col-span-4 rounded-2xl border border-white/15 bg-[#070910]/90 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">
              O Que Mudou Nesta Reconstrução
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero dependência de servidor Next/Vercel:</strong> Roda até abrindo direto em servidor Apache/Nginx comum.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Todos os 24 erros corrigidos:</strong> <code className="font-mono-code text-emerald-300">#projetosocial</code> conectado à página completa com inscrição de jovens + PIX CNPJ.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Painel protegido por senha:</strong> Não fica mais aberto publicamente como no site antigo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sem imagem de 2,87 MB e sem bug %2520:</strong> Carregamento instantâneo no 4G e WhatsApp limpo.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Hosting Chooser */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#e50914]">
            ESCOLHA ONDE COLOCAR NO AR HOJE (SEM VERCEL)
          </span>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold uppercase text-white">
            4 Formas de Publicar Seu Novo Site em Minutos
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NO_VERCEL_HOSTING_OPTIONS.map((opt) => {
            const active = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedId(opt.id)}
                className={`text-left rounded-2xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                  active
                    ? 'border-[#e50914] bg-[#e50914]/15 shadow-lg shadow-[#e50914]/20'
                    : 'border-white/10 bg-[#0d101b] hover:border-white/25'
                }`}
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      active
                        ? 'bg-[#e50914] text-white'
                        : 'bg-white/10 text-amber-300'
                    }`}
                  >
                    {opt.badge}
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold text-white leading-snug">
                    {opt.name}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{opt.cost.split(' ')[0]} {opt.cost.split(' ')[1]}</span>
                  <span className="font-mono-code text-emerald-400 font-bold">
                    ⏱ {opt.timeToLive}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Option Step-by-Step */}
        <div className="rounded-3xl border border-white/15 bg-[#0c0f1a] p-6 sm:p-8 shadow-2xl grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Server className="h-5 w-5 text-[#e50914]" />
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeOption.name}
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-300">Indicado para:</strong>{' '}
              {activeOption.bestFor}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">
                  Custo Mensal
                </span>
                <span className="mt-0.5 block font-bold text-emerald-400">
                  {activeOption.cost}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">
                  Dificuldade
                </span>
                <span className="mt-0.5 block font-bold text-white">
                  {activeOption.difficulty}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 col-span-2 sm:col-span-1">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">
                  Tempo Até Entrar no Ar
                </span>
                <span className="mt-0.5 block font-mono-code font-bold text-amber-300">
                  {activeOption.timeToLive}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Passo a Passo Exato:
              </h4>
              {activeOption.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#080a12] p-3.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e50914] text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="rounded-2xl border border-white/15 bg-[#07090f] p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FolderArchive className="h-4 w-4" />
                  {activeOption.configSnippetTitle}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeOption.id, activeOption.configSnippet)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/15 transition cursor-pointer"
                >
                  {copiedId === activeOption.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono-code text-xs text-slate-200 bg-black/60 rounded-xl p-4 border border-white/5 overflow-x-auto leading-relaxed flex-1">
                {activeOption.configSnippet}
              </pre>
              <p className="mt-3 text-[11px] text-slate-400">
                Nota: O arquivo <code className="font-mono-code text-emerald-300">public/_redirects</code> já foi incluído automaticamente neste projeto para você!
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                <Globe className="h-4 w-4" />
                Dica de Ouro Sobre o Domínio Oficial
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Como o link antigo era um subdomínio provisório (<code className="font-mono-code text-amber-200">arena-vale.vercel.app</code>), basta registrar <strong className="text-white">arenavale.com.br</strong> ou <strong className="text-white">arenavalesports.com.br</strong> no <strong>Registro.br</strong> (R$ 40/ano) em seu próprio CNPJ (<code className="font-mono-code">40.694.741/0001-34</code>) e apontar para o Cloudflare ou Netlify. Assim o domínio será 100% seu para sempre!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAQ about losing Vercel access */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: HelpCircle,
            title: 'Preciso cancelar o site antigo na Vercel?',
            desc: 'Não é obrigatório agora. Assim que você publicar este novo site no seu domínio oficial (.com.br) e atualizar o link na bio do Instagram @arenavaleoficial e no WhatsApp, todo o público passará a acessar o endereço novo.',
          },
          {
            icon: Zap,
            title: 'E se no futuro eu criar uma conta minha na Vercel?',
            desc: 'Este projeto em React + Vite é 100% compatível tanto com Cloudflare/Netlify/Hostinger quanto com uma conta nova da Vercel no seu próprio e-mail, se um dia quiser.',
          },
          {
            icon: ShieldCheck,
            title: 'Como editar a Agenda de Jogos sem programador?',
            desc: 'No site refeito incluímos um "Painel do Coordenador" protegido por senha onde você pode adicionar/remover partidas da Agenda e testar tudo direto no navegador.',
          },
        ].map((faq) => {
          const Icon = faq.icon;
          return (
            <div
              key={faq.title}
              className="rounded-2xl border border-white/10 bg-[#0d101b] p-5 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <Icon className="h-4 w-4 text-[#e50914]" />
                {faq.title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.desc}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
};
