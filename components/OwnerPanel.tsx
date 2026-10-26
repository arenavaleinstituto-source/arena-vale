import React, { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Users,
  Megaphone,
  Armchair,
  X,
  Lock,
  Plus,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Ban,
  CircleCheck,
  Activity,
  ScrollText,
  Gauge,
  EyeOff,
  TriangleAlert,
  Search,
  BadgeCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

/* ================= TYPES ================= */
export type ArenaRole = 'coordenador' | 'moderador' | 'capitao';
export type MemberStatus = 'ativo' | 'pendente' | 'suspenso';

export interface Member {
  id: string;
  name: string;
  whatsapp: string;
  role: ArenaRole;
  scope: string;
  status: MemberStatus;
  since: string;
}

export interface LogEntry {
  id: string;
  at: string;
  action: string;
  target: string;
  tone: 'ok' | 'warn' | 'danger' | 'info';
}

interface RoleSpec {
  key: ArenaRole;
  label: string;
  headline: string;
  icon: typeof Users;
  color: string;
  soft: string;
  scopeLabel: string;
  scopeHint: string;
  duties: string[];
  permissions: { label: string; level: 'total' | 'parcial' | 'nenhum' }[];
  limits: string;
}

const ROLES: RoleSpec[] = [
  {
    key: 'coordenador',
    label: 'Coordenador',
    headline: 'Opera a temporada: campeonatos, agenda e arbitragem',
    icon: Users,
    color: '#fbbf24',
    soft: 'rgba(251,191,36,0.14)',
    scopeLabel: 'Escopo por modalidade / temporada',
    scopeHint: 'Ex.: Futsal · Temporada 2026',
    duties: [
      'Criar e editar campeonatos, grupos e chaves',
      'Publicar e remarcar jogos na Agenda Oficial',
      'Escalar equipe de arbitragem (delegado, árbitro e auxiliares)',
      'Aprovar ou recusar inscrição de equipes',
      'Homologar súmulas, gols e classificações',
    ],
    permissions: [
      { label: 'Campeonatos e tabelas', level: 'total' },
      { label: 'Agenda de jogos', level: 'total' },
      { label: 'Arbitragem e súmulas', level: 'total' },
      { label: 'Notícias e comunicados', level: 'parcial' },
      { label: 'Cotas de patrocínio', level: 'nenhum' },
      { label: 'Gestão de cargos', level: 'nenhum' },
    ],
    limits: 'Não altera contratos comerciais nem concede acessos a outros usuários.',
  },
  {
    key: 'moderador',
    label: 'Moderador',
    headline: 'Cuida do que vai ao ar: conteúdo, redes e transmissão',
    icon: Megaphone,
    color: '#38bdf8',
    soft: 'rgba(56,189,248,0.14)',
    scopeLabel: 'Escopo editorial / canal',
    scopeHint: 'Ex.: TV Arena Vale · Notícias',
    duties: [
      'Publicar, revisar e arquivar notícias e comunicados oficiais',
      'Moderar comentários e o chat das transmissões ao vivo',
      'Aprovar fotos e fichas de atletas em destaque',
      'Responder mensagens oficiais no Instagram e YouTube',
      'Sinalizar conteúdos impróprios ao proprietário',
    ],
    permissions: [
      { label: 'Notícias e comunicados', level: 'total' },
      { label: 'Chat e comentários ao vivo', level: 'total' },
      { label: 'Fotos e fichas de atletas', level: 'total' },
      { label: 'Agenda de jogos', level: 'parcial' },
      { label: 'Campeonatos e súmulas', level: 'nenhum' },
      { label: 'Gestão de cargos', level: 'nenhum' },
    ],
    limits: 'Publica conteúdo, mas não altera resultados, tabelas nem libera acessos.',
  },
  {
    key: 'capitao',
    label: 'Capitão',
    headline: 'Representa uma equipe: elenco, presença e súmula',
    icon: Armchair,
    color: '#ff4b52',
    soft: 'rgba(229,9,20,0.14)',
    scopeLabel: 'Escopo por equipe (1 time)',
    scopeHint: 'Ex.: Fênix Club · Futsal',
    duties: [
      'Cadastrar e editar o elenco da própria equipe',
      'Confirmar presença dos atletas em cada rodada',
      'Solicitar remarcação de jogo com justificativa',
      'Consultar súmula, cartões e classificação do seu time',
      'Receber comunicados oficiais da coordenação',
    ],
    permissions: [
      { label: 'Elenco da própria equipe', level: 'total' },
      { label: 'Confirmação de presença', level: 'total' },
      { label: 'Súmula do próprio time', level: 'parcial' },
      { label: 'Agenda de jogos', level: 'parcial' },
      { label: 'Outras equipes', level: 'nenhum' },
      { label: 'Gestão de cargos', level: 'nenhum' },
    ],
    limits: 'Acesso restrito à própria equipe; não vê dados de times adversários.',
  },
];

const SEED_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'Ricardo Nunes',
    whatsapp: '(47) 99812-4477',
    role: 'coordenador',
    scope: 'Futsal · Temporada 2026',
    status: 'ativo',
    since: '12/01/2026',
  },
  {
    id: 'mem-2',
    name: 'Elaine Souza',
    whatsapp: '(47) 99640-2210',
    role: 'coordenador',
    scope: 'Basquetebol e Voleibol · 2026',
    status: 'ativo',
    since: '03/02/2026',
  },
  {
    id: 'mem-3',
    name: 'Diego Marques',
    whatsapp: '(47) 98877-1090',
    role: 'moderador',
    scope: 'TV Arena Vale · Notícias e redes',
    status: 'ativo',
    since: '18/02/2026',
  },
  {
    id: 'mem-4',
    name: 'Gabriel Mendes',
    whatsapp: '(47) 99120-8834',
    role: 'capitao',
    scope: 'Fênix Club · Futsal',
    status: 'ativo',
    since: '25/02/2026',
  },
  {
    id: 'mem-5',
    name: 'Lucas Silveira',
    whatsapp: '(47) 99455-3311',
    role: 'capitao',
    scope: 'Vale United · Basquetebol',
    status: 'ativo',
    since: '02/03/2026',
  },
  {
    id: 'mem-6',
    name: 'Anderson Lima',
    whatsapp: '(47) 99310-7788',
    role: 'capitao',
    scope: 'Vôlei Futuro Vale · Voleibol',
    status: 'pendente',
    since: '24/10/2026',
  },
];

