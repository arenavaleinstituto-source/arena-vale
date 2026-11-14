'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { VideoYT } from '@/lib/midia/youtube';

/** Aba "Cortes" do painel: oculta/revela Shorts do canal sem apagar do YouTube. */
export function AbaCortes() {
  const supabase = createClient();
  const [cortes, setCortes] = useState<VideoYT[]>([]);
  const [ocultos, setOcultos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let vivo = true;
    fetch('/api/cortes')
      .then((r) => r.json())
      .then(({ cortes: c, ocultos: o }: { cortes: VideoYT[]; ocultos: string[] }) => {
        if (!vivo) return;
        setCortes(c);
        setOcultos(new Set(o));
        setCarregando(false);
      })
      .catch(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function alternar(videoId: string) {
    setMensagem('');
    if (ocultos.has(videoId)) {
      const { error } = await supabase.from('cortes_ocultos').delete().eq('video_id', videoId);
      if (error) return setMensagem(`Erro: ${error.message}`);
      setOcultos((prev) => {
        const s = new Set(prev);
        s.delete(videoId);
        return s;
      });
    } else {
      const { error } = await supabase.from('cortes_ocultos').insert({ video_id: videoId });
      if (error) return setMensagem(`Erro: ${error.message}`);
      setOcultos((prev) => new Set([...prev, videoId]));
    }
  }

  if (carregando) {
    return (
      <div className="panel">
        <p className="text-av-cinza">Carregando cortes...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="panel grid gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">Cortes (Shorts)</h2>
        <p className="text-sm text-av-cinza">
          Esses vídeos vêm direto do seu canal do YouTube. Desative os que não quer mostrar no site — eles continuam no YouTube normalmente.
        </p>
        {cortes.length === 0 && (
          <p className="rounded-2xl border border-av-linha bg-av-grafite-2 px-4 py-3 text-sm text-av-cinza">
            Nenhum Corte encontrado. Isso acontece quando a chave <code className="text-av-branco">YOUTUBE_API_KEY</code> ainda não está configurada na Vercel.
          </p>
        )}
        {mensagem && <p className="text-sm text-[#ff8a8f]">{mensagem}</p>}
      </div>

      {cortes.length > 0 && (
        <div className="panel grid gap-3">
          <h2 className="font-display text-xl font-extrabold uppercase">
            Cortes · {cortes.length}
            {ocultos.size > 0 && (
              <span className="ml-2 font-sans text-sm font-normal text-av-cinza">
                ({ocultos.size} oculto{ocultos.size !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
          {cortes.map((c) => {
            const escondido = ocultos.has(c.id);
            return (
              <div
                key={c.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border p-3 transition ${
                  escondido ? 'border-av-linha bg-av-grafite-2 opacity-60' : 'border-av-linha bg-av-grafite-2'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.capa} alt="" className="h-14 w-24 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{c.titulo}</strong>
                  {escondido && (
                    <span className="mt-0.5 block text-xs text-av-cinza">Oculto no site</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => alternar(c.id)}
                  className={escondido ? 'btn-forte' : 'btn-leve'}
                >
                  {escondido ? 'Voltar ao site' : 'Tirar do site'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
