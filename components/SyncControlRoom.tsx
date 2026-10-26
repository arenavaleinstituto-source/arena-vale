import React, { useMemo, useState } from 'react';
import {
  Radio,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  Wrench,
  Rocket,
  GitCompareArrows,
  RefreshCw,
  Trophy,
  Globe,
  CalendarCheck,
  ImageIcon,
  Crown,
  KeyRound,
  Undo2,
  DoorOpen,
} from 'lucide-react';
import {
  BUILD_FINGERPRINT,
  BUILD_TIMELINE,
  SCAN_HEADLINE,
  DOMAIN_STATUS,
  NEW_ROUTES_SCAN,
  SYNC_ITEMS,
  DEPLOY_SEQUENCE,
  SyncItem,
} from '../data/syncData';

const SEV_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  critico: { label: 'Bloqueante', color: '#ff3b47', bg: 'rgba(229,9,20,0.16)' },
  alto: { label: 'Alta prioridade', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  medio: { label: 'Média prioridade', color: '#38bdf8', bg: 'rgba(56,189,248,0.14)' },
};

export const SyncControlRoom: React.FC = () => {
  const liveItems = SYNC_ITEMS.filter((i) => i.status === 'no-ar');
  const pendingItems = SYNC_ITEMS.filter((i) => i.status === 'pendente');
  const wave5 = liveItems.filter((i) => i.wave === 5);
  const wave4 = liveItems.filter((i) => i.wave === 4);
  const wave3 = liveItems.filter((i) => i.wave === 3);
  const wave2 = liveItems.filter((i) => i.wave === 2);

  const [fixedLocally, setFixedLocally] = useState<Set<string>>(new Set());
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [openWave, setOpenWave] = useState<2 | 3 | 4 | 5>(5);

  const toggleFixed = (id: string) =>
    setFixedLocally((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const livePct = Math.round((liveItems.length / SYNC_ITEMS.length) * 100);
  const localPct = Math.round(
    ((liveItems.length + fixedLocally.size) / SYNC_ITEMS.length) * 100
  );
  const criticalOpen = pendingItems.filter(
    (p) => p.severity === 'critico' && !fixedLocally.has(p.id)
  ).length;

  const diagnosis = useMemo(() => {
    if (fixedLocally.size === pendingItems.length) {
      return {
        tone: 'ok' as const,
        title: 'Código fechado — só publicar',
        text: 'Você marcou as 10 pendências como resolvidas. Publique e confirme pelo hash: se continuar page-6d4911af914250ac.js, o código não subiu.',
      };
    }
    if (criticalOpen > 0) {
      return {
        tone: 'alert' as const,
        title: '2 rotas de cargo alto estão abertas ao público',
        text: 'O deploy trouxe 5 rotas novas de hierarquia sem você pedir. /moderador e /capitao estão protegidos (307), mas /proprietario e /coordenador respondem 200 para qualquer visitante — a proteção está invertida. É o item a resolver primeiro.',
      };
    }
    return {
      tone: 'ok' as const,
      title: 'Sem bloqueantes em aberto',
      text: 'Restam ajustes de conteúdo, SEO e DNS.',
    };
  }, [criticalOpen, fixedLocally.size, pendingItems.length]);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const buildFullScript = () =>
    [
      '#!/usr/bin/env bash',
      '# Rotina de verificação — Arena Vale Sports (5ª conferência, 26/10/2026)',
      '# Uso: bash verificar-arena.sh https://seu-dominio.com.br',
      'DOMAIN="${1:-https://arena-vale.vercel.app}"',
      '',
      'echo "== BUILD (esperado após corrigir: diferente de page-6d4911af914250ac.js) =="',
      'curl -s "$DOMAIN/" | grep -oE "page-[a-z0-9]+\\.js" | sort -u',
      '',
      'echo "== ROTAS DE CARGO (as 5 devem retornar 307) ==========="',
      'for p in proprietario coordenador moderador capitao painel painel/usuarios; do echo -n "/$p : "; curl -s -o /dev/null -w "%{http_code}\\n" "$DOMAIN/$p"; done',
      '',
      'echo "== BLOQUEANTES HISTÓRICOS (não podem regredir) ==========="',
      'echo -n "/campeonatos   200: "; curl -s -o /dev/null -w "%{http_code}\\n" "$DOMAIN/campeonatos"',
      'echo -n "/manifest.json 200: "; curl -s -o /dev/null -w "%{http_code}\\n" "$DOMAIN/manifest.json"',
      'echo -n "/favicon.ico   200: "; curl -s -o /dev/null -w "%{http_code}\\n" "$DOMAIN/favicon.ico"',
      'echo -n "fundo-arena.jpg <350000 B: "; curl -s -o /dev/null -w "%{size_download}\\n" "$DOMAIN/fundo-arena.jpg"',
      '',
      'echo "== REGRESSÕES DE CONTEÚDO ==========="',
      'echo -n "CFG6 (esperado 0 em todas): "; for p in "" agenda login tv campeonatos projetosocial atletasdestaques; do curl -sL "$DOMAIN/$p"; done | grep -c "CFG6"',
      'echo -n "/campeonatos esvaziada? (a carregar esperado 0): "; curl -s "$DOMAIN/campeonatos" | grep -ci "a carregar"',
      'echo -n "/login revela hierarquia? (esperado 0): "; curl -s "$DOMAIN/login" | grep -oiE "propriet[aá]rio|coordenador|moderador|capit[aã]o|acesso r[aá]pido" | wc -l',
      'echo -n "PT-PT restante (esperado 0): "; for p in "" patrocinio login proprietario atletasdestaques termos; do curl -sL "$DOMAIN/$p"; done | grep -oiE "desport[a-z]*|palavra-passe|transmissao|equipas" | wc -l',
      '',
      'echo "== PENDÊNCIAS ==========="',
      ...pendingItems.map(
        (i) =>
          `echo -n "[${(i.severity || 'medio').toUpperCase()}] ${i.title.slice(0, 46)} => "\n${i.verifyCommand}`
      ),
      '',
      'echo "== DOMÍNIO PRÓPRIO ==========="',
      'curl -s -H "accept: application/dns-json" "https://dns.google/resolve?name=www.arenavale.com.br&type=A" | head -c 200; echo',
      '',
      'echo "== TÍTULOS DAS ROTAS ==========="',
      'for p in "" tv agenda atletasdestaques campeonatos patrocinio projetosocial privacidade termos login; do echo -n "/$p -> "; curl -s "$DOMAIN/$p" | grep -oE "<title>[^<]*</title>"; done',
    ].join('\n');

  const waveItems =
    openWave === 5 ? wave5 : openWave === 4 ? wave4 : openWave === 3 ? wave3 : wave2;

  return (
    <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8 flex-1">
      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0a0d16]">
        <div className="pointer-events-none absolute inset-0 arena-grid-bg opacity-70" />
        <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#e50914]/14 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/45 bg-emerald-500/12 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              {SCAN_HEADLINE.conference}ª conferência · varredura executada agora
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <GitCompareArrows className="h-3.5 w-3.5 text-[#ff4b52]" />
              {BUILD_TIMELINE.length} builds comparados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/45 bg-red-500/12 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-red-300">
              <KeyRound className="h-3.5 w-3.5" />
              {SCAN_HEADLINE.newRoutesFound} rotas novas encontradas
            </span>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-[0.92]">
                Mudou muita coisa
                <span className="block text-[#e50914]">sem você pedir</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Novo build no ar:{' '}
                <code className="font-mono-code text-emerald-300">{BUILD_FINGERPRINT.buildAtual}</code>. Varri as 16 rotas e encontrei{' '}
                <strong className="text-white">{SCAN_HEADLINE.newRoutesFound} páginas criadas nesta versão</strong> — uma hierarquia de cargos com{' '}
                <code className="font-mono-code text-slate-200">/proprietario</code>,{' '}
                <code className="font-mono-code text-slate-200">/coordenador</code>,{' '}
                <code className="font-mono-code text-slate-200">/moderador</code>,{' '}
                <code className="font-mono-code text-slate-200">/capitao</code> e{' '}
                <code className="font-mono-code text-slate-200">/noticias</code>. Junto vieram{' '}
                <strong className="text-white">{SCAN_HEADLINE.regressions} regressões</strong>: <code className="font-mono-code">/campeonatos</code> foi esvaziada (−51%), o <code className="font-mono-code">CFG6</code> voltou em 2 páginas e os jogos da agenda foram trocados.
              </p>
            </div>

            {/* Scoreboard */}
            <div className="lg:col-span-5 rounded-2xl border border-red-500/35 bg-black/45 p-5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Proteção das rotas de cargo (medido agora)
              </span>
              <div className="mt-3 space-y-1.5">
                {[
                  { k: '/proprietario', v: 'HTTP 200 · ABERTA', bad: true },
                  { k: '/coordenador', v: 'HTTP 200 · ABERTA', bad: true },
                  { k: '/moderador', v: 'HTTP 307 · protegida', bad: false },
                  { k: '/capitao', v: 'HTTP 307 · protegida', bad: false },
                  { k: '/painel/usuarios', v: 'HTTP 307 · protegida', bad: false },
                  { k: '/painel', v: 'HTTP 307 · protegida', bad: false },
                ].map((r) => (
                  <div
                    key={r.k}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                      r.bad
                        ? 'border-red-500/40 bg-red-500/[0.08]'
                        : 'border-emerald-500/25 bg-emerald-500/[0.05]'
                    }`}
                  >
                    <span className="font-mono-code text-[11px] text-slate-300">{r.k}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-mono-code text-[11px] font-bold ${
                        r.bad ? 'text-red-300' : 'text-emerald-300'
                      }`}
                    >
                      {r.bad ? <DoorOpen className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                Inversão de segurança: os cargos de menor privilégio estão trancados e os dois mais altos estão destrancados.
              </p>
            </div>
          </div>

          {/* ============ NEW ROUTES TABLE ============ */}
          <div className="mt-6 rounded-2xl border border-white/12 bg-black/35 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-black uppercase text-white">
                O que apareceu nesta versão
              </h2>
              <span className="font-mono-code text-[11px] text-slate-500">
                nenhuma dessas rotas está no sitemap nem é linkada pela home
              </span>
            </div>
            <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {NEW_ROUTES_SCAN.map((r, i) => {
                const tone =
                  r.state === 'critico'
                    ? { c: '#ff3b47', b: 'border-red-500/40', bg: 'bg-red-500/[0.07]' }
                    : r.state === 'alerta'
                    ? { c: '#fbbf24', b: 'border-amber-500/35', bg: 'bg-amber-500/[0.06]' }
                    : { c: '#34d399', b: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.05]' };
                return (
                  <div
                    key={r.path}
                    className={`rounded-xl border ${tone.b} ${tone.bg} p-3.5 transition hover:-translate-y-0.5`}
                    style={{ animation: `fadeSlide 0.35s ease-out ${i * 0.05}s both` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-mono-code text-xs font-bold text-white">{r.path}</code>
                      <span
                        className="rounded px-1.5 py-0.5 font-mono-code text-[10px] font-black"
                        style={{ backgroundColor: `${tone.c}22`, color: tone.c }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <span className="mt-1 block font-mono-code text-[10px] text-slate-500">
                      {r.size}
                    </span>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{r.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============ DOMAIN CARD ============ */}
          <div className="mt-5 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-[#1a1408] via-[#14100b] to-[#0d0f18] p-5">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
                <Globe className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                  Domínio próprio · re-testado, sem mudança
                </span>
                <h3 className="mt-1 font-display text-2xl font-black uppercase text-white leading-tight">
                  arenavale.com.br registrado, zona ainda sem apontamento
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {DOMAIN_STATUS.resolucaoDns}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 font-mono-code text-[11px]">
                  <div className="rounded-xl border border-red-500/30 bg-black/45 px-3 py-2">
                    <span className="text-slate-500">declarado no robots.txt: </span>
                    <span className="text-red-300">{DOMAIN_STATUS.declaradoNoRobots}</span>
                    <span className="ml-1 text-red-400">NXDOMAIN</span>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-black/45 px-3 py-2">
                    <span className="text-slate-500">sitemap real: </span>
                    <span className="text-emerald-300">arena-vale.vercel.app/sitemap.xml</span>
                    <span className="ml-1 text-emerald-400">200</span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-slate-400">
                  Passo a passo completo com sonda ao vivo na aba <strong className="text-amber-300">Ativar Domínio</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* ============ TIMELINE ============ */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Linha do tempo das publicações
            </span>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {BUILD_TIMELINE.map((b, i) => (
                <div key={b.js} className="relative">
                  {i < BUILD_TIMELINE.length - 1 && (
                    <span className="pointer-events-none absolute right-[-8px] top-8 hidden h-px w-4 bg-gradient-to-r from-white/25 to-transparent xl:block" />
                  )}
                  <div
                    className={`h-full rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                      b.current
                        ? 'border-emerald-400/50 bg-emerald-500/[0.08] shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          b.current ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {b.label}
                      </span>
                      {b.current && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                      )}
                    </div>
                    <code
                      className={`mt-2 block break-all font-mono-code text-[10px] font-bold ${
                        b.current ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {b.js}
                    </code>
                    <span className="mt-1 block text-[10px] text-slate-500">{b.when}</span>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{b.note}</p>
                    {b.fixes > 0 && (
                      <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                        <Trophy className="h-3 w-3" /> {b.fixes} confirmadas
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono-code text-[11px] text-slate-500">
              <span>etag: {BUILD_FINGERPRINT.etag}</span>
              <span>cache: {BUILD_FINGERPRINT.cache}</span>
              <span>{BUILD_FINGERPRINT.servidor}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ METERS ============ */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-3xl border border-white/12 bg-[#0c101b] p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Itens confirmados no ar
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-6xl font-black text-white leading-none">
                  {livePct}%
                </span>
                <span className="font-mono-code text-sm text-emerald-400">
                  {liveItems.length}/{SYNC_ITEMS.length}
                </span>
              </div>
            </div>
            <Trophy className="h-8 w-8 text-amber-400/70" />
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e50914] via-amber-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${livePct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {wave5.length} nesta conferência · {wave4.length} na 4ª · {wave3.length} na 3ª · {wave2.length} na 1ª/2ª. A porcentagem caiu de 81% para {livePct}% porque esta varredura descobriu {pendingItems.length} pontos novos, não porque algo piorou.
          </p>
        </div>

        <div className="lg:col-span-4 rounded-3xl border border-white/12 bg-[#0c101b] p-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Pronto no seu código local
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-6xl font-black text-amber-400 leading-none">
              {localPct}%
            </span>
            <span className="font-mono-code text-sm text-slate-400">
              {liveItems.length + fixedLocally.size}/{SYNC_ITEMS.length}
            </span>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${localPct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Marque as {pendingItems.length} pendências que você já tratou.
          </p>
        </div>

        <div
          className={`lg:col-span-3 rounded-3xl border p-6 flex flex-col justify-between ${
            diagnosis.tone === 'ok'
              ? 'border-emerald-400/45 bg-emerald-500/[0.08]'
              : 'border-red-500/45 bg-red-500/[0.08]'
          }`}
        >
          <div>
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                diagnosis.tone === 'ok' ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              Diagnóstico desta conferência
            </span>
            <h3 className="mt-2 text-lg font-extrabold uppercase leading-tight text-white">
              {diagnosis.title}
            </h3>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">{diagnosis.text}</p>
        </div>
      </section>

      {/* ============ DIFF BOARD ============ */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-black uppercase text-white">
              <span className="text-emerald-400">✓</span> Confirmado no ar
            </h2>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-300">
              {liveItems.length} itens
            </span>
          </div>

          <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-black/40 p-1">
            {(
              [
                { w: 5 as const, n: wave5.length, l: '5ª conf.' },
                { w: 4 as const, n: wave4.length, l: '4ª conf.' },
                { w: 3 as const, n: wave3.length, l: '3ª conf.' },
                { w: 2 as const, n: wave2.length, l: '1ª/2ª conf.' },
              ]
            ).map((t) => (
              <button
                key={t.w}
                type="button"
                onClick={() => setOpenWave(t.w)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                  openWave === t.w ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.l} ({t.n})
              </button>
            ))}
          </div>

          {waveItems.map((item, idx) => {
            const Icon = item.id.includes('agenda')
              ? CalendarCheck
              : item.id.includes('logo') || item.id.includes('imagem')
              ? ImageIcon
              : CheckCircle2;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-emerald-500/25 bg-[#0b1119] p-5 transition hover:border-emerald-400/60 hover:bg-[#0e1620] hover:-translate-y-0.5"
                style={{ animation: `fadeSlide 0.4s ease-out ${idx * 0.05}s both` }}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/90">
                      {item.area}
                    </span>
                    <h3 className="text-sm font-extrabold leading-snug text-white">{item.title}</h3>
                  </div>
                </div>

                {(item.before || item.after) && (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-white/8 bg-black/45 p-3 font-mono-code text-[11px] leading-relaxed">
                    {item.before && (
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 font-bold text-red-400">−</span>
                        <span className="break-all text-slate-500 line-through decoration-red-500/60">
                          {item.before}
                        </span>
                      </div>
                    )}
                    {item.after && (
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 font-bold text-emerald-400">+</span>
                        <span className="break-all text-emerald-300">{item.after}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.evidence}</p>
              </article>
            );
          })}
        </div>

        {/* PENDING */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-black uppercase text-white">
                <span className="text-[#e50914]">!</span> Em aberto ({pendingItems.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                2 bloqueantes de segurança + 4 altas + 4 refinamentos.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFixedLocally((prev) =>
                  prev.size === pendingItems.length
                    ? new Set()
                    : new Set(pendingItems.map((p) => p.id))
                )
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              {fixedLocally.size === pendingItems.length
                ? 'Desmarcar tudo'
                : 'Marcar tudo como corrigido'}
            </button>
          </div>

          {pendingItems.map((item: SyncItem, idx) => {
            const sev = SEV_STYLE[item.severity || 'medio'];
            const done = fixedLocally.has(item.id);
            const isRegression = item.area.includes('REGRESSÃO');
            const isSecurity = item.area.includes('Segurança');
            const TagIcon = isRegression ? Undo2 : isSecurity ? Crown : ShieldAlert;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/[0.06]'
                    : item.severity === 'critico'
                    ? 'border-red-500/50 bg-[#170c10] shadow-[0_0_40px_-18px_rgba(229,9,20,0.8)]'
                    : 'border-white/12 bg-[#0c101b] hover:border-white/25'
                }`}
                style={{ animation: `fadeSlide 0.4s ease-out ${idx * 0.05}s both` }}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleFixed(item.id)}
                    className="mt-0.5 shrink-0 cursor-pointer transition hover:scale-110"
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" style={{ color: sev.color }} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: sev.bg, color: sev.color }}
                      >
                        {sev.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <TagIcon className="h-3 w-3" />
                        {item.area}
                      </span>
                      {item.effort && (
                        <span className="inline-flex items-center gap-1 font-mono-code text-[10px] text-slate-400">
                          <Wrench className="h-3 w-3" /> {item.effort}
                        </span>
                      )}
                      {done && (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                          Corrigido localmente · aguardando deploy
                        </span>
                      )}
                    </div>

                    <h3
                      className={`mt-1.5 text-sm font-extrabold leading-snug ${
                        done ? 'text-emerald-200' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <div className="mt-2.5 rounded-xl border border-white/8 bg-black/40 p-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <ShieldAlert className="h-3 w-3" style={{ color: sev.color }} />
                        Medido nesta conferência
                      </span>
                      <p className="mt-1 font-mono-code text-[11px] leading-relaxed text-slate-300">
                        {item.evidence}
                      </p>
                    </div>

                    {item.verifyCommand && (
                      <div className="mt-3 rounded-xl border border-cyan-500/25 bg-[#06121a] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            <Terminal className="h-3 w-3" />
                            Como confirmar depois de publicar
                          </span>
                          <button
                            type="button"
                            onClick={() => copy(item.id, item.verifyCommand!)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/15 cursor-pointer"
                          >
                            {copiedCmd === item.id ? (
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
                        <pre className="mt-2 overflow-x-auto font-mono-code text-[11px] leading-relaxed text-cyan-100">
                          {item.verifyCommand}
                        </pre>
                        <p className="mt-1.5 text-[11px] font-semibold text-emerald-400/90">
                          {item.expected}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============ SEQUENCE ============ */}
      <section className="rounded-3xl border border-white/12 bg-[#0c101b] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52]">
              Sequência de correção
            </span>
            <h2 className="mt-1 font-display text-3xl font-black uppercase text-white">
              Ordem exata dos {DEPLOY_SEQUENCE.length} passos
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(buildFullScript());
              setCopiedScript(true);
              setTimeout(() => setCopiedScript(false), 2400);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/25 hover:bg-[#ff1e27] transition cursor-pointer"
          >
            {copiedScript ? (
              <>
                <Check className="h-4 w-4" /> Script copiado
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" /> Copiar rotina completa (.sh)
              </>
            )}
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {DEPLOY_SEQUENCE.map((s) => (
            <div
              key={s.step}
              className="group rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-[#e50914]/50 hover:bg-[#12161f]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e50914]/20 font-mono-code text-xs font-black text-[#ff4b52]">
                  {s.step}
                </span>
                <Rocket className="h-3.5 w-3.5 text-slate-600 transition group-hover:text-[#e50914]" />
              </div>
              <h3 className="mt-2.5 text-xs font-extrabold uppercase leading-snug text-white">
                {s.title}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{s.detail}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-black/60 p-2">
                <span className="font-mono-code text-[10px] text-emerald-400">$</span>
                <code className="flex-1 break-all font-mono-code text-[10px] text-slate-300">
                  {s.cmd}
                </code>
                <button
                  type="button"
                  onClick={() => copy(`step-${s.step}`, s.cmd)}
                  className="shrink-0 text-slate-500 hover:text-white cursor-pointer"
                >
                  {copiedCmd === `step-${s.step}` ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
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