const SEED_LOG: LogEntry[] = [
  {
    id: 'log-1',
    at: '24/10/2026 · 18:02',
    action: 'Solicitação de acesso recebida',
    target: 'Anderson Lima → Capitão (Vôlei Futuro Vale)',
    tone: 'warn',
  },
  {
    id: 'log-2',
    at: '20/10/2026 · 09:41',
    action: 'Permissão ampliada',
    target: 'Ricardo Nunes → Coordenação de Futsal 2026',
    tone: 'ok',
  },
  {
    id: 'log-3',
    at: '14/10/2026 · 21:15',
    action: 'Conteúdo arquivado por revisão',
    target: 'Comunicado "Rodada adiada" (Moderador Diego Marques)',
    tone: 'info',
  },
];

const STORAGE_MEMBERS = 'arena_owner_members_v1';
const STORAGE_LOG = 'arena_owner_log_v1';
const OWNER_PASS = 'arena2026';

/* ================= COMPONENT ================= */
interface OwnerPanelProps {
  onClose: () => void;
}

export const OwnerPanel: React.FC<OwnerPanelProps> = ({ onClose }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'visao' | ArenaRole | 'registro'>('visao');
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_MEMBERS);
      if (s) return JSON.parse(s);
    } catch {
      /* ignore */
    }
    return SEED_MEMBERS;
  });
  const [log, setLog] = useState<LogEntry[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_LOG);
      if (s) return JSON.parse(s);
    } catch {
      /* ignore */
    }
    return SEED_LOG;
  });
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // New member form
  const [showForm, setShowForm] = useState(false);
  const [fName, setFName] = useState('');
  const [fWhats, setFWhats] = useState('');
  const [fRole, setFRole] = useState<ArenaRole>('capitao');
  const [fScope, setFScope] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
    } catch {
      /* ignore */
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOG, JSON.stringify(log));
    } catch {
      /* ignore */
    }
  }, [log]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const pushLog = (action: string, target: string, tone: LogEntry['tone']) => {
    setLog((prev) => [
      {
        id: `log-${Date.now()}`,
        at: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        action,
        target,
        tone,
      },
      ...prev,
    ]);
  };

  const submitUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.trim() === OWNER_PASS) {
      setUnlocked(true);
      setError('');
      pushLog('Sessão master iniciada', 'Painel do Proprietário (acesso oculto via logo do rodapé)', 'info');
    } else {
      setError('Palavra-passe incorreta. Acesso registrado no log de auditoria.');
      pushLog('Tentativa de acesso negada', 'Painel do Proprietário', 'danger');
    }
  };

  const counts = useMemo(() => {
    const base = { coordenador: 0, moderador: 0, capitao: 0 } as Record<ArenaRole, number>;
    members.forEach((m) => (base[m.role] += 1));
    return base;
  }, [members]);

  const pending = members.filter((m) => m.status === 'pendente').length;
  const active = members.filter((m) => m.status === 'ativo').length;

  const filtered = members.filter((m) => {
    const q = query.toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.scope.toLowerCase().includes(q) ||
      m.whatsapp.toLowerCase().includes(q)
    );
  });

  const changeStatus = (id: string, status: MemberStatus) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const label =
      status === 'ativo'
        ? 'Acesso liberado'
        : status === 'suspenso'
        ? 'Acesso suspenso'
        : 'Marcado como pendente';
    pushLog(label, `${m.name} · ${ROLES.find((r) => r.key === m.role)?.label}`, status === 'ativo' ? 'ok' : status === 'suspenso' ? 'danger' : 'warn');
    flash(`${m.name}: ${label.toLowerCase()}`);
  };

  const changeRole = (id: string, dir: 'up' | 'down') => {
    const order: ArenaRole[] = ['capitao', 'moderador', 'coordenador'];
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const idx = order.indexOf(m.role);
    const next = dir === 'up' ? Math.min(order.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (next === idx) {
      flash(dir === 'up' ? 'Já é o cargo mais alto concedível' : 'Já é o cargo de entrada');
      return;
    }
    const newRole = order[next];
    setMembers((prev) => prev.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
    pushLog(
      dir === 'up' ? 'Cargo elevado' : 'Cargo rebaixado',
      `${m.name} → ${ROLES.find((r) => r.key === newRole)?.label}`,
      dir === 'up' ? 'ok' : 'warn'
    );
    flash(`${m.name} agora é ${ROLES.find((r) => r.key === newRole)?.label}`);
  };

  const removeMember = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setMembers((prev) => prev.filter((x) => x.id !== id));
    pushLog('Acesso revogado', `${m.name} · ${m.scope}`, 'danger');
    flash(`Acesso de ${m.name} revogado`);
  };

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) return;
    const created: Member = {
      id: `mem-${Date.now()}`,
      name: fName.trim(),
      whatsapp: fWhats.trim() || '(47) 9----0000',
      role: fRole,
      scope: fScope.trim() || ROLES.find((r) => r.key === fRole)!.scopeHint.replace('Ex.: ', ''),
      status: 'pendente',
      since: new Date().toLocaleDateString('pt-BR'),
    };
    setMembers((prev) => [created, ...prev]);
    pushLog('Novo acesso concedido (aguardando ativação)', `${created.name} → ${ROLES.find((r) => r.key === fRole)?.label}`, 'ok');
    flash(`${created.name} adicionado como ${ROLES.find((r) => r.key === fRole)?.label}`);
    setFName('');
    setFWhats('');
    setFScope('');
    setShowForm(false);
    setTab(fRole);
  };

  const roleOf = (key: ArenaRole) => ROLES.find((r) => r.key === key)!;

  /* ---------- LOCK SCREEN ---------- */
  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#04050a]/95 backdrop-blur-md p-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-400/35 bg-gradient-to-b from-[#171322] via-[#0e1019] to-[#07080c] p-8 shadow-[0_40px_120px_-20px_rgba(251,191,36,0.25)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/45 bg-amber-500/15 text-amber-300">
              <Crown className="h-7 w-7" />
            </span>
            <span className="mt-4 inline-block rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">
              Alta administração
            </span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white leading-none">
              Painel do Proprietário
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Acesso oculto acionado pela logomarca do rodapé. Aqui você concede e revoga os cargos de{' '}
              <span className="text-amber-300 font-semibold">Coordenador</span>,{' '}
              <span className="text-sky-300 font-semibold">Moderador</span> e{' '}
              <span className="text-[#ff6b72] font-semibold">Capitão</span>.
            </p>
          </div>

          <form onSubmit={submitUnlock} className="relative mt-7 space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                E-mail do proprietário
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="proprietario@arenavalesports.com.br"
                className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Senha mestra
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-black/45 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                <TriangleAlert className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-black shadow-lg shadow-amber-500/25 transition hover:scale-[1.02] cursor-pointer"
            >
              Acessar gestão master
            </button>

            <button
              type="button"
              onClick={() => {
                setPass(OWNER_PASS);
                setEmail('proprietario@arenavalesports.com.br');
              }}
              className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-amber-300 transition cursor-pointer"
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              Preencher credencial de demonstração
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------- PANEL ---------- */
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#06070c]">
      {/* Ambient layers */}
      <div className="pointer-events-none fixed inset-0 arena-grid-bg opacity-40" />
      <div className="pointer-events-none fixed -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 bottom-0 h-96 w-96 rounded-full bg-[#e50914]/12 blur-3xl" />

      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-amber-400/25 bg-[#0a0b12]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/45 bg-amber-500/15 text-amber-300">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-black uppercase tracking-wide text-white leading-none">
                  Painel do Proprietário
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/12 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                  <EyeOff className="h-2.5 w-2.5" /> Acesso oculto
                </span>
              </div>
              <p className="mt-0.5 font-mono-code text-[10px] text-slate-500">
                sessão master · {email || 'proprietario@arenavalesports.com.br'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => flash('Sessão master expira após 15 min sem atividade')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Gauge className="h-3 w-3 text-amber-400" /> Sessão protegida
            </button>
            <button
              type="button"
              onClick={() => {
                pushLog('Sessão master encerrada', 'Painel do Proprietário', 'info');
                setUnlocked(false);
                setPass('');
                setError('');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <LogOut className="h-3 w-3" /> Bloquear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e50914] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-[#ff1e27] transition cursor-pointer"
            >
              <X className="h-3 w-3" /> Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-[1360px] gap-1 overflow-x-auto px-4 pb-2.5 no-scrollbar sm:px-6">
          {(
            [
              { id: 'visao', label: 'Visão geral', Icon: Gauge },
              ...ROLES.map((r) => ({
                id: r.key as ArenaRole,
                label: `${r.label} (${counts[r.key]})`,
                Icon: r.icon,
                color: r.color,
              })),
              { id: 'registro', label: 'Registro de auditoria', Icon: ScrollText },
            ] as const
          ).map((t) => {
            const Icon = t.Icon;
            const isActive = tab === t.id;
            const color = 'color' in t ? (t.color as string) : '#fbbf24';
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as typeof tab)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                  isActive
                    ? 'bg-white/12 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                style={isActive ? { boxShadow: `inset 0 -2px 0 ${color}` } : undefined}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: isActive ? color : undefined }} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 py-7 sm:px-6 space-y-7">
        {/* ============ VISÃO GERAL ============ */}
        {tab === 'visao' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { k: 'Acessos ativos', v: active, s: `${members.length} cadastrados`, c: '#34d399', Icon: BadgeCheck },
                { k: 'Aguardando aprovação', v: pending, s: 'solicitações de capitães', c: '#fbbf24', Icon: Activity },
                { k: 'Coordenadores', v: counts.coordenador, s: 'operam a temporada', c: '#fbbf24', Icon: Users },
                { k: 'Moderadores', v: counts.moderador, s: 'cuidam do conteúdo', c: '#38bdf8', Icon: Megaphone },
              ].map((card, i) => {
                const Icon = card.Icon;
                return (
                  <div
                    key={card.k}
                    className="group rounded-2xl border border-white/10 bg-[#0d1019] p-5 transition hover:-translate-y-0.5 hover:border-white/25"
                    style={{ animation: `fadeSlide 0.4s ease-out ${i * 0.05}s both` }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {card.k}
                      </span>
                      <Icon className="h-4 w-4 transition group-hover:scale-110" style={{ color: card.c }} />
                    </div>
                    <span className="mt-2 block font-display text-5xl font-black leading-none text-white">
                      {card.v}
                    </span>
                    <span className="mt-1.5 block text-[11px] text-slate-500">{card.s}</span>
                  </div>
                );
              })}
            </div>

            {/* Role cards */}
            <div className="grid gap-5 lg:grid-cols-3">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                const list = members.filter((m) => m.role === r.key);
                return (
                  <div
                    key={r.key}
                    className="flex flex-col rounded-3xl border bg-[#0d1019] p-6 transition hover:-translate-y-1"
                    style={{
                      borderColor: `${r.color}44`,
                      boxShadow: `0 20px 50px -28px ${r.color}`,
                      animation: `fadeSlide 0.45s ease-out ${i * 0.07}s both`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: r.soft, color: r.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-2xl font-black uppercase text-white leading-none">
                            {r.label}
                          </h3>
                          <span className="font-mono-code text-[11px] text-slate-500">
                            {list.length} acesso{list.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTab(r.key)}
                        className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
                      >
                        Gerir
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-300">{r.headline}</p>

                    <ul className="mt-4 space-y-1.5">
                      {r.duties.slice(0, 3).map((d) => (
                        <li key={d} className="flex items-start gap-2 text-[11px] text-slate-400">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                          {d}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {list.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                          style={{
                            borderColor: `${r.color}40`,
                            backgroundColor: r.soft,
                            color: '#e2e8f0',
                          }}
                        >
                          {m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}
                        </span>
                      ))}
                      {list.length === 0 && (
                        <span className="text-[11px] text-slate-500">Nenhum acesso concedido</span>
                      )}
                    </div>

                    <p className="mt-auto pt-4 text-[11px] italic leading-relaxed text-slate-500">
                      Limite: {r.limits}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Security rules */}
            <div className="rounded-3xl border border-red-500/30 bg-[#140c10] p-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-red-400" />
                <h3 className="font-display text-2xl font-black uppercase text-white">
                  Regras de segurança dos acessos
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Regras que este painel segue — e que precisam valer também nas rotas do site publicado.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  { ok: true, t: 'Entrada única e oculta', d: 'O painel abre só pela logomarca do rodapé (5 toques) e exige senha mestra. Nenhum link aponta para ele.' },
                  { ok: true, t: 'Hierarquia não divulgada', d: 'A tela pública de login não anuncia os cargos nem oferece "acesso rápido do proprietário".' },
                  { ok: true, t: 'Cargos superiores mais protegidos', d: 'Proprietário e Coordenador exigem autenticação antes de qualquer byte de conteúdo — nunca 200 para anônimo.' },
                  { ok: true, t: 'Trilha de auditoria', d: 'Toda concessão, elevação, suspensão e revogação fica registrada com data, hora e alvo.' },
                ].map((rule) => (
                  <div
                    key={rule.t}
                    className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-black/35 p-4"
                  >
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span className="block text-xs font-extrabold uppercase tracking-wide text-white">
                        {rule.t}
                      </span>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{rule.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ============ ROLE TABS ============ */}
        {ROLES.some((r) => r.key === tab) && (() => {
          const r = roleOf(tab as ArenaRole);
          const Icon = r.icon;
          const list = filtered.filter((m) => m.role === r.key);
          return (
            <>
              <div
                className="rounded-3xl border p-6"
                style={{ borderColor: `${r.color}44`, backgroundColor: r.soft }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/40"
                      style={{ color: r.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-3xl font-black uppercase text-white leading-none">
                        {r.label}
                      </h2>
                      <p className="mt-1.5 text-xs text-slate-200">{r.headline}</p>
                      <p className="mt-1 font-mono-code text-[11px]" style={{ color: r.color }}>
                        {r.scopeLabel}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFRole(r.key);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg transition hover:scale-[1.03] cursor-pointer"
                    style={{ backgroundColor: r.color }}
                  >
                    <Plus className="h-4 w-4" /> Conceder acesso de {r.label}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      O que este cargo faz
                    </span>
                    <ul className="mt-2.5 space-y-2">
                      {r.duties.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-[11px] text-slate-200">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Matriz de permissões
                    </span>
                    <div className="mt-2.5 space-y-1.5">
                      {r.permissions.map((p) => (
                        <div key={p.label} className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-slate-300">{p.label}</span>
                          <span
                            className="rounded px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase"
                            style={{
                              backgroundColor:
                                p.level === 'total'
                                  ? 'rgba(16,185,129,0.18)'
                                  : p.level === 'parcial'
                                  ? 'rgba(251,191,36,0.18)'
                                  : 'rgba(255,255,255,0.06)',
                              color:
                                p.level === 'total'
                                  ? '#34d399'
                                  : p.level === 'parcial'
                                  ? '#fbbf24'
                                  : '#64748b',
                            }}
                          >
                            {p.level === 'total' ? 'total' : p.level === 'parcial' ? 'parcial' : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] italic text-slate-500">
                      {r.limits}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member list for this role */}
              <div className="rounded-3xl border border-white/10 bg-[#0d1019] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-black uppercase text-white">
                    Quem tem este cargo ({list.length})
                  </h3>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar por nome, equipe ou WhatsApp"
                      className="rounded-xl border border-white/12 bg-black/45 py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {list.map((m, i) => (
                    <MemberRow
                      key={m.id}
                      m={m}
                      color={r.color}
                      index={i}
                      onStatus={changeStatus}
                      onRole={changeRole}
                      onRemove={removeMember}
                    />
                  ))}
                  {list.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-xs text-slate-500">
                      Nenhum acesso de {r.label} concedido até agora.
                    </p>
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {/* ============ REGISTRO ============ */}
        {tab === 'registro' && (
          <div className="rounded-3xl border border-white/10 bg-[#0d1019] p-6">
            <div className="flex items-center gap-2.5">
              <ScrollText className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-3xl font-black uppercase text-white">
                Registro de auditoria
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Toda ação do proprietário fica gravada — concessões, elevações, suspensões, revogações e tentativas de acesso negadas.
            </p>
            <div className="mt-5 space-y-2">
              {log.map((l, i) => {
                const tone =
                  l.tone === 'danger'
                    ? { c: '#ff3b47', b: 'border-red-500/30', bg: 'bg-red-500/[0.06]' }
                    : l.tone === 'warn'
                    ? { c: '#fbbf24', b: 'border-amber-500/30', bg: 'bg-amber-500/[0.05]' }
                    : l.tone === 'ok'
                    ? { c: '#34d399', b: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.05]' }
                    : { c: '#94a3b8', b: 'border-white/10', bg: 'bg-white/[0.02]' };
                return (
                  <div
                    key={l.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border ${tone.b} ${tone.bg} px-4 py-3`}
                    style={{ animation: `fadeSlide 0.35s ease-out ${i * 0.03}s both` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tone.c }} />
                      <div>
                        <span className="block text-xs font-extrabold text-white">{l.action}</span>
                        <span className="block text-[11px] text-slate-400">{l.target}</span>
                      </div>
                    </div>
                    <span className="font-mono-code text-[11px] text-slate-500">{l.at}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* New member form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={addMember}
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0e111c] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-black uppercase text-white">
                Conceder novo acesso
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nome completo
                </label>
                <input
                  required
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="Ex.: Marina Duarte"
                  className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    WhatsApp
                  </label>
                  <input
                    value={fWhats}
                    onChange={(e) => setFWhats(e.target.value)}
                    placeholder="(47) 90000-0000"
                    className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Cargo
                  </label>
                  <select
                    value={fRole}
                    onChange={(e) => setFRole(e.target.value as ArenaRole)}
                    className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {roleOf(fRole).scopeLabel}
                </label>
                <input
                  value={fScope}
                  onChange={(e) => setFScope(e.target.value)}
                  placeholder={roleOf(fRole).scopeHint}
                  className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:scale-[1.02] transition cursor-pointer"
              >
                Conceder acesso
              </button>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              O acesso nasce como <strong className="text-amber-300">pendente</strong> e só passa a valer depois de ativado por você.
            </p>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-emerald-400/40 bg-[#0b1410]/95 px-5 py-3 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ================= MEMBER ROW ================= */
interface MemberRowProps {
  m: Member;
  color: string;
  index: number;
  onStatus: (id: string, s: MemberStatus) => void;
  onRole: (id: string, dir: 'up' | 'down') => void;
  onRemove: (id: string) => void;
}

const MemberRow: React.FC<MemberRowProps> = ({ m, color, index, onStatus, onRole, onRemove }) => {
  const statusStyle =
    m.status === 'ativo'
      ? { c: '#34d399', bg: 'rgba(16,185,129,0.15)', label: 'Ativo' }
      : m.status === 'pendente'
      ? { c: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Pendente' }
      : { c: '#ff3b47', bg: 'rgba(229,9,20,0.16)', label: 'Suspenso' };

  return (
    <div
      className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/25 hover:bg-black/45"
      style={{ animation: `fadeSlide 0.35s ease-out ${index * 0.04}s both` }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {m.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-white">{m.name}</span>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.c }}
            >
              {statusStyle.label}
            </span>
          </div>
          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
            {m.scope} · {m.whatsapp} · desde {m.since}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {m.status === 'pendente' && (
          <button
            type="button"
            onClick={() => onStatus(m.id, 'ativo')}
            title="Aprovar acesso"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/12 px-2.5 py-1.5 text-[10px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <CircleCheck className="h-3 w-3" /> Aprovar
          </button>
        )}
        {m.status === 'ativo' && (
          <button
            type="button"
            onClick={() => onStatus(m.id, 'suspenso')}
            title="Suspender acesso"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/12 px-2.5 py-1.5 text-[10px] font-black uppercase text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
          >
            <Ban className="h-3 w-3" /> Suspender
          </button>
        )}
        {m.status === 'suspenso' && (
          <button
            type="button"
            onClick={() => onStatus(m.id, 'ativo')}
            title="Reativar acesso"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/12 px-2.5 py-1.5 text-[10px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <CircleCheck className="h-3 w-3" /> Reativar
          </button>
        )}

        <button
          type="button"
          onClick={() => onRole(m.id, 'up')}
          title="Elevar cargo"
          className="rounded-lg border border-white/12 bg-white/5 p-1.5 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 transition cursor-pointer"
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRole(m.id, 'down')}
          title="Rebaixar cargo"
          className="rounded-lg border border-white/12 bg-white/5 p-1.5 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition cursor-pointer"
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(m.id)}
          title="Revogar acesso"
          className="rounded-lg border border-white/12 bg-white/5 p-1.5 text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
