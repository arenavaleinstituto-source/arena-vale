'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Patrocinador } from '@/lib/supabase/types';
import { CoordSumulas } from './coord-sumulas';
import { CoordModeradores } from './coord-moderadores';
import { CoordCapitaes } from './coord-capitaes';
import { CoordConfig } from './coord-config';
import { CoordJogos } from './coord-jogos';
import { CoordCampeonatos } from './coord-campeonatos';
import { AbaAoVivo } from './painel/AbaAoVivo';
import { NoticiasLegado } from './painel/NoticiasLegado';
import { ABAS_COORD, abaValida, type IdAba } from './painel/abas';
import GestaoAtletasClient from '@/app/(coord)/coordenador/atletasdestaques/gestao-atletas-client';

export type StatsPainel = {
  campeonatos: number;
  equipes: number;
  jogos: number;
  videos: number;
  inscricoes_pendentes: number;
};

interface Props {
  user: Profile;
  stats: StatsPainel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formato legado vindo de getInscricoes (com joins)
  inscricoes: any[];
  patrocinadores: Patrocinador[];
  aoVivoDetectado: boolean;
}

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-sm text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'mb-1 block text-[11px] font-bold uppercase tracking-widest text-av-cinza';

/** Painel da coordenação no visual da mídia esportiva (spec Fase 3, seção 12). */
export function CoordShell({ user, stats, inscricoes: initialInsc, patrocinadores: initialPat, aoVivoDetectado }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? '/coordenador';
  const params = useSearchParams();
  const [tab, setTab] = useState<IdAba>(() => abaValida(params?.get('aba') ?? null));
  const [inscricoes, setInscricoes] = useState(initialInsc);
  const [patrocinadores, setPatrocinadores] = useState(initialPat);
  const [, startTransition] = useTransition();
  const supabase = createClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPat, setNewPat] = useState({ nome: '', valor_mensal: '', cota: 'Bronze', logo_initials: '', logo_cor: '#e50914', categoria: '', descricao: '', site_url: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function abrir(id: IdAba) {
    setTab(id);
    router.replace(`${pathname}?aba=${id}`, { scroll: false });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.href = '/';
  };

  const approveInscricao = async (id: string) => {
    startTransition(async () => {
      await supabase.from('inscricoes').update({ status: 'aprovada', approved_at: new Date().toISOString(), approved_by: user.id }).eq('id', id);
      setInscricoes((prev) => prev.filter((i) => i.id !== id));
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Selecione uma imagem.');
    if (file.size > 5 * 1024 * 1024) return alert('Imagem de até 5 MB.');
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;
    setUploading(true);
    try {
      const filePath = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${logoFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('patrocinadores').upload(filePath, logoFile, { cacheControl: '3600', upsert: false });
      if (error) {
        alert('Erro: ' + error.message);
        return null;
      }
      return supabase.storage.from('patrocinadores').getPublicUrl(filePath).data.publicUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddPatrocinador = async () => {
    if (!newPat.nome.trim()) return alert('Informe o nome.');
    startTransition(async () => {
      let logo_url = null;
      if (logoFile) {
        logo_url = await uploadLogo();
        if (!logo_url) return;
      }
      const { data, error } = await supabase
        .from('patrocinadores')
        .insert({
          nome: newPat.nome.trim(),
          valor_mensal: parseFloat(newPat.valor_mensal) || 0,
          cota: newPat.cota,
          logo_initials: newPat.logo_initials || newPat.nome.slice(0, 4).toUpperCase(),
          logo_url,
          logo_cor: newPat.logo_cor,
          categoria: newPat.categoria || null,
          descricao: newPat.descricao || null,
          site_url: newPat.site_url || null,
          ativo: true,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) return alert('Erro: ' + error.message);
      if (data) {
        setPatrocinadores((prev) => [...prev, data]);
        setNewPat({ nome: '', valor_mensal: '', cota: 'Bronze', logo_initials: '', logo_cor: '#e50914', categoria: '', descricao: '', site_url: '' });
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
      setPatrocinadores((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const iniciais = user.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="grid gap-6">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-av-linha bg-av-grafite p-5">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ARENA VALE" className="h-12 w-auto" />
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase leading-none">Painel da coordenação</h1>
            <p className="mt-1 text-sm text-av-cinza">Bem-vindo, {user.full_name}.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="btn-leve">
            Ver o site
          </Link>
          <div className="flex items-center gap-3 rounded-full border border-av-linha py-1.5 pl-1.5 pr-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-av-vermelho font-display text-sm font-black">{iniciais}</span>
            <span className="grid leading-tight">
              <strong className="text-sm">{user.full_name}</strong>
              <small className="text-xs text-av-cinza">Coordenador</small>
            </span>
          </div>
          <button type="button" onClick={handleLogout} className="btn-leve">
            Sair
          </button>
        </div>
      </header>

      {/* Abas */}
      <div role="tablist" aria-label="Seções do painel" className="flex flex-wrap justify-center gap-2.5 rounded-[22px] border border-av-linha bg-av-grafite p-4">
        {ABAS_COORD.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={tab === a.id}
            onClick={() => abrir(a.id)}
            className={`w-[calc(50%-5px)] truncate rounded-full border px-3 py-2.5 sm:w-[158px] text-center font-rotulo text-sm font-bold uppercase tracking-wider transition ${
              tab === a.id ? 'border-av-vermelho bg-av-vermelho text-white shadow-[0_8px_20px_rgba(229,9,20,.35)]' : 'border-av-linha bg-av-preto text-av-cinza hover:border-av-vermelho hover:text-white'
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'visao' && (
          <div className="panel grid gap-4">
            <h2 className="titulo-secao !text-left !text-2xl">Números da Arena</h2>
            <p className="text-sm text-av-cinza">Para conhecimento da equipe — não aparece no site.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { rotulo: 'Campeonatos', valor: stats.campeonatos },
                { rotulo: 'Equipes', valor: stats.equipes },
                { rotulo: 'Jogos', valor: stats.jogos },
                { rotulo: 'Vídeos no canal', valor: stats.videos },
              ].map((s) => (
                <div key={s.rotulo} className="border-l-[3px] border-av-vermelho py-1.5 pl-4">
                  <strong className="block font-display text-5xl font-extrabold leading-none">{s.valor}</strong>
                  <span className="font-rotulo text-sm font-bold uppercase tracking-widest text-av-cinza">{s.rotulo}</span>
                </div>
              ))}
            </div>
            {stats.inscricoes_pendentes > 0 && (
              <button type="button" onClick={() => abrir('inscricoes')} className="btn-forte w-fit">
                {stats.inscricoes_pendentes} inscrição(ões) aguardando aprovação
              </button>
            )}
          </div>
        )}

        {tab === 'aovivo' && <AbaAoVivo aoVivoDetectado={aoVivoDetectado} />}
        {tab === 'noticias' && (
          <div className="panel">
            <NoticiasLegado />
          </div>
        )}
        {tab === 'videos' && (
          <div className="panel grid gap-2">
            <h2 className="titulo-secao !text-left !text-2xl">Vídeos do Instagram</h2>
            <p className="text-av-cinza">Os vídeos do YouTube entram sozinhos. O cadastro dos vídeos do Instagram chega junto com o novo editor de notícias.</p>
          </div>
        )}
        {tab === 'jogos' && <CoordJogos />}
        {tab === 'campeonatos' && <CoordCampeonatos />}
        {tab === 'inscricoes' && (
          <div className="panel">
            <h2 className="mb-4 font-rotulo text-sm font-bold uppercase tracking-widest text-av-cinza">Times aguardando aprovação · {inscricoes.length}</h2>
            {inscricoes.length === 0 && <p className="py-8 text-center text-av-cinza">Nenhuma inscrição pendente.</p>}
            {inscricoes.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-3.5 last:border-0">
                <div>
                  <strong className="block text-sm font-bold">{i.time?.nome ?? '—'}</strong>
                  <p className="text-xs text-av-cinza">
                    {i.campeonato?.nome} · {i.categoria}
                  </p>
                </div>
                <button type="button" onClick={() => approveInscricao(i.id)} className="btn-forte !px-4 !py-1.5 !text-xs">
                  ✓ Aprovar
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === 'sumulas' && <CoordSumulas userId={user.id} />}
        {tab === 'moderadores' && <CoordModeradores />}
        {tab === 'capitaes' && <CoordCapitaes />}
        {tab === 'patrocinadores' && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-av-cinza">Cadastre, edite ou remova patrocinadores.</p>
              <button type="button" onClick={() => setShowAddModal(true)} className="btn-forte">
                + Adicionar
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {patrocinadores.map((p) => (
                <div key={p.id} className="panel flex flex-col items-center text-center">
                  <div className="grid h-20 w-full place-items-center overflow-hidden rounded-xl border border-av-linha bg-white/[0.03]">
                    {p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo_url} alt={p.nome} className="max-h-full max-w-full object-contain p-1" />
                    ) : (
                      <span className="font-display text-lg font-black" style={{ color: p.logo_cor || '#e50914' }}>
                        {p.logo_initials}
                      </span>
                    )}
                  </div>
                  <strong className="mt-3 text-sm">{p.nome}</strong>
                  <small className="text-xs text-av-cinza">
                    Cota {p.cota} · R$ {Number(p.valor_mensal).toLocaleString('pt-BR')}/mês
                  </small>
                  <button type="button" onClick={() => deletePatrocinador(p.id)} className="mt-3 rounded-full border border-av-vermelho/40 px-3 py-1 text-xs text-[#ff8a8f]">
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'destaques' && <GestaoAtletasClient />}
        {tab === 'config' && <CoordConfig />}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Novo patrocinador"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-av-linha bg-av-grafite p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold uppercase">Novo patrocinador</h2>
              <button type="button" onClick={() => setShowAddModal(false)} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full border border-av-linha">
                ✕
              </button>
            </div>
            <div className="mb-5">
              <span className={ROTULO}>Logo do patrocinador</span>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <button
                type="button"
                className="grid h-32 w-full place-items-center rounded-2xl border-2 border-dashed border-av-linha hover:border-av-vermelho"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Prévia do logo" className="max-h-28 max-w-full object-contain" />
                ) : (
                  <span className="text-sm text-av-cinza">Clique para enviar (PNG, JPG ou SVG, até 5 MB)</span>
                )}
              </button>
            </div>
            {!logoFile && (
              <div className="mb-3 grid grid-cols-2 gap-3">
                <label>
                  <span className={ROTULO}>Iniciais</span>
                  <input type="text" maxLength={4} value={newPat.logo_initials} onChange={(e) => setNewPat({ ...newPat, logo_initials: e.target.value.toUpperCase() })} className={CAMPO} />
                </label>
                <label>
                  <span className={ROTULO}>Cor</span>
                  <input type="color" value={newPat.logo_cor} onChange={(e) => setNewPat({ ...newPat, logo_cor: e.target.value })} className="h-11 w-full cursor-pointer rounded-2xl border border-av-linha bg-[#08080a]" />
                </label>
              </div>
            )}
            <label className="mb-3 block">
              <span className={ROTULO}>Nome *</span>
              <input type="text" value={newPat.nome} onChange={(e) => setNewPat({ ...newPat, nome: e.target.value })} className={CAMPO} />
            </label>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label>
                <span className={ROTULO}>Cota *</span>
                <select value={newPat.cota} onChange={(e) => setNewPat({ ...newPat, cota: e.target.value })} className={CAMPO}>
                  {['Master', 'Ouro', 'Prata', 'Bronze', 'Apoio'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={ROTULO}>Valor mensal (R$)</span>
                <input type="number" step="0.01" value={newPat.valor_mensal} onChange={(e) => setNewPat({ ...newPat, valor_mensal: e.target.value })} className={CAMPO} />
              </label>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label>
                <span className={ROTULO}>Categoria</span>
                <input type="text" value={newPat.categoria} onChange={(e) => setNewPat({ ...newPat, categoria: e.target.value })} className={CAMPO} />
              </label>
              <label>
                <span className={ROTULO}>Site</span>
                <input type="url" value={newPat.site_url} onChange={(e) => setNewPat({ ...newPat, site_url: e.target.value })} placeholder="https://..." className={CAMPO} />
              </label>
            </div>
            <label className="mb-5 block">
              <span className={ROTULO}>Descrição</span>
              <textarea value={newPat.descricao} onChange={(e) => setNewPat({ ...newPat, descricao: e.target.value })} rows={2} className={`${CAMPO} resize-none`} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-leve">
                Cancelar
              </button>
              <button type="button" onClick={handleAddPatrocinador} disabled={uploading} className="btn-forte disabled:opacity-50">
                {uploading ? 'Enviando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
