import React, { useState } from 'react';
import {
  Wrench,
  Copy,
  Check,
  FileCode2,
  Terminal,
  ShieldAlert,
  Globe,
  BookOpen,
  Rocket,
  Circle,
  CheckCircle2,
  Lock,
  Send,
  Download,
  FolderArchive,
} from 'lucide-react';
import { PATCHES, APPLY_FLOW, Patch } from '../data/patchKit';
import { PatchDownload } from './PatchDownload';

const KIND_META: Record<Patch['kind'], { label: string; color: string; Icon: typeof ShieldAlert }> = {
  seguranca: { label: 'Segurança', color: '#ff3b47', Icon: Lock },
  conteudo: { label: 'Conteúdo', color: '#fbbf24', Icon: BookOpen },
  seo: { label: 'SEO / Migração', color: '#38bdf8', Icon: Globe },
};

const SEV: Record<Patch['severity'], { label: string; color: string; bg: string }> = {
  critico: { label: 'Bloqueante', color: '#ff3b47', bg: 'rgba(229,9,20,0.16)' },
  alto: { label: 'Alta', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  medio: { label: 'Média', color: '#38bdf8', bg: 'rgba(56,189,248,0.14)' },
};

const STORAGE = 'arena_patch_applied_v1';

export const PatchKit: React.FC = () => {
  const [filter, setFilter] = useState<'todos' | Patch['kind']>('todos');
  const [copied, setCopied] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem(STORAGE);
      if (s) return new Set(JSON.parse(s));
    } catch {
      /* ignore */
    }
    return new Set<string>();
  });

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2200);
  };

  const toggle = (id: string) =>
    setApplied((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });

  const visible = PATCHES.filter((p) => filter === 'todos' || p.kind === filter);
  const pct = Math.round((applied.size / PATCHES.length) * 100);

  return (
    <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8 flex-1">
      {/* ============ HEADER / HONEST FRAMING ============ */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0a0d16]">
        <div className="pointer-events-none absolute inset-0 arena-grid-bg opacity-70" />
        <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#e50914]/14 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-amber-500/12 blur-3xl" />

        <div className="relative z-10 grid gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/12 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
                <Wrench className="h-3.5 w-3.5" />
                10 correções prontas para colar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/12 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                <FolderArchive className="h-3.5 w-3.5" />
                .zip disponível para download
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-[0.92]">
              Não consigo editar o site
              <span className="block text-[#e50914]">publicado direto</span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
              Não tenho acesso à sua conta Vercel nem ao repositório do projeto, então{' '}
              <strong className="text-white">não consigo publicar por você</strong>. O que faço é entregar cada correção como{' '}
              <strong className="text-white">arquivo pronto, no caminho exato do projeto</strong>, com o trecho colável e o comando de confirmação. Você (ou quem cuida do código) cola, roda <code className="font-mono-code text-emerald-300">npm run build</code> e publica — o resto eu verifico aqui.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  t: 'Segurança primeiro',
                  d: 'Patches 1 e 2 trancam as rotas de cargo e limpam a tela de login. Podem subir sozinhos.',
                  c: '#ff3b47',
                },
                {
                  t: 'Sem quebrar o que já funciona',
                  d: 'Os patches preservam os 26 itens já confirmados no ar.',
                  c: '#34d399',
                },
                {
                  t: 'Pronto para o domínio novo',
                  d: 'URL base por variável: quando o DNS ativar, só muda o valor.',
                  c: '#38bdf8',
                },
              ].map((b) => (
                <div
                  key={b.t}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                  style={{ borderTopWidth: 3, borderTopColor: b.c }}
                >
                  <span className="block text-xs font-extrabold uppercase tracking-wide text-white">
                    {b.t}
                  </span>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{b.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="lg:col-span-4 rounded-3xl border border-white/15 bg-black/45 p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Checklist de aplicação
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-black text-white leading-none">
                {pct}%
              </span>
              <span className="font-mono-code text-sm text-amber-400">
                {applied.size}/{PATCHES.length}
              </span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e50914] via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Marque conforme aplicar cada arquivo. O progresso fica salvo neste navegador e o script de verificação reconfirma no ar depois do deploy.
            </p>

            <button
              type="button"
              onClick={() => document.getElementById('baixar-pasta')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e50914] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-[1.02] transition cursor-pointer"
            >
              <Download className="h-4 w-4" /> Ir para o download da pasta
            </button>
            <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
              <FolderArchive className="mt-0.5 h-3 w-3 shrink-0" />
              19 arquivos nos caminhos do projeto Next.js + LEIA-ME.md + verificar-arena.sh. O zip é montado no navegador ao clicar.
            </p>

            <a
              href="https://wa.me/5547988444404?text=Ol%C3%A1%21%20Seguem%20as%20corre%C3%A7%C3%B5es%20para%20o%20site%20da%20Arena%20Vale%20-%20preciso%20de%20ajuda%20para%20aplicar%20e%20publicar."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Send className="h-4 w-4" /> Enviar para quem publica
            </a>
          </div>
        </div>
      </section>

      {/* ============ DOWNLOAD DA PASTA (zip gerado no navegador) ============ */}
      <div id="baixar-pasta" className="scroll-mt-20">
        <PatchDownload />
      </div>

      {/* ============ FILTERS ============ */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-black uppercase text-white">
            Os arquivos para alterar
          </h2>
          <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-black/40 p-1">
            {(
              [
                { id: 'todos', label: 'Todos (10)', Icon: FileCode2 },
                { id: 'seguranca', label: 'Segurança (2)', Icon: Lock },
                { id: 'conteudo', label: 'Conteúdo (4)', Icon: BookOpen },
                { id: 'seo', label: 'SEO / Migração (4)', Icon: Globe },
              ] as const
            ).map((f) => {
              const Icon = f.Icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                    filter === f.id
                      ? 'bg-[#e50914] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {visible.map((p, idx) => {
            const kind = KIND_META[p.kind];
            const sev = SEV[p.severity];
            const done = applied.has(p.id);
            const KindIcon = kind.Icon;
            return (
              <article
                key={p.id}
                className={`rounded-3xl border p-6 sm:p-7 transition ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/[0.05]'
                    : p.severity === 'critico'
                    ? 'border-red-500/45 bg-[#150c10]'
                    : 'border-white/12 bg-[#0c101b] hover:border-white/25'
                }`}
                style={{ animation: `fadeSlide 0.45s ease-out ${idx * 0.05}s both` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      title={done ? 'Desmarcar patch' : 'Marcar como aplicado'}
                      className="mt-1 shrink-0 cursor-pointer transition hover:scale-110"
                    >
                      {done ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6" style={{ color: sev.color }} />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg font-mono-code text-[11px] font-black text-white" style={{ backgroundColor: `${kind.color}33` }}>
                          {p.order}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: sev.bg, color: sev.color }}
                        >
                          {sev.label}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${kind.color}22`, color: kind.color }}
                        >
                          <KindIcon className="h-3 w-3" />
                          {kind.label}
                        </span>
                        {done && (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                            Aplicado
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">
                        {p.title}
                      </h3>

                      <code className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1 font-mono-code text-[11px] text-amber-300">
                        <FileCode2 className="h-3 w-3" />
                        {p.file}
                      </code>

                      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-300">
                        <strong className="text-white">Situação: </strong>
                        {p.problem}
                      </p>
                      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-400">
                        <strong className="text-amber-300">Como aplicar: </strong>
                        {p.howTo}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copy(p.id, p.code)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#e50914] transition cursor-pointer"
                  >
                    {copied === p.id ? (
                      <>
                        <Check className="h-4 w-4" /> Código copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copiar código
                      </>
                    )}
                  </button>
                </div>

                {/* Code block */}
                <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#04060b] p-5 font-mono-code text-[11px] leading-relaxed text-slate-200">
                  <code>{p.code}</code>
                </pre>

                {/* Verify */}
                <div className="mt-4 rounded-2xl border border-cyan-500/25 bg-[#06121a] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                      <Terminal className="h-3 w-3" />
                      Confirmar depois de publicar
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(`${p.id}-v`, p.verify)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/15 cursor-pointer"
                    >
                      {copied === `${p.id}-v` ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="mt-2 overflow-x-auto font-mono-code text-[11px] text-cyan-100">
                    {p.verify}
                  </pre>
                  <p className="mt-1.5 text-[11px] font-semibold text-emerald-400/90">
                    {p.expected}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============ APPLY FLOW ============ */}
      <section className="rounded-3xl border border-white/12 bg-[#0c101b] p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <Rocket className="h-5 w-5 text-[#e50914]" />
          <h2 className="font-display text-3xl font-black uppercase text-white">
            Como colocar tudo no ar
          </h2>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Três formas de aplicar, do mais rápido ao mais completo — escolha a que cabe no seu acesso hoje.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            {
              t: 'A · Tenho o código no computador',
              d: 'Abra o terminal na pasta do projeto, crie/altere cada arquivo pelo caminho indicado, rode npm run build e depois npx vercel --prod (ou git push).',
              cmd: 'npm run build && npx vercel --prod',
              time: '20 a 40 min',
            },
            {
              t: 'B · Só tenho o GitHub/GitLab',
              d: 'No navegador, crie os arquivos nos caminhos indicados e faça commit direto na branch de produção. A Vercel publica sozinha a cada push.',
              cmd: 'git add . && git commit -m "fix: seguranca, conteudo e seo" && git push',
              time: '30 a 60 min',
            },
            {
              t: 'C · Não mexo em código',
              d: 'Copie o código de cada patch e o envie a um dev ou à equipe da agência — o botão "Enviar para quem publica" já prepara a mensagem no WhatsApp.',
              cmd: 'enviar os 10 trechos + caminhos de arquivo',
              time: 'depende de terceiros',
            },
          ].map((opt, i) => (
            <div
              key={opt.t}
              className="rounded-2xl border border-white/10 bg-black/35 p-5 transition hover:-translate-y-0.5 hover:border-white/25"
              style={{ animation: `fadeSlide 0.4s ease-out ${i * 0.07}s both` }}
            >
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                {opt.t}
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{opt.d}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-black/60 p-2.5">
                <span className="font-mono-code text-[10px] text-emerald-400">$</span>
                <code className="flex-1 break-all font-mono-code text-[10px] text-slate-300">
                  {opt.cmd}
                </code>
                <button
                  type="button"
                  onClick={() => copy(`flow-${i}`, opt.cmd)}
                  className="shrink-0 text-slate-500 hover:text-white cursor-pointer"
                >
                  {copied === `flow-${i}` ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <span className="mt-3 inline-block rounded-full bg-white/8 px-2.5 py-1 font-mono-code text-[10px] font-bold text-slate-300">
                ⏱ {opt.time}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {APPLY_FLOW.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-[#e50914]/50"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e50914]/20 font-mono-code text-xs font-black text-[#ff4b52]">
                  {s.step}
                </span>
                <Wrench className="h-3.5 w-3.5 text-slate-600" />
              </div>
              <h4 className="mt-2.5 text-xs font-extrabold uppercase leading-snug text-white">
                {s.title}
              </h4>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
