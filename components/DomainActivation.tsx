import React, { useEffect, useState } from 'react';
import {
  Globe,
  Activity,
  CheckCircle2,
  XOctagon,
  MinusCircle,
  Copy,
  Check,
  Terminal,
  ServerCog,
  ShieldCheck,
  AlertTriangle,
  Info,
  RadioTower,
  Route,
  Lock,
} from 'lucide-react';
import {
  DOMAIN,
  DNS_PROBES,
  PATH_A_RECORDS,
  PATH_B_RECORDS,
  CUTOVER_STEPS,
  DOMAIN_ALERTS,
} from '../data/domainData';

const STORAGE_KEY = 'arena_domain_cutover_v1';

type ProbeState = 'idle' | 'probing' | 'ativo' | 'inativo';

export const DomainActivation: React.FC = () => {
  const [probe, setProbe] = useState<ProbeState>('idle');
  const [probeDetail, setProbeDetail] = useState<string>('');
  const [path, setPath] = useState<'A' | 'B'>('A');
  const [copied, setCopied] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    return new Set<string>();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {
      /* ignore */
    }
  }, [done]);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /**
   * Sonda real no navegador: fetch em modo no-cors.
   * Se o DNS não existir ou o TLS falhar, a promise rejeita (domínio inativo).
   * Se responder, resolve como opaque (domínio ativo).
   */
  const runProbe = async () => {
    setProbe('probing');
    setProbeDetail('Consultando a zona DNS e tentando handshake HTTPS…');
    const targets = [
      `https://${DOMAIN.www}/?probe=${Date.now()}`,
      `https://${DOMAIN.apex}/?probe=${Date.now()}`,
    ];
    const results: string[] = [];
    let anyAlive = false;

    for (const url of targets) {
      try {
        await fetch(url, { mode: 'no-cors', cache: 'no-store' });
        results.push(`${url.split('/')[2]} → respondeu`);
        anyAlive = true;
      } catch {
        results.push(`${url.split('/')[2]} → sem resposta (DNS/TLS falhou)`);
      }
    }

    setProbeDetail(results.join('  ·  '));
    setProbe(anyAlive ? 'ativo' : 'inativo');
  };

  const pct = Math.round((done.size / CUTOVER_STEPS.length) * 100);
  const R = 34;
  const CIRC = 2 * Math.PI * R;

  const probeMeta = {
    idle: {
      color: '#94a3b8',
      label: 'Sonda parada',
      Icon: Activity,
    },
    probing: {
      color: '#fbbf24',
      label: 'Sondando…',
      Icon: RadioTower,
    },
    ativo: {
      color: '#34d399',
      label: 'DOMÍNIO ATIVO',
      Icon: CheckCircle2,
    },
    inativo: {
      color: '#ff3b47',
      label: 'Ainda sem resposta',
      Icon: XOctagon,
    },
  }[probe];

  const ProbeIcon = probeMeta.Icon;

  return (
    <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8 flex-1">
      {/* ============ ZONE INSPECTOR ============ */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0a0d16]">
        <div className="pointer-events-none absolute inset-0 arena-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#e50914]/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 p-6 sm:p-9 lg:grid-cols-12">
          {/* Left: domain identity + verdict */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
              <ServerCog className="h-3.5 w-3.5" />
              Diagnóstico de zona DNS · {DOMAIN.medidoEm}
            </span>

            <h1 className="mt-4 font-display text-5xl sm:text-7xl font-black uppercase tracking-tight text-white leading-[0.88]">
              www.arenavale
              <span className="text-[#e50914]">.com.br</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
              Confirmado: o erro não vem do código do site. O domínio{' '}
              <strong className="text-white">está registrado e com DNSSEC assinado</strong>, a delegação de nameservers está válida — mas a zona{' '}
              <strong className="text-amber-300">não tem nenhum registro A nem CNAME</strong>, e o subdomínio <code className="font-mono-code text-white">www</code> retorna{' '}
              <strong className="text-red-400">NXDOMAIN</strong>. Sem endereço para resolver, o navegador e o Google recebem "servidor não encontrado".
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'Registro no .br', v: 'Ativo', s: 'ok' as const },
                { k: 'Nameservers', v: 'a/b.sec.dns.br', s: 'ok' as const },
                { k: 'Apontamento A/CNAME', v: 'Ausente', s: 'bad' as const },
              ].map((b) => (
                <div
                  key={b.k}
                  className={`rounded-2xl border p-3.5 ${
                    b.s === 'ok'
                      ? 'border-emerald-500/35 bg-emerald-500/[0.07]'
                      : 'border-red-500/40 bg-red-500/[0.08]'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {b.k}
                  </span>
                  <span
                    className={`mt-1 block font-mono-code text-sm font-bold ${
                      b.s === 'ok' ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    {b.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live probe */}
          <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-black/45 p-6 flex flex-col justify-between gap-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Sonda ao vivo · testa direto do seu navegador
              </span>
              <div className="mt-3 flex items-center gap-3">
                <span className="relative flex h-4 w-4 shrink-0">
                  {probe === 'probing' && (
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: probeMeta.color }}
                    />
                  )}
                  <span
                    className="relative inline-flex h-4 w-4 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: probeMeta.color,
                      boxShadow: `0 0 18px ${probeMeta.color}`,
                    }}
                  />
                </span>
                <span
                  className="font-display text-2xl font-black uppercase tracking-wide transition-colors"
                  style={{ color: probeMeta.color }}
                >
                  {probeMeta.label}
                </span>
              </div>

              <div className="mt-3 min-h-[64px] rounded-xl border border-white/10 bg-black/50 p-3 font-mono-code text-[11px] leading-relaxed text-slate-300">
                {probeDetail || (
                  <span className="text-slate-500">
                    Clique em sondar para tentar resolver {DOMAIN.www} e {DOMAIN.apex} agora. Enquanto a zona não tiver registros, o resultado será "sem resposta".
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={runProbe}
              disabled={probe === 'probing'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e50914] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
            >
              <ProbeIcon className={`h-4 w-4 ${probe === 'probing' ? 'animate-spin' : ''}`} />
              {probe === 'probing' ? 'Sondando domínio…' : 'Sondar domínio agora'}
            </button>

            <div className="space-y-1.5 border-t border-white/10 pt-4 font-mono-code text-[11px] text-slate-400">
              <div className="flex items-center justify-between gap-2">
                <span>delegação checada</span>
                <span className="text-slate-200">{DOMAIN.delegacaoChecada.split('·')[0]}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>DS registrado</span>
                <span className="text-slate-200">{DOMAIN.dsRegistrado}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>titular (documento)</span>
                <span className="text-amber-300">{DOMAIN.titularDocumento}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Probe table */}
        <div className="relative z-10 border-t border-white/10 bg-black/30 px-6 py-6 sm:px-9">
          <h2 className="font-display text-2xl font-black uppercase text-white">
            As 6 consultas que fiz na sua zona
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {DNS_PROBES.map((p, i) => {
              const tone =
                p.status === 'ok'
                  ? { c: '#34d399', b: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.06]', Icon: CheckCircle2, t: 'OK' }
                  : p.status === 'ausente'
                  ? { c: '#fbbf24', b: 'border-amber-500/35', bg: 'bg-amber-500/[0.06]', Icon: MinusCircle, t: 'AUSENTE' }
                  : { c: '#ff3b47', b: 'border-red-500/40', bg: 'bg-red-500/[0.07]', Icon: XOctagon, t: 'FALHA' };
              const Icon = tone.Icon;
              return (
                <div
                  key={p.label}
                  className={`rounded-2xl border ${tone.b} ${tone.bg} p-4 transition hover:-translate-y-0.5`}
                  style={{ animation: `fadeSlide 0.4s ease-out ${i * 0.05}s both` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                      {p.label}
                    </span>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: `${tone.c}22`, color: tone.c }}
                    >
                      <Icon className="h-3 w-3" /> {tone.t}
                    </span>
                  </div>
                  <code className="mt-2 block break-all font-mono-code text-[10px] text-slate-500">
                    {p.query}
                  </code>
                  <p
                    className="mt-1.5 font-mono-code text-[11px] font-bold"
                    style={{ color: tone.c }}
                  >
                    {p.result}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{p.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ RECORDS: TWO PATHS ============ */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-3xl border border-white/12 bg-[#0c101b] p-6 sm:p-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52]">
            O que cadastrar para o domínio responder
          </span>
          <h2 className="mt-1 font-display text-3xl font-black uppercase text-white">
            Registros DNS · escolha o caminho
          </h2>

          <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => setPath('A')}
              className={`rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                path === 'A' ? 'bg-[#e50914] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              A · Manter DNS do Registro.br
            </button>
            <button
              type="button"
              onClick={() => setPath('B')}
              className={`rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                path === 'B' ? 'bg-[#e50914] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              B · Trocar nameservers
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            {path === 'A'
              ? 'Seus NS já são a.sec.dns.br / b.sec.dns.br (DNS gratuito do Registro.br). Basta editar a zona lá mesmo e criar 2 registros. É o caminho mais rápido — não muda nameserver, não precisa revalidar DNSSEC.'
              : 'Você entrega a gestão da zona para a Vercel ou para o Cloudflare. Eles criam os registros e o SSL sozinhos, e no Cloudflare você ainda ganha CDN no Brasil e banda ilimitada para os picos de audiência em dia de final ao vivo.'}
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#121726] text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="hidden px-4 py-3 sm:table-cell">TTL</th>
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(path === 'A' ? PATH_A_RECORDS : PATH_B_RECORDS).map((r) => (
                  <tr key={r.name} className="align-top transition hover:bg-white/[0.03]">
                    <td className="px-4 py-3.5 font-mono-code text-[11px] text-white">{r.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-cyan-500/15 px-2 py-0.5 font-mono-code text-[11px] font-bold text-cyan-300">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="block break-all font-mono-code text-[11px] font-bold text-emerald-300">
                        {r.value}
                      </code>
                      <span className="mt-1 block max-w-xs text-[11px] leading-relaxed text-slate-400">
                        {r.why}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 font-mono-code text-[11px] text-slate-400 sm:table-cell">
                      {r.ttl}
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => copy(r.name, `${r.type} ${r.value}`)}
                        className="rounded-lg border border-white/12 bg-white/5 p-1.5 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
                        title="Copiar registro"
                      >
                        {copied === r.name ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {path === 'A' && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.06] p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <p className="text-[11px] leading-relaxed text-slate-300">
                <strong className="text-cyan-200">Por que o apex usa A e o www usa CNAME?</strong> O padrão DNS proíbe CNAME no nome raiz da zona (ele conviveria com registros SOA/NS). Por isso a raiz recebe o IP direto da Vercel (<code className="font-mono-code text-white">76.76.21.21</code>) e o <code className="font-mono-code text-white">www</code> recebe o CNAME — que é justamente o nome que seu robots.txt declara.
              </p>
            </div>
          )}
        </div>

        {/* Alerts column */}
        <div className="lg:col-span-5 space-y-4">
          {DOMAIN_ALERTS.map((a) => {
            const tone =
              a.tone === 'warn'
                ? { b: 'border-amber-400/40', bg: 'bg-amber-500/[0.07]', c: '#fbbf24', Icon: AlertTriangle }
                : a.tone === 'ok'
                ? { b: 'border-emerald-500/35', bg: 'bg-emerald-500/[0.06]', c: '#34d399', Icon: ShieldCheck }
                : { b: 'border-cyan-500/30', bg: 'bg-cyan-500/[0.05]', c: '#38bdf8', Icon: Info };
            const Icon = tone.Icon;
            return (
              <div key={a.title} className={`rounded-2xl border ${tone.b} ${tone.bg} p-5`}>
                <div className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: tone.c }} />
                  <div>
                    <h3 className="text-sm font-extrabold uppercase leading-snug text-white">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{a.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-white/12 bg-[#0c101b] p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Route className="h-4 w-4 text-[#e50914]" />
              Endereços em jogo
            </div>
            <div className="mt-3 space-y-2 font-mono-code text-[11px]">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-black/40 px-3 py-2">
                <span className="text-slate-400 line-through decoration-red-500/60">
                  {DOMAIN.sitemapDeclarado}
                </span>
                <span className="shrink-0 text-red-400">NXDOMAIN</span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-black/40 px-3 py-2">
                <span className="break-all text-slate-300">{DOMAIN.sitemapReal}</span>
                <span className="shrink-0 text-emerald-400">200</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Assim que o CNAME do <code className="font-mono-code text-white">www</code> for criado e o projeto aceitar o domínio na Vercel, as duas pontas se encontram e o robots.txt passa a fazer sentido sozinho — sem editar arquivo nenhum.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CUTOVER CHECKLIST ============ */}
      <section className="rounded-3xl border border-white/12 bg-[#0c101b] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Progress ring */}
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC - (CIRC * pct) / 100}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e50914" />
                    <stop offset="60%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono-code text-sm font-black text-white">
                {pct}%
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52]">
                Checklist de virada
              </span>
              <h2 className="mt-1 font-display text-3xl font-black uppercase text-white leading-none">
                Do DNS ativo ao domínio no ar
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">
                {done.size} de {CUTOVER_STEPS.length} etapas concluídas · progresso salvo neste navegador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              SSL automático pela Vercel
            </span>
            {done.size > 0 && (
              <button
                type="button"
                onClick={() => setDone(new Set())}
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-3 lg:grid-cols-2">
          {CUTOVER_STEPS.map((s, i) => {
            const isDone = done.has(s.id);
            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/[0.06]'
                    : 'border-white/10 bg-black/30 hover:border-white/25'
                }`}
                style={{ animation: `fadeSlide 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="mt-0.5 shrink-0 cursor-pointer transition hover:scale-110"
                    title={isDone ? 'Desmarcar etapa' : 'Marcar etapa como concluída'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/25 font-mono-code text-[10px] font-black text-slate-400">
                        {s.id.split('-')[1]}
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-extrabold leading-snug ${
                          isDone ? 'text-emerald-200 line-through decoration-emerald-500/50' : 'text-white'
                        }`}
                      >
                        {s.title}
                      </h3>
                      <span className="rounded bg-white/8 px-2 py-0.5 font-mono-code text-[10px] font-bold text-slate-300">
                        ⏱ {s.minutes}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.detail}</p>

                    {s.command && (
                      <div className="mt-3 rounded-xl border border-cyan-500/25 bg-[#06121a] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            <Terminal className="h-3 w-3" /> Comando / trecho
                          </span>
                          <button
                            type="button"
                            onClick={() => copy(s.id, s.command!)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/15 transition cursor-pointer"
                          >
                            {copied === s.id ? (
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
                          {s.command}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-5">
          <Globe className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="flex-1 text-xs leading-relaxed text-slate-200">
            <strong className="text-emerald-300">Ordem que evita dor de cabeça:</strong> crie primeiro os registros DNS, depois adicione o domínio na Vercel e só então troque a variável de URL no código. Nessa ordem, o sitemap e o robots.txt já nascem apontando para um endereço que responde — e o Google nunca vê um sitemap quebrado.
          </p>
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
