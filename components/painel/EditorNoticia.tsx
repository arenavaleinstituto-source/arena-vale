'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Cartaz } from '@/components/midia/Cartaz';
import { CATEGORIAS_MIDIA, faltasParaPublicar, type ModoVideo, type NoticiaMidia } from '@/lib/midia/noticias';
import { idYoutube, servicoDoLink } from '@/lib/midia/links';
import { extrairConfronto, limparConfronto } from '@/lib/midia/confronto';
import { useModalidades } from '@/lib/midia/useModalidades';
import { capturarQuadro, reduzirImagem } from '@/lib/ui/imagem';

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';
const LIMITE_VIDEO = 20 * 1024 * 1024;

type Form = {
  titulo: string;
  descricao: string;
  aba: 'arena' | 'mundo';
  categoria: NoticiaMidia['categoria'];
  modalidade: string;
  destaque: boolean;
  fonte: string;
  tipo_midia: 'foto' | 'video';
  imagem_url: string | null;
  enquadramento: string;
  video_url: string | null;
  video_link: string;
  confronto: string;
};

function formDe(n: NoticiaMidia | null): Form {
  return {
    titulo: n?.titulo ?? '',
    descricao: n?.descricao ?? '',
    aba: n?.aba ?? 'arena',
    categoria: n?.categoria ?? 'geral',
    modalidade: n?.modalidade ?? '',
    destaque: n?.destaque ?? false,
    fonte: n?.fonte ?? '',
    tipo_midia: n?.tipo_midia ?? 'foto',
    imagem_url: n?.imagem_url ?? null,
    enquadramento: n?.enquadramento ?? '50% 50%',
    video_url: n?.video_url ?? null,
    video_link: n?.video_link ?? '',
    confronto: n?.confronto ?? extrairConfronto(`${n?.titulo ?? ''} ${n?.descricao ?? ''}`) ?? '',
  };
}

type Props = { noticia: NoticiaMidia | null; modo: ModoVideo; diasVideo?: number; onSalvo: (n: NoticiaMidia) => void; onFechar: () => void };

