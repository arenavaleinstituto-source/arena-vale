'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function CoordConfig() {
  const supabase = createClient();

  const [nomeSite, setNomeSite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [youtube, setYoutube] = useState('');
  const [video, setVideo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 'main')
        .single();

      if (data) {
        setNomeSite(data.nome_site || '');
        setWhatsapp(data.whatsapp || '');
        setYoutube(data.youtube_url || '');
        setVideo(data.video_destaque_url || '');
      }
    }

    carregar();
  }, []);

  async function salvar() {
    setSalvando(true);
    setMensagem('');

    const { error } = await supabase
      .from('site_config')
      .upsert({
        id: 'main',
        nome_site: nomeSite,
        whatsapp: whatsapp || null,
        youtube_url: youtube || null,
        video_destaque_url: video || null,
        updated_at: new Date().toISOString(),
      });

    setSalvando(false);
    setMensagem(error ? `Erro: ${error.message}` : 'Configurações salvas.');
  }

  return (
    <div className="panel">
      <h2 className="font-serif text-xl font-bold mb-5">
        ⚙️ Configurações do site
      </h2>

      <div className="grid gap-4">
        <input
          value={nomeSite}
          onChange={(e) => setNomeSite(e.target.value)}
          placeholder="Nome do site"
          className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
        />

        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp"
          className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
        />

        <input
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          placeholder="Link do YouTube"
          className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
        />

        <input
          value={video}
          onChange={(e) => setVideo(e.target.value)}
          placeholder="Link do vídeo em destaque"
          className="px-3 py-3 rounded-[10px] bg-[rgba(8,22,58,0.6)] border border-white/10"
        />

        <button
          onClick={salvar}
          disabled={salvando}
          className="btn-primary w-fit"
        >
          {salvando ? 'Salvando...' : 'Salvar configurações'}
        </button>

        {mensagem && (
          <p className="text-sm text-[var(--primary)]">
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}

