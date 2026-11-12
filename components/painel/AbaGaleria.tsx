'use client';

import { useCallback, useEffect, useState, type ChangeEvent, type DragEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ItemAgenda } from '@/lib/midia/agenda';
import { diaBrasilia, rotuloJogo } from '@/lib/midia/jogo-rotulo';
import {
  dataAlbum,
  deAlbum,
  deFoto,
  SELECT_ALBUM,
  SELECT_FOTO,
  textoFotos,
  type AlbumGaleria,
  type FotoGaleria,
  type LinhaAlbum,
  type LinhaFoto,
} from '@/lib/midia/galeria';
import { reduzirNoNavegador } from '@/lib/imagem/reduzir-no-navegador';

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';

/** Caminho no bucket a partir da URL pública ("…/object/public/galeria/<caminho>"). */
function caminhoNoBucket(url: string): string | null {
  const marca = '/storage/v1/object/public/galeria/';
  const i = url.indexOf(marca);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marca.length));
}

type Envio = { feitas: number; total: number; falhas: File[] };

/** Aba "Galeria" do painel (spec Fase 4A, seção 4.4). */
export function AbaGaleria() {
  const supabase = createClient();
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [aberto, setAberto] = useState<AlbumGaleria | null>(null);
  const [fotos, setFotos] = useState<FotoGaleria[]>([]);
  const [criando, setCriando] = useState(false);
  const [jogos, setJogos] = useState<ItemAgenda[]>([]);
  const [escolha, setEscolha] = useState<string>('');
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataEvento, setDataEvento] = useState(() => diaBrasilia(Date.now()));
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [mensagem, setMensagem] = useState('');

  const carregarAlbuns = useCallback(async () => {
    const { data, error } = await supabase
      .from('galeria_albuns')
      .select(SELECT_ALBUM)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return setMensagem('Não consegui carregar os álbuns. Se a galeria é nova, falta rodar o SQL da galeria.');
    const lista = ((data ?? []) as unknown as LinhaAlbum[]).map(deAlbum);
    setAlbuns(lista);
    // Mantém o álbum aberto em dia (ex.: capa posta pelo servidor no 1º envio).
    setAberto((atual) => (atual ? (lista.find((a) => a.id === atual.id) ?? atual) : atual));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cliente estável
  }, []);

  const carregarFotos = useCallback(async (albumId: string) => {
    const { data } = await supabase.from('galeria_fotos').select(SELECT_FOTO).eq('album_id', albumId).order('created_at');
    setFotos(((data ?? []) as unknown as LinhaFoto[]).map(deFoto));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cliente estável
  }, []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (vivo) await carregarAlbuns();
    })();
    return () => {
      vivo = false;
    };
  }, [carregarAlbuns]);

  async function abrirNovo() {
    setCriando(true);
    setMensagem('');
    const r = await fetch('/api/galeria/jogos').catch(() => null);
    const corpo = r && r.ok ? ((await r.json().catch(() => ({}))) as { jogos?: ItemAgenda[] }) : {};
    setJogos(corpo.jogos ?? []);
  }

  async function abrirAlbum(a: AlbumGaleria) {
    setAberto(a);
    setEnvio(null);
    setMensagem('');
    await carregarFotos(a.id);
  }

  async function criarAlbum() {
    setMensagem('');
    const { data: u } = await supabase.auth.getUser();
    const criadoPor = u?.user?.id ?? null;
    if (escolha === 'evento' || !escolha) {
      if (escolha !== 'evento') return setMensagem('Escolha um jogo ou "Evento"');
      const nome = nomeEvento.trim();
      if (!nome) return setMensagem('Escreva o nome do evento');
      if (nome.length < 3) return setMensagem('O nome precisa ter pelo menos 3 letras');
      const { data, error } = await supabase
        .from('galeria_albuns')
        .insert({ titulo: nome.slice(0, 80), data: dataEvento, criado_por: criadoPor })
        .select(SELECT_ALBUM)
        .single();
      if (error || !data) return setMensagem('Não consegui criar o álbum.');
      return terminarCriacao(deAlbum(data as unknown as LinhaAlbum));
    }
    const jogo = jogos.find((j) => `${j.origem}-${j.id}` === escolha);
    if (!jogo) return setMensagem('Escolha um jogo ou "Evento"');
    const existente = await supabase
      .from('galeria_albuns')
      .select(SELECT_ALBUM)
      .eq('origem', jogo.origem)
      .eq('jogo_ref', jogo.id)
      .maybeSingle();
    if (existente.data) return terminarCriacao(deAlbum(existente.data as unknown as LinhaAlbum));
    const { data, error } = await supabase
      .from('galeria_albuns')
      .insert({
        titulo: `${jogo.casa} x ${jogo.fora}`.slice(0, 80),
        data: diaBrasilia(Date.parse(jogo.dataHora)),
        origem: jogo.origem,
        jogo_ref: jogo.id,
        criado_por: criadoPor,
      })
      .select(SELECT_ALBUM)
      .single();
    if (error || !data) return setMensagem('Não consegui criar o álbum.');
    return terminarCriacao(deAlbum(data as unknown as LinhaAlbum));
  }

  async function terminarCriacao(a: AlbumGaleria) {
    setCriando(false);
    setEscolha('');
    setNomeEvento('');
    await carregarAlbuns();
    await abrirAlbum(a);
  }

  async function alternarVisivel(a: AlbumGaleria) {
    await supabase.from('galeria_albuns').update({ ativo: !a.ativo }).eq('id', a.id);
    await carregarAlbuns();
  }

  async function enviar(arquivos: File[]) {
    if (!aberto || arquivos.length === 0) return;
    const falhas: File[] = [];
    setEnvio({ feitas: 0, total: arquivos.length, falhas: [] });
    for (let i = 0; i < arquivos.length; i += 1) {
      const arq = arquivos[i];
      try {
        const fd = new FormData();
        fd.set('album_id', aberto.id);
        fd.set('arquivo', await reduzirNoNavegador(arq), arq.name.replace(/\.[^.]+$/, '') + '.jpg');
        const r = await fetch('/api/galeria/foto', { method: 'POST', body: fd });
        if (!r.ok) falhas.push(arq);
      } catch {
        falhas.push(arq);
      }
      setEnvio({ feitas: i + 1, total: arquivos.length, falhas: [...falhas] });
    }
    await carregarFotos(aberto.id);
    await carregarAlbuns();
  }

  function escolherArquivos(e: ChangeEvent<HTMLInputElement>) {
    const lista = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    void enviar(lista);
  }

  function soltar(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    void enviar(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')));
  }

  async function usarComoCapa(f: FotoGaleria) {
    if (!aberto) return;
    await supabase.from('galeria_albuns').update({ capa_url: f.url }).eq('id', aberto.id);
    setAberto({ ...aberto, capaUrl: f.url });
    setMensagem('Capa atualizada.');
  }

  async function apagar(f: FotoGaleria) {
    if (!aberto || !window.confirm('Apagar esta foto?')) return;
    const { error } = await supabase.from('galeria_fotos').delete().eq('id', f.id);
    if (error) return setMensagem('Não consegui apagar a foto.');
    const caminhos = [caminhoNoBucket(f.url), caminhoNoBucket(f.miniaturaUrl)].filter((c): c is string => !!c);
    if (caminhos.length) await supabase.storage.from('galeria').remove(caminhos);
    // A capa pode ter sido posta pelo servidor (1ª foto) sem a tela saber: troca no banco
    // só se a capa ainda for esta foto, pela próxima foto que sobrou (ou nenhuma).
    const proxima = fotos.find((x) => x.id !== f.id)?.url ?? null;
    await supabase.from('galeria_albuns').update({ capa_url: proxima }).eq('id', aberto.id).eq('capa_url', f.url);
    if (aberto.capaUrl === f.url) setAberto({ ...aberto, capaUrl: proxima });
    await carregarFotos(aberto.id);
    await carregarAlbuns();
  }

  if (aberto) {
    const falhas = envio?.falhas ?? [];
    return (
      <div className="panel grid gap-5">
        <button type="button" className="btn-leve w-fit" onClick={() => setAberto(null)}>
          ← Álbuns
        </button>
        <div>
          <h3 className="font-display text-2xl font-extrabold uppercase">{aberto.titulo}</h3>
          <p className="text-sm text-av-cinza">
            {dataAlbum(aberto.data)} · {textoFotos(fotos.length)} {aberto.ativo ? '' : '· escondido'}
          </p>
        </div>
        <label
          className="grid cursor-pointer place-items-center gap-2 rounded-2xl border border-dashed border-av-linha p-6 text-center text-av-cinza"
          onDragOver={(e) => e.preventDefault()}
          onDrop={soltar}
        >
          <span className="btn-forte">Adicionar fotos</span>
          <span className="text-sm">Escolha várias de uma vez ou arraste para cá.</span>
          <input type="file" accept="image/*" multiple className="sr-only" aria-label="Adicionar fotos" onChange={escolherArquivos} />
        </label>
        {envio && (
          <div className="grid gap-2" role="status">
            <span>
              {envio.feitas} de {envio.total}
            </span>
            {envio.feitas === envio.total && falhas.length > 0 && (
              <>
                <span className="text-av-vermelho">
                  {falhas.length === 1 ? '1 foto não foi enviada' : `${falhas.length} fotos não foram enviadas`}
                </span>
                <button type="button" className="btn-leve w-fit" onClick={() => void enviar(falhas)}>
                  Tentar de novo
                </button>
              </>
            )}
          </div>
        )}
        {mensagem && <p className="text-sm text-av-cinza">{mensagem}</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Fotos do álbum">
          {fotos.map((f, i) => (
            <li key={f.id} aria-label={`Foto ${i + 1}`} className="grid gap-2 rounded-2xl border border-av-linha p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.miniaturaUrl} alt="" className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
              {aberto.capaUrl === f.url ? (
                <span className="text-xs text-av-cinza">Capa do álbum</span>
              ) : (
                <button type="button" className="btn-leve" onClick={() => void usarComoCapa(f)}>
                  Usar como capa
                </button>
              )}
              <button type="button" className="btn-leve" onClick={() => void apagar(f)}>
                Apagar
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="panel grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-2xl font-extrabold uppercase">Galeria</h3>
        {!criando && (
          <button type="button" className="btn-forte" onClick={() => void abrirNovo()}>
            + Novo álbum
          </button>
        )}
      </div>

      {criando && (
        <fieldset className="grid gap-3 rounded-2xl border border-av-linha p-4">
          <legend className="px-1 text-sm text-av-cinza">De qual jogo são as fotos?</legend>
          {jogos.map((j) => (
            <label key={`${j.origem}-${j.id}`} className="flex items-center gap-2">
              <input type="radio" name="jogo" value={`${j.origem}-${j.id}`} checked={escolha === `${j.origem}-${j.id}`} onChange={(e) => setEscolha(e.target.value)} />
              {rotuloJogo(j)}
            </label>
          ))}
          <label className="flex items-center gap-2">
            <input type="radio" name="jogo" value="evento" checked={escolha === 'evento'} onChange={() => setEscolha('evento')} />
            Evento
          </label>
          {escolha === 'evento' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={ROTULO}>
                Nome do evento
                <input className={CAMPO} value={nomeEvento} maxLength={80} onChange={(e) => setNomeEvento(e.target.value)} />
              </label>
              <label className={ROTULO}>
                Data
                <input className={CAMPO} type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
              </label>
            </div>
          )}
          {mensagem && <p className="text-sm text-av-vermelho">{mensagem}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-forte" onClick={() => void criarAlbum()}>
              Criar álbum
            </button>
            <button type="button" className="btn-leve" onClick={() => setCriando(false)}>
              Cancelar
            </button>
          </div>
        </fieldset>
      )}

      {!criando && mensagem && <p className="text-sm text-av-cinza">{mensagem}</p>}
      {albuns.length === 0 && !criando && <p className="text-av-cinza">Nenhum álbum ainda.</p>}
      <ul className="grid gap-3" aria-label="Álbuns">
        {albuns.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-av-linha p-3">
            {a.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.capaUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-xl bg-av-grafite text-xl">📷</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.titulo}</p>
              <p className="text-sm text-av-cinza">
                {dataAlbum(a.data)} · {textoFotos(a.totalFotos)} {a.ativo ? '' : '· escondido'}
              </p>
            </div>
            <button type="button" className="btn-leve" onClick={() => void alternarVisivel(a)}>
              {a.ativo ? 'Esconder' : 'Mostrar'}
            </button>
            <button type="button" className="btn-forte" onClick={() => void abrirAlbum(a)}>
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
