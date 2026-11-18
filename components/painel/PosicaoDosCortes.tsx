'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { capaVertical, type Giro, type VideoYT } from '@/lib/midia/youtube';

type Posicao = Giro | 'esconder';

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';

/**
 * Cortes do canal publicados deitados (vídeo horizontal girado dentro de um quadro vertical):
 * a coordenação marca aqui e o site mostra o vídeo em pé, num cartão horizontal.
 */
export function PosicaoDosCortes() {
  const sb = createClient();
  const [cortes, setCortes] = useState<VideoYT[] | null>(null);
  const [giros, setGiros] = useState<Record<string, Posicao>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [lista, { data }] = await Promise.all([
        fetch('/api/cortes')
          .then((r) => r.json() as Promise<{ cortes?: VideoYT[] }>)
          .then((j) => j.cortes ?? [])
          .catch(() => [] as VideoYT[]),
        sb.from('cortes_posicao').select('*'),
      ]);
      if (!vivo) return;
      setCortes(lista);
      const linhas = (data ?? []) as { video_id: string; giro: Giro | null; escondido?: boolean }[];
      setGiros(Object.fromEntries(linhas.flatMap<[string, Posicao]>((l) => (l.escondido ? [[l.video_id, 'esconder']] : l.giro ? [[l.video_id, l.giro]] : []))));
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  async function mudar(id: string, valor: string) {
    setMsg((m) => ({ ...m, [id]: '' }));
    const giro: Posicao | null = valor === 'esconder' ? 'esconder' : valor ? (Number(valor) as Giro) : null;
    const { error } =
      giro === 'esconder'
        ? await sb.from('cortes_posicao').upsert({ video_id: id, giro: null, escondido: true })
        : giro
          ? await sb.from('cortes_posicao').upsert({ video_id: id, giro, escondido: false })
          : await sb.from('cortes_posicao').delete().eq('video_id', id);
    if (error) return setMsg((m) => ({ ...m, [id]: `Não consegui salvar: ${error.message}` }));
    setGiros((g) => {
      const novo = { ...g };
      if (giro) novo[id] = giro;
      else delete novo[id];
      return novo;
    });
    setMsg((m) => ({ ...m, [id]: 'Salvo.' }));
  }

  return (
    <div className="panel grid gap-4">
      <h2 className="font-display text-2xl font-extrabold uppercase">Cortes do YouTube</h2>
      <p className="text-sm text-av-cinza">
        Algum corte aparece deitado no site? É um vídeo horizontal que foi publicado de lado. Escolha &ldquo;Deitado&rdquo; e o site mostra ele em pé, num cartão horizontal.
        Se ficar de cabeça para baixo, troque o lado do giro. Para tirar um corte do site, escolha &ldquo;Esconder do site&rdquo;.
      </p>
      {cortes === null && <p className="text-av-cinza">Carregando os cortes do canal...</p>}
      {cortes?.length === 0 && <p className="text-av-cinza">Nenhum corte encontrado no canal.</p>}
      <div className="grid gap-3">
        {cortes?.map((c) => {
          const posicao = giros[c.id];
          const giro = posicao === 'esconder' ? undefined : posicao;
          return (
            <div key={c.id} role="group" aria-label={c.titulo} className="flex flex-wrap items-center gap-4 rounded-2xl border border-av-linha bg-av-grafite-2 p-3">
              <div className={`relative shrink-0 overflow-hidden rounded-lg bg-black ${giro ? 'h-16 w-28' : 'h-28 w-16'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capaVertical(c.id)}
                  alt=""
                  className="absolute left-1/2 top-1/2 h-28 w-16 max-w-none object-cover"
                  style={{ transform: `translate(-50%, -50%)${giro ? ` rotate(${giro}deg)` : ''}`, opacity: posicao === 'esconder' ? 0.35 : 1 }}
                  // Sem capa em pé, o YouTube manda uma imagem genérica de 120×90: troca pela capa comum.
                  onLoad={(e) => {
                    if (e.currentTarget.naturalWidth <= 120 && e.currentTarget.src !== c.capa) e.currentTarget.src = c.capa;
                  }}
                  onError={(e) => {
                    if (e.currentTarget.src !== c.capa) e.currentTarget.src = c.capa;
                  }}
                />
              </div>
              <strong className="min-w-0 flex-1">{c.titulo}</strong>
              <label className="grid gap-1 text-sm text-av-cinza">
                Posição
                <select className={CAMPO} value={posicao ? String(posicao) : ''} onChange={(e) => void mudar(c.id, e.target.value)}>
                  <option value="">Em pé (normal)</option>
                  <option value="-90">Deitado — girar para a esquerda</option>
                  <option value="90">Deitado — girar para a direita</option>
                  <option value="esconder">Esconder do site</option>
                </select>
              </label>
              {msg[c.id] && <p role="status" className="w-full text-sm text-av-branco">{msg[c.id]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
