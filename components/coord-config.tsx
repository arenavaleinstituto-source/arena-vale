'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CONFIG_PADRAO } from '@/lib/midia/config-padrao';

export type CamposConfig = {
  whatsapp: string;
  instagram_url: string;
  youtube_channel_id: string;
  youtube_handle: string;
};

/** Confere os campos antes de salvar. Erros bloqueiam; avisos só orientam. */
export function validarConfig(c: CamposConfig): { erros: string[]; avisos: string[]; valores: CamposConfig } {
  const erros: string[] = [];
  const avisos: string[] = [];
  const whatsapp = c.whatsapp.replace(/\D/g, '');
  if (whatsapp.length < 10 || whatsapp.length > 13) erros.push('WhatsApp inválido: use só números, com 55 e DDD.');
  else if (!whatsapp.startsWith('55')) avisos.push(`Inclua o 55 (Brasil) antes do DDD: 55${whatsapp}.`);
  if (!/^UC[\w-]{22}$/.test(c.youtube_channel_id.trim())) erros.push('ID do canal inválido (começa com UC e tem 24 caracteres).');
  if (!/^@[\w.-]+$/.test(c.youtube_handle.trim())) erros.push('O nome do canal começa com @ (ex.: @TVArenaVale).');
  if (!/^https:\/\/\S+$/.test(c.instagram_url.trim())) erros.push('O link do Instagram começa com https://');
  return {
    erros,
    avisos,
    valores: {
      whatsapp,
      instagram_url: c.instagram_url.trim(),
      youtube_channel_id: c.youtube_channel_id.trim(),
      youtube_handle: c.youtube_handle.trim(),
    },
  };
}

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';

/** Configurações do site (spec Fase 3, seção 12): capa do banner, canal do YouTube, Instagram e WhatsApp. */
export function CoordConfig() {
  const supabase = createClient();
  const [campos, setCampos] = useState<CamposConfig>({
    whatsapp: CONFIG_PADRAO.whatsapp,
    instagram_url: CONFIG_PADRAO.instagramUrl,
    youtube_channel_id: CONFIG_PADRAO.youtubeChannelId,
    youtube_handle: CONFIG_PADRAO.youtubeHandle,
  });
  const [capa, setCapa] = useState<string | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.from('site_config').select('*').eq('id', 'main').maybeSingle();
      if (!vivo || !data) return;
      const d = data as Record<string, string | null>;
      setCampos((c) => ({
        whatsapp: d.whatsapp || c.whatsapp,
        instagram_url: d.instagram_url || c.instagram_url,
        youtube_channel_id: d.youtube_channel_id || c.youtube_channel_id,
        youtube_handle: d.youtube_handle || c.youtube_handle,
      }));
      setCapa(d.capa_url ?? null);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  const muda = (k: keyof CamposConfig) => (e: ChangeEvent<HTMLInputElement>) => setCampos((c) => ({ ...c, [k]: e.target.value }));

  async function enviarCapa(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/') || arquivo.size > 5 * 1024 * 1024) {
      setErros(['A capa precisa ser uma imagem de até 5 MB.']);
      return;
    }
    const caminho = `config/capa-${Date.now()}.${arquivo.name.split('.').pop() || 'jpg'}`;
    const { error } = await supabase.storage.from('noticias').upload(caminho, arquivo, { upsert: false });
    if (error) {
      setErros([`Não consegui enviar a capa: ${error.message}`]);
      return;
    }
    setCapa(supabase.storage.from('noticias').getPublicUrl(caminho).data.publicUrl);
    setMensagem('Capa enviada. Clique em "Salvar configurações" para usar.');
  }

  async function salvar() {
    const r = validarConfig(campos);
    setErros(r.erros);
    setMensagem('');
    if (r.erros.length) return;
    setSalvando(true);
    const { error } = await supabase.from('site_config').upsert({ id: 'main', ...r.valores, capa_url: capa, updated_at: new Date().toISOString() });
    setSalvando(false);
    if (error) {
      const faltaColuna = /column|coluna/i.test(error.message);
      setMensagem(faltaColuna ? 'Estas opções passam a funcionar depois da atualização do banco (fim da Fase 3).' : `Erro: ${error.message}`);
      return;
    }
    setCampos(r.valores);
    setMensagem(['Configurações salvas.', ...r.avisos].join(' '));
  }

  return (
    <div className="panel grid gap-5">
      <h2 className="titulo-secao !text-left !text-2xl">Configurações do site</h2>

      <div className="grid gap-2">
        <span className="text-sm text-av-cinza">Capa do banner da página inicial</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={capa || CONFIG_PADRAO.capaUrl} alt="Capa atual do banner" className="aspect-[16/6] w-full max-w-xl rounded-2xl object-cover" />
        <label className="btn-leve w-fit cursor-pointer">
          Trocar a capa
          <input type="file" accept="image/*" className="hidden" onChange={enviarCapa} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={ROTULO}>
          WhatsApp
          <input className={CAMPO} value={campos.whatsapp} onChange={muda('whatsapp')} inputMode="numeric" placeholder="5547988444404" />
        </label>
        <label className={ROTULO}>
          Link do Instagram
          <input className={CAMPO} value={campos.instagram_url} onChange={muda('instagram_url')} placeholder="https://www.instagram.com/arenavaleoficial" />
        </label>
        <label className={ROTULO}>
          ID do canal do YouTube
          <input className={CAMPO} value={campos.youtube_channel_id} onChange={muda('youtube_channel_id')} placeholder="UC..." />
        </label>
        <label className={ROTULO}>
          Nome do canal do YouTube
          <input className={CAMPO} value={campos.youtube_handle} onChange={muda('youtube_handle')} placeholder="@TVArenaVale" />
        </label>
      </div>

      {erros.length > 0 && (
        <ul className="grid gap-1 rounded-2xl bg-av-vermelho/10 px-4 py-3 text-sm text-[#ff8a8f]">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button type="button" onClick={salvar} disabled={salvando} className="btn-forte w-fit disabled:opacity-50">
        {salvando ? 'Salvando...' : 'Salvar configurações'}
      </button>
      {mensagem && <p className="text-sm text-av-branco">{mensagem}</p>}
    </div>
  );
}
