'use client';
import { useState, useTransition, useRef } from 'react';
import { Shield } from './shield';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Inscricao, Patrocinador } from '@/lib/supabase/types';
import { CoordSumulas } from './coord-sumulas';
import { CoordModeradores } from './coord-moderadores';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPat, setNewPat] = useState({
    nome: '', valor_mensal: '', cota: 'Bronze', logo_initials: '',
    logo_cor: '#c9a338', categoria: '', descricao: '', site_url: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.href = '/';
  };

  const approveInscricao = async (id: string) => {
    startTransition(async () => {
      await supabase.from('inscricoes').update({
        status: 'aprovada', approved_at: new Date().toISOString(), approved_by: user.id,
      }).eq('id', id);
      setInscricoes(prev => prev.filter(i => i.id !== id));
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Selecione uma imagem.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB.'); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;
    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('patrocinadores').upload(filePath, logoFile, { cacheControl: '3600', upsert: false });
      if (uploadError) { alert('Erro: ' + uploadError.message); return null; }
      const { data } = supabase.storage.from('patrocinadores').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) { return null; }
    finally { setUploading(false); }
  };
  const handleAddPatrocinador = async () => {
  if (!newPat.nome.trim()) { alert('Informe o nome.'); return; }
  startTransition(async () => {
    let logo_url = null;
    if (logoFile) {
      logo_url = await uploadLogo();
      if (!logo_url) return;
    }
    const initials = newPat.logo_initials || newPat.nome.slice(0, 4).toUpperCase();
    const { data, error } = await supabase.from('patrocinadores').insert({
      nome: newPat.nome.trim(),
      valor_mensal: parseFloat(newPat.valor_mensal) || 0,
      cota: newPat.cota,
      logo_initials: initials,
      logo_url,
      logo_cor: newPat.logo_cor,
      categoria: newPat.categoria || null,
      descricao: newPat.descricao || null,
      site_url: newPat.site_url || null,
      ativo: true,
      created_by: user.id,
    }).select().single();
    if (error) { alert('Erro: ' + error.message); return; }
    if (data) {
      setPatrocinadores(prev => [...prev, data]);
      setNewPat({ nome: '', valor_mensal: '', cota: 'Bronze', logo_initials: '', logo_cor: '#c9a338', categoria: '', descricao: '', site_url: '' });
      setLogoFile(null);
      setLogoPreview(null);
      setShowAddModal(false);
    }
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
    {/* Header */}
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

    {/* Visão */}
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
            <button onClick={() => approveInscricao(i.id)} className="px-3 py-1.5 text-xs rounded-full bg-[rgba(95,219,149,0.15)] border border-[rgba(95,219,149,0.4)] text-[#5fdb95] font-bold">✓ Aprovar</button>
          </div>
        ))}
      </div>
    )}

    {tab === 'patrocinadores' && (
      <div>
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <p className="text-[var(--text-dim)] text-sm">Cadastre, edite ou remova patrocinadores.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Adicionar</button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {patrocinadores.map(p => (
            <div key={p.id} className="panel flex flex-col items-center text-center">
              <div className="w-full h-20 grid place-items-center rounded-[10px] border border-white/10 bg-gradient-to-br from-[rgba(245,215,110,0.08)] to-[rgba(120,160,255,0.08)] overflow-hidden" style={{ borderColor: p.logo_cor || '#f5d76e' }}>
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.nome} className="max-h-full max-w-full object-contain p-1" />
                ) : (
                  <span className="font-serif font-black text-lg" style={{ color: p.logo_cor || '#f5d76e' }}>{p.logo_initials}</span>
                )}
              </div>
              <strong className="mt-3 text-sm">{p.nome}</strong>
              <small className="text-xs text-[var(--text-mute)]">Cota {p.cota} · R$ {Number(p.valor_mensal).toLocaleString('pt-BR')}/mês</small>
              <button onClick={() => deletePatrocinador(p.id)} className="mt-3 text-xs px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300">🗑️ Excluir</button>
            </div>
          ))}
        </div>
    )}
{tab === 'moderadores' && (
  <CoordModeradores />
)}

{tab === 'sumulas' && (
  <CoordSumulas userId={user.id} />
)}
    {/* MODAL Adicionar */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={() => setShowAddModal(false)}>
        <div className="bg-gradient-to-br from-[var(--surface-2)] to-[var(--bg)] border border-[var(--primary)]/30 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-serif text-xl font-extrabold">Novo Patrocinador</h2>
            <button onClick={() => setShowAddModal(false)} className="w-8 h-8 grid place-items-center rounded-full border border-white/10 text-[var(--text-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)]">✕</button>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-2">Logo do Patrocinador</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--primary)]/30 grid place-items-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition" onClick={() => fileInputRef.current?.click()}>
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="max-h-28 max-w-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-sm text-[var(--text-dim)]">Clique para fazer upload</p>
                  <p className="text-xs text-[var(--text-mute)] mt-1">PNG, JPG ou SVG (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {!logoFile && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Iniciais</label>
                <input type="text" maxLength={4} value={newPat.logo_initials} onChange={e => setNewPat({ ...newPat, logo_initials: e.target.value.toUpperCase() })} placeholder="Ex: AC" className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Cor</label>
                <input type="color" value={newPat.logo_cor} onChange={e => setNewPat({ ...newPat, logo_cor: e.target.value })} className="w-full h-10 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 cursor-pointer" />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Nome *</label>
            <input type="text" value={newPat.nome} onChange={e => setNewPat({ ...newPat, nome: e.target.value })} placeholder="Ex: ACADESF" className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Cota *</label>
              <select value={newPat.cota} onChange={e => setNewPat({ ...newPat, cota: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm">
                <option value="Master">Master</option>
                <option value="Ouro">Ouro</option>
                <option value="Prata">Prata</option>
                <option value="Bronze">Bronze</option>
                <option value="Apoio">Apoio</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Valor Mensal (R$)</label>
              <input type="number" step="0.01" value={newPat.valor_mensal} onChange={e => setNewPat({ ...newPat, valor_mensal: e.target.value })} placeholder="500.00" className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Categoria</label>
              <input type="text" value={newPat.categoria} onChange={e => setNewPat({ ...newPat, categoria: e.target.value })} placeholder="Ex: Master" className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm" />
            </div>
            <div>
              <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Site</label>
              <input type="url" value={newPat.site_url} onChange={e => setNewPat({ ...newPat, site_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] tracking-widest text-[var(--text-mute)] uppercase font-bold mb-1">Descrição</label>
            <textarea value={newPat.descricao} onChange={e => setNewPat({ ...newPat, descricao: e.target.value })} placeholder="Descrição opcional" rows={2} className="w-full px-3 py-2.5 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10 focus:border-[var(--primary)] outline-none text-sm resize-none" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-[10px] border border-white/10 text-sm font-semibold">Cancelar</button>
            <button onClick={handleAddPatrocinador} disabled={uploading} className="btn-primary disabled:opacity-50">
              {uploading ? '⏳ Enviando...' : '✓ Salvar'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
