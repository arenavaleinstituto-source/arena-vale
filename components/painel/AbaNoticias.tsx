'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIAS_MIDIA, mapearNoticiaMidia, type ModoVideo, type NoticiaMidia } from '@/lib/midia/noticias';
import { EditorNoticia } from './EditorNoticia';
import { VincularTelegram } from './VincularTelegram';

type Filtro = { aba: '' | 'arena' | 'mundo'; categoria: string; status: '' | 'rascunho' | 'publicado'; telegram: boolean };
const SEM_FILTRO: Filtro = { aba: '', categoria: '', status: '', telegram: false };
const CAMPO = 'rounded-full border border-av-linha bg-[#08080a] px-4 py-2 text-sm text-av-branco outline-none focus:border-av-vermelho';

/** Aba "Notícias" do painel (spec 2026-11-08, 4.3; Fase 3, seção 10). */
export function AbaNoticias() {
  const router = useRouter();
  const pathname = usePathname() ?? '/coordenador';
  const params = useSearchParams();
  const [lista, setLista] = useState<NoticiaMidia[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>(SEM_FILTRO);
  const [modo, setModo] = useState<{ modo: ModoVideo; dias: number }>({ modo: 'guardar_arquivo', dias: 30 });
  const [editando, setEditando] = useState<string | 'nova' | null>(() => params?.get('editar') ?? null);

  useEffect(() => {
    let vivo = true;
    const sb = createClient();
    (async () => {
      const [{ data }, rm] = await Promise.all([sb.from('noticias').select('*').order('created_at', { ascending: false }).limit(300), sb.rpc('modo_video_atual')]);
      if (!vivo) return;
      setLista(((data ?? []) as Record<string, unknown>[]).map(mapearNoticiaMidia));
      const m = (rm.data as { modo?: ModoVideo; dias?: number }[] | null)?.[0];
      if (m?.modo) setModo({ modo: m.modo, dias: m.dias ?? 30 });
      setCarregado(true);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  function abrir(id: string | 'nova' | null) {
    setEditando(id);
    router.replace(id && id !== 'nova' ? `${pathname}?aba=noticias&editar=${id}` : `${pathname}?aba=noticias`, { scroll: false });
  }

  const doTelegram = lista.filter((n) => n.origem === 'telegram' && n.status === 'rascunho').length;
  const visiveis = useMemo(
    () =>
      lista.filter(
        (n) =>
          (!filtro.aba || n.aba === filtro.aba) &&
          (!filtro.categoria || n.categoria === filtro.categoria) &&
          (!filtro.status || n.status === filtro.status) &&
          (!filtro.telegram || (n.origem === 'telegram' && n.status === 'rascunho')),
      ),
    [lista, filtro],
  );

  if (editando) {
    const noticia = editando === 'nova' ? null : (lista.find((n) => n.id === editando) ?? null);
    if (editando !== 'nova' && !noticia) {
      return <div className="panel text-av-cinza">{carregado ? 'Notícia não encontrada.' : 'Carregando…'}</div>;
    }
    return (
      <div className="panel">
        <EditorNoticia
          key={editando}
          noticia={noticia}
          modo={modo.modo}
          diasVideo={modo.dias}
          onFechar={() => abrir(null)}
          onSalvo={(salva) => {
            const n = mapearNoticiaMidia(salva as unknown as Record<string, unknown>);
            setLista((l) => (l.some((x) => x.id === n.id) ? l.map((x) => (x.id === n.id ? n : x)) : [n, ...l]));
            if (editando === 'nova') abrir(n.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <VincularTelegram />
      <div className="panel grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold uppercase">Notícias</h2>
          <button type="button" className="btn-forte" onClick={() => abrir('nova')}>
            + Nova notícia
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={filtro.telegram}
            onClick={() => setFiltro((f) => ({ ...SEM_FILTRO, telegram: !f.telegram }))}
            className={`rounded-full border px-4 py-2 font-rotulo text-sm font-bold uppercase tracking-wider ${filtro.telegram ? 'border-av-amarelo bg-av-amarelo text-black' : 'border-av-amarelo/50 text-av-amarelo'}`}
          >
            Rascunhos do Telegram ({doTelegram})
          </button>
          <select aria-label="Filtrar por aba" className={CAMPO} value={filtro.aba} onChange={(e) => setFiltro((f) => ({ ...f, telegram: false, aba: e.target.value as Filtro['aba'] }))}>
            <option value="">Todas as abas</option>
            <option value="arena">Notícias do Vale</option>
            <option value="mundo">Esporte Mundial</option>
          </select>
          <select aria-label="Filtrar por categoria" className={CAMPO} value={filtro.categoria} onChange={(e) => setFiltro((f) => ({ ...f, telegram: false, categoria: e.target.value }))}>
            <option value="">Todas as categorias</option>
            {CATEGORIAS_MIDIA.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
          <select aria-label="Filtrar por situação" className={CAMPO} value={filtro.status} onChange={(e) => setFiltro((f) => ({ ...f, telegram: false, status: e.target.value as Filtro['status'] }))}>
            <option value="">Publicadas e rascunhos</option>
            <option value="publicado">Publicadas</option>
            <option value="rascunho">Rascunhos</option>
          </select>
        </div>

        {!carregado ? (
          <p className="text-av-cinza">Carregando…</p>
        ) : visiveis.length === 0 ? (
          <p className="text-av-cinza">Nenhuma notícia com esse filtro.</p>
        ) : (
          <ul aria-label="Notícias" className="grid gap-2">
            {visiveis.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => abrir(n.id)} className="flex w-full items-center gap-4 rounded-2xl border border-av-linha bg-av-grafite-2 p-3 text-left hover:border-av-vermelho">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.imagem_url || '/og-banner.jpg'} alt="" className="h-16 w-11 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate">{n.titulo || 'Sem título'}</strong>
                    <small className="text-xs text-av-cinza">
                      {n.aba === 'mundo' ? 'Esporte Mundial' : 'Notícias do Vale'} · {CATEGORIAS_MIDIA.find((c) => c.valor === n.categoria)?.rotulo}
                      {n.origem === 'telegram' ? ' · Telegram' : ''}
                    </small>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 font-rotulo text-xs font-bold uppercase tracking-wider ${n.status === 'publicado' ? 'bg-av-vermelho text-white' : 'border border-av-amarelo/60 text-av-amarelo'}`}
                  >
                    {n.status === 'publicado' ? 'No ar' : 'Rascunho'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
