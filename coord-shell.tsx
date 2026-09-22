'use client';
import { useState, useTransition } from 'react';
import { Shield } from './shield';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Inscricao, Patrocinador } from '@/lib/supabase/types';

type Stats = {
  inscricoes_pendentes: number;
  total_times: number;
  total_jogos: number;
  receita_mensal: number;
};

interface Props {
  user: Profile;
  stats: Stats;
  inscricoes: any[];
  patrocinadores: Patrocinador[];
}

const TABS = [
  { id: 'visao',          label: '📊 Visão Geral' },
  { id: 'inscricoes',     label: '📝 Inscrições' },
  { id: 'moderadores',    label: '🛡️ Moderadores' },
  { id: 'sumulas',        label: '📄 Súmulas' },
  { id: 'patrocinadores', label: '🤝 Patrocinadores' },
  { id: 'config',         label: '⚙️ Config' },
];

export function CoordShell({ user, stats: initialStats, inscricoes: initialInsc, patrocinadores: initialPat }: Props) {
  const [tab, setTab] = useState('visao');
  const [stats] = useState(initialStats);
  const [inscricoes, setInscricoes] = useState(initialInsc);
  const [patrocinadores, setPatrocinadores] = useState(initialPat);
  const [, startTransition] = useTransition();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.href = '/';
  };

  const approveInscricao = async (id: string) => {
    startTransition(async () => {
      await supabase.from('inscricoes').update({
        status: 'aprovada',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      }).eq('id', id);
      setInscricoes(prev => prev.filter(i => i.id !== id));
    });
  };

  const addPatrocinador = async () => {
    const nome = prompt('Nome do patrocinador:');
    if (!nome) return;
    const valor = parseFloat(prompt('Valor mensal (R$):') || '0');
    const cota = prompt('Cota (Master/Ouro/Prata/Bronze/Apoio):') || 'Apoio';
    startTransition(async () => {
      const { data } = await supabase.from('patrocinadores').insert({
        nome, valor_mensal: valor, cota, logo_initials: nome.slice(0, 4).toUpperCase(),
        ativo: true, created_by: user.id,
      }).select().single();
      if (data) setPatrocinadores(prev => [...prev, data]);
    });
  };

  const deletePatrocinador = async (id: string) => {
    if (!confirm('Excluir patrocinador?')) return;
    startTransition(async () => {
      await supabase.from('patrocinadores').delete().eq('id', id);
      setPatrocinadores(prev => prev.filter(p => p.id !== id));
    });
  };

  return (
    <div>
      {/* Header do painel */}
      <div className="panel mb-6 flex justify-between items-center flex-wrap gap-4 bg-gradient-to-br from-[var(--surface-2)] to-[var(--bg-alt)] border-[var(--primary)]/20 relative overflow-hidden">
        <div className="relative z-10">
          <span className="eyebrow">🔐 Área restrita</span>
          <h1 className="font-serif text-2xl font-extrabold">Painel do Coordenador</h1>
          <p className="text-[var(--text-dim)] text-sm">Bem-vindo, {user.full_name}.</p>
        </div>
        <div className="flex gap-3 items-center relative z-10">
          <div className="flex items-center gap-3 pr-4 border-r border-white/10">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-[#0a1530] font-serif font-black">
              {user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <strong className="block text-sm">{user.full_name}</strong>
              <small className="text-xs text-[var(--text-mute)]">Coordenador Geral</small>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline">Sair</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-7 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${tab === t.id ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-dim)] border-transparent hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'visao' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icone: '⏳', label: 'Pendentes', value: stats.inscricoes_pendentes },
            { icone: '👥', label: 'Times', value: stats.total_times },
            { icone: '⚽', label: 'Jogos', value: stats.total_jogos },
            { icone: '💰', label: 'Receita/mês', value: 'R$ ' + stats.receita_mensal.toLocaleString('pt-BR') },
          ].map((s, i) => (
            <div key={i} className="panel flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-xl bg-[rgba(245,215,110,0.12)]">{s.icone}</div>
              <div>
                <strong className="block font-serif text-2xl font-black">{s.value}</strong>
                <span className="text-xs text-[var(--text-mute)] uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'inscricoes' && (
        <div className="panel">
          <h3 className="text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-4">Times aguardando aprovação · {inscricoes.length}</h3>
          {inscricoes.length === 0 && <p className="text-center text-[var(--text-mute)] py-8">Nenhuma inscrição pendente 🎉</p>}
          {inscricoes.map((i: any) => (
            <div key={i.id} className="flex justify-between items-center gap-3 py-3.5 border-b border-white/5 last:border-0">
              <div>
                <strong className="block text-sm font-bold">{i.time?.nome ?? '—'}</strong>
                <p className="text-xs text-[var(--text-mute)]">{i.campeonato?.nome} · {i.categoria}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approveInscricao(i.id)} className="px-3 py-1.5 text-xs rounded-full bg-[rgba(95,219,149,0.15)] border border-[rgba(95,219,149,0.4)] text-[#5fdb95] font-bold">✓ Aprovar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'patrocinadores' && (
        <div>
          <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
            <p className="text-[var(--text-dim)] text-sm">Cadastre, edite ou remova patrocinadores a qualquer momento.</p>
            <button onClick={addPatrocinador} className="btn-primary">+ Adicionar</button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {patrocinadores.map(p => (
              <div key={p.id} className="panel flex flex-col items-center text-center">
                <div className="w-full h-20 grid place-items-center rounded-[10px] border border-white/10 bg-gradient-to-br from-[rgba(245,215,110,0.08)] to-[rgba(120,160,255,0.08)] font-serif font-black text-lg" style={{ color: p.logo_cor || '#f5d76e' }}>{p.logo_initials}</div>
                <strong className="mt-3 text-sm">{p.nome}</strong>
                <small className="text-xs text-[var(--text-mute)]">Cota {p.cota} · R$ {Number(p.valor_mensal).toLocaleString('pt-BR')}/mês</small>
                <button onClick={() => deletePatrocinador(p.id)} className="mt-3 text-xs px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300">🗑️ Excluir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === 'moderadores' || tab === 'sumulas' || tab === 'config') && (
        <div className="panel text-center py-12 text-[var(--text-mute)]">
          Em construção — ver <code className="text-[var(--primary)]">app/(coord)/coordenador/{tab}/page.tsx</code>
        </div>
      )}
    </div>
  );
}
