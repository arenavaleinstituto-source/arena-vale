'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { faltasVideoExterno } from '@/lib/midia/videos-externos';
import { reduzirImagem } from '@/lib/ui/imagem';

type Video = { id: string; titulo: string; link: string; capa_url: string; ativo: boolean; publicado_em: string };

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';

/** Aba "Vídeos" do painel (spec Fase 3, seção 11): vídeos do Instagram cadastrados à mão. */
export function AbaVideos() {
  const supabase = createClient();
  const [lista, setLista] = useState<Video[]>([]);
  const [link, setLink] = useState('');
  const [titulo, setTitulo] = useState('');
  const [capa, setCapa] = useState<string | null>(null);
  const [faltas, setFaltas] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.from('videos_externos').select('*').order('publicado_em', { ascending: false });
      if (vivo && data) setLista(data as Video[]);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  async function enviarCapa(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (!arq.type.startsWith('image/') || arq.size > 5 * 1024 * 1024) return setMensagem('A capa precisa ser uma imagem de até 5 MB.');
    const caminho = `videos-externos/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('noticias').upload(caminho, await reduzirImagem(arq), { contentType: 'image/jpeg' });
    if (error) return setMensagem(`Não consegui enviar a capa: ${error.message}`);
    setCapa(supabase.storage.from('noticias').getPublicUrl(caminho).data.publicUrl);
  }

  async function publicar() {
    setMensagem('');
    const falta = faltasVideoExterno({ link, titulo, capa_url: capa });
    setFaltas(falta);
    if (falta.length) return;
    const { data, error } = await supabase
      .from('videos_externos')
      .insert({ plataforma: 'instagram', link: link.trim(), titulo: titulo.trim(), capa_url: capa, ativo: true })
      .select()
      .single();
    if (error) {
      setMensagem(/relation|tabela|does not exist/i.test(error.message) ? 'O cadastro de vídeos passa a funcionar depois da atualização do banco (fim da Fase 3).' : `Erro: ${error.message}`);
      return;
    }
    setLista((l) => [data as Video, ...l]);
    setLink('');
    setTitulo('');
    setCapa(null);
    setMensagem('Vídeo publicado no site.');
  }

  async function alternar(v: Video) {
    const { error } = await supabase.from('videos_externos').update({ ativo: !v.ativo }).eq('id', v.id);
    if (!error) setLista((l) => l.map((x) => (x.id === v.id ? { ...x, ativo: !v.ativo } : x)));
  }

  return (
    <div className="grid gap-6">
      <div className="panel grid gap-4">
        <h2 className="font-display text-2xl font-extrabold uppercase">Vídeos do Instagram</h2>
        <p className="text-sm text-av-cinza">Os vídeos do YouTube entram sozinhos. Aqui você cadastra os do Instagram: eles aparecem em &ldquo;Últimos vídeos&rdquo; e abrem o post numa nova aba.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={ROTULO}>
            Link do post no Instagram
            <input className={CAMPO} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.instagram.com/reel/..." />
          </label>
          <label className={ROTULO}>
            Título do vídeo
            <input className={CAMPO} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn-leve cursor-pointer">
            {capa ? 'Trocar a capa' : 'Enviar a capa'}
            <input type="file" accept="image/*" className="hidden" onChange={enviarCapa} />
          </label>
          {capa && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capa} alt="Capa do vídeo" className="h-20 w-auto rounded-xl" />
          )}
        </div>
        {faltas.length > 0 && (
          <ul className="grid gap-1 rounded-2xl bg-av-vermelho/10 px-4 py-3 text-sm text-[#ff8a8f]" role="alert">
            {faltas.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
        <button type="button" onClick={publicar} className="btn-forte w-fit">
          Publicar vídeo
        </button>
        {mensagem && <p className="text-sm text-av-branco">{mensagem}</p>}
      </div>

      <div className="panel grid gap-3">
        <h2 className="font-display text-xl font-extrabold uppercase">Cadastrados · {lista.length}</h2>
        {lista.length === 0 && <p className="text-av-cinza">Nenhum vídeo do Instagram cadastrado.</p>}
        {lista.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-av-linha bg-av-grafite-2 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.capa_url} alt="" className="h-14 w-24 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <strong className="block truncate">{v.titulo}</strong>
              <a href={v.link} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-av-cinza">
                {v.link}
              </a>
            </div>
            <button type="button" onClick={() => alternar(v)} className={v.ativo ? 'btn-leve' : 'btn-forte'}>
              {v.ativo ? 'Tirar do site' : 'Voltar ao site'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