/** Editor de notícia (spec 2026-11-08, 4.3): uma pessoa da coordenação edita e publica, sem segunda aprovação. */
export function EditorNoticia({ noticia, modo, diasVideo = 30, onSalvo, onFechar }: Props) {
  const supabase = createClient();
  const modalidades = useModalidades();
  const [f, setF] = useState<Form>(() => formDe(noticia));
  const [faltas, setFaltas] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const storyPostado = noticia?.story_status === 'publicado';
  // Vídeo guardado no site vai para o Story sozinho; foto, só se marcar.
  const [postarStory, setPostarStory] = useState(() => Boolean(noticia?.video_url) && !storyPostado);
  const videoRef = useRef<HTMLVideoElement>(null);
  const publicada = noticia?.status === 'publicado';
  const [posX, posY] = f.enquadramento.split(' ').map((v) => parseInt(v, 10) || 50);

  const muda = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function subir(conteudo: Blob, caminho: string, tipo: string): Promise<string | null> {
    const { error } = await supabase.storage.from('noticias').upload(caminho, conteudo, { contentType: tipo, upsert: true });
    if (error) {
      setMensagem(`Não consegui enviar o arquivo: ${error.message}`);
      return null;
    }
    return supabase.storage.from('noticias').getPublicUrl(caminho).data.publicUrl;
  }

  async function enviarCartaz(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (!arq.type.startsWith('image/') || arq.size > 5 * 1024 * 1024) return setMensagem('O cartaz precisa ser uma imagem de até 5 MB.');
    setOcupado(true);
    const url = await subir(await reduzirImagem(arq), `cartazes/${Date.now()}.jpg`, 'image/jpeg');
    setOcupado(false);
    if (url) muda('imagem_url', url);
  }

  async function enviarVideo(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (modo === 'so_link') return setMensagem('O modo atual é "só link": cole o link do vídeo em vez de enviar o arquivo.');
    if (!arq.type.startsWith('video/') || arq.size > LIMITE_VIDEO) return setMensagem('O vídeo precisa ter até 20 MB.');
    setOcupado(true);
    const url = await subir(arq, `videos/${Date.now()}.${arq.name.split('.').pop() || 'mp4'}`, arq.type);
    setOcupado(false);
    if (url) setF((x) => ({ ...x, video_url: url, tipo_midia: 'video' }));
  }

  async function usarQuadro() {
    if (!videoRef.current) return;
    const blob = await capturarQuadro(videoRef.current);
    if (!blob) return setMensagem('Não consegui capturar o quadro deste vídeo.');
    const url = await subir(blob, `cartazes/quadro-${Date.now()}.jpg`, 'image/jpeg');
    if (url) muda('imagem_url', url);
  }

  /** Tira o vídeo do formulário; o arquivo só é apagado depois de salvar (sem salvar, a notícia continua com ele). */
  function removerVideo() {
    muda('video_url', null);
    setMensagem('Vídeo removido do formulário. Salve para confirmar.');
  }

  /** Chama o servidor até o Instagram terminar (vídeo leva alguns segundos para processar). */
  async function enviarStory(id: string): Promise<{ status: string; erro?: string }> {
    setMensagem('Publicada! Postando o Story no Instagram… (vídeo pode levar 1 ou 2 minutos)');
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      try {
        const r = await fetch('/api/instagram/story', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
        const j = (await r.json()) as { status: string; erro?: string };
        if (j.status !== 'processando') return j;
      } catch {
        return { status: 'erro', erro: 'Sem conexão com o site.' };
      }
    }
    return { status: 'processando' };
  }

  async function gravar(status: 'rascunho' | 'publicado') {
    setMensagem('');
    if (status === 'publicado') {
      const falta = faltasParaPublicar({ ...f, video_link: f.video_link.trim() || null }, modo);
      setFaltas(falta);
      if (falta.length) return;
    } else {
      setFaltas(f.titulo.trim() ? [] : ['Falta o título.']);
      if (!f.titulo.trim()) return;
    }
    const link = f.video_link.trim() || null;
    const dados = {
      titulo: f.titulo.trim(),
      descricao: f.descricao.trim(),
      aba: f.aba,
      categoria: f.categoria,
      modalidade: f.modalidade || null,
      destaque: f.destaque,
      fonte: f.fonte.trim() || null,
      tipo_midia: f.tipo_midia,
      imagem_url: f.imagem_url,
      enquadramento: f.enquadramento,
      video_url: f.video_url,
      video_expira_em: f.video_url && f.video_url !== noticia?.video_url ? new Date(Date.now() + diasVideo * 86400000).toISOString() : f.video_url ? noticia?.video_expira_em ?? null : null,
      video_link: link,
      video_servico: link ? servicoDoLink(link) : null,
      status,
      // Só manda quando tem valor: assim o editor segue gravando mesmo antes da 0017 no banco.
      ...(f.tipo_midia === 'video' && limparConfronto(f.confronto) ? { confronto: limparConfronto(f.confronto) } : noticia?.confronto ? { confronto: null } : {}),
    };
    setOcupado(true);
    const r = noticia ? await supabase.from('noticias').update(dados).eq('id', noticia.id).select().single() : await supabase.from('noticias').insert(dados).select().single();
    setOcupado(false);
    if (r.error) {
      setMensagem(/column|coluna/i.test(r.error.message) ? 'O editor novo passa a gravar depois da atualização do banco (fim da Fase 3).' : `Erro: ${r.error.message}`);
      return;
    }
    // Arquivo de vídeo trocado ou removido: só agora, com a notícia salva, apaga o antigo do armazenamento.
    const antigo = noticia?.video_url?.split('/object/public/noticias/')[1];
    if (antigo && noticia?.video_url !== dados.video_url) await supabase.storage.from('noticias').remove([decodeURIComponent(antigo.split('?')[0])]);
    setMensagem(status === 'publicado' ? 'Publicada! Já aparece no site em até 1 minuto.' : 'Rascunho salvo.');
    const salva = { ...(noticia ?? ({} as NoticiaMidia)), ...(r.data as NoticiaMidia) };
    if (status === 'publicado' && postarStory && !storyPostado) {
      setOcupado(true);
      const s = await enviarStory(salva.id);
      setOcupado(false);
      setPostarStory(false);
      if (s.status === 'publicado') {
        salva.story_status = 'publicado';
        setMensagem('Publicada no site e postada no Story do Instagram ✅');
      } else if (s.status === 'processando') {
        setMensagem('Publicada no site. O Instagram ainda está processando o vídeo: clique em Publicar de novo daqui a pouco para concluir o Story.');
        setPostarStory(true);
      } else {
        setMensagem(`Publicada no site, mas o Story não foi postado: ${s.erro ?? 'erro desconhecido'}`);
      }
    }
    onSalvo(salva);
  }

  const ytId = idYoutube(f.video_link.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold uppercase">{noticia ? 'Editar notícia' : 'Nova notícia'}</h2>
        </div>
        {noticia?.origem === 'telegram' && (
          <p className="rounded-2xl border border-av-amarelo/40 bg-av-amarelo/10 px-4 py-3 text-sm text-av-amarelo">Reescreva com suas palavras.</p>
        )}

        <label className={ROTULO}>
          Título
          <input className={CAMPO} value={f.titulo} maxLength={140} onChange={(e) => muda('titulo', e.target.value)} />
        </label>
        <label className={ROTULO}>
          Texto
          <textarea className={`${CAMPO} min-h-[140px]`} value={f.descricao} onChange={(e) => muda('descricao', e.target.value)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={ROTULO}>
            Aba
            <select className={CAMPO} value={f.aba} onChange={(e) => muda('aba', e.target.value as Form['aba'])}>
              <option value="arena">Notícias do Vale</option>
              <option value="mundo">Esporte Mundial</option>
            </select>
          </label>
          <label className={ROTULO}>
            Categoria
            <select className={CAMPO} value={f.categoria} onChange={(e) => muda('categoria', e.target.value as Form['categoria'])}>
              {CATEGORIAS_MIDIA.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className={ROTULO}>
            Modalidade
            <select className={CAMPO} value={f.modalidade} onChange={(e) => muda('modalidade', e.target.value)}>
              <option value="">—</option>
              {modalidades.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nome}
                </option>
              ))}
            </select>
          </label>
          <label className={ROTULO}>
            Tipo
            <select className={CAMPO} value={f.tipo_midia} onChange={(e) => muda('tipo_midia', e.target.value as Form['tipo_midia'])}>
              <option value="foto">Foto</option>
              <option value="video">Vídeo</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ROTULO}>
            Fonte (opcional)
            <input className={CAMPO} value={f.fonte} onChange={(e) => muda('fonte', e.target.value)} placeholder="Ex.: nome do canal de origem" />
          </label>
          <label className="flex items-center gap-3 self-end pb-3 text-av-branco">
            <input type="checkbox" checked={f.destaque} onChange={(e) => muda('destaque', e.target.checked)} className="h-5 w-5 accent-[#e50914]" />
            Destaque (aparece no banner grande)
          </label>
        </div>

        <div className="grid gap-3 rounded-2xl border border-av-linha p-4">
          <strong className="font-rotulo uppercase tracking-wider">Cartaz</strong>
          <div className="flex flex-wrap gap-2">
            <label className="btn-leve cursor-pointer">
              {f.imagem_url ? 'Trocar o cartaz' : 'Enviar o cartaz'}
              <input type="file" accept="image/*" className="hidden" onChange={enviarCartaz} />
            </label>
            {ytId && !f.imagem_url && (
              <button type="button" className="btn-leve" onClick={() => muda('imagem_url', `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`)}>
                Usar a imagem do YouTube
              </button>
            )}
          </div>
          {f.imagem_url && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={ROTULO}>
                Enquadramento horizontal
                <input type="range" min={0} max={100} value={posX} onChange={(e) => muda('enquadramento', `${e.target.value}% ${posY}%`)} />
              </label>
              <label className={ROTULO}>
                Enquadramento vertical
                <input type="range" min={0} max={100} value={posY} onChange={(e) => muda('enquadramento', `${posX}% ${e.target.value}%`)} />
              </label>
            </div>
          )}
        </div>

        {f.tipo_midia === 'video' && (
          <div className="grid gap-3 rounded-2xl border border-av-linha p-4">
            <strong className="font-rotulo uppercase tracking-wider">Vídeo</strong>
            <label className={ROTULO}>
              Times do jogo (aparecem no cabeçalho do vídeo, abaixo da logo)
              <input className={CAMPO} value={f.confronto} maxLength={60} placeholder="Ex.: Flamengo x Palmeiras" onChange={(e) => muda('confronto', e.target.value)} />
            </label>
            <label className={ROTULO}>
              Link do vídeo original (opcional{modo === 'so_link' ? ', obrigatório no modo só link' : ''})
              <input className={CAMPO} value={f.video_link} onChange={(e) => muda('video_link', e.target.value)} placeholder="https://..." />
            </label>
            {modo === 'guardar_arquivo' && (
              <div className="flex flex-wrap gap-2">
                <label className="btn-leve cursor-pointer">
                  {f.video_url ? 'Trocar o arquivo' : 'Enviar o arquivo (até 20 MB)'}
                  <input type="file" accept="video/*" className="hidden" onChange={enviarVideo} />
                </label>
                {f.video_url && (
                  <button type="button" className="btn-leve" onClick={removerVideo}>
                    Remover vídeo
                  </button>
                )}
              </div>
            )}
            {f.video_url && (
              <div className="grid gap-2">
                <video ref={videoRef} src={f.video_url} controls crossOrigin="anonymous" className="max-h-64 rounded-2xl bg-black" />
                <button type="button" className="btn-leve w-fit" onClick={usarQuadro}>
                  Usar o quadro atual como cartaz
                </button>
              </div>
            )}
          </div>
        )}

        {faltas.length > 0 && (
          <ul className="grid gap-1 rounded-2xl bg-av-vermelho/10 px-4 py-3 text-sm text-[#ff8a8f]" role="alert">
            {faltas.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
        {mensagem && <p className="text-sm text-av-branco">{mensagem}</p>}

        {storyPostado ? (
          <p className="text-sm text-av-cinza">✓ Story já postado no Instagram.</p>
        ) : (
          <label className="flex items-center gap-3 text-sm text-av-branco">
            <input type="checkbox" className="h-5 w-5 accent-[#e50914]" checked={postarStory} onChange={(e) => setPostarStory(e.target.checked)} />
            Postar no Story do Instagram ao publicar
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={ocupado} onClick={() => gravar('rascunho')} className="btn-leve disabled:opacity-50">
            {publicada ? 'Despublicar' : 'Salvar rascunho'}
          </button>
          <button type="button" disabled={ocupado} onClick={() => gravar('publicado')} className="btn-forte disabled:opacity-50">
            Publicar
          </button>
          <button type="button" disabled={ocupado} onClick={onFechar} className="btn-leve disabled:opacity-50">
            ← Voltar à lista
          </button>
        </div>
      </div>

      <aside className="grid content-start gap-2">
        <span className="font-rotulo text-xs uppercase tracking-widest text-av-cinza">Prévia do cartaz</span>
        <div className="w-[220px]">
          <Cartaz
            href="#"
            titulo={f.titulo || 'Título da notícia'}
            imagem={f.imagem_url}
            enquadramento={f.enquadramento}
            video={f.tipo_midia === 'video'}
            cabecalho={f.tipo_midia === 'video' ? { confronto: limparConfronto(f.confronto) } : undefined}
            novo
          />
        </div>
      </aside>
    </div>
  );
}
