'use client';

import { useId, useState } from 'react';
import { EscudoTime } from '@/components/campeonatos/EscudoTime';
import { EnquadrarImagem } from './EnquadrarImagem';
import { MontadorEscudo } from './MontadorEscudo';
import { enviarEscudo } from './api';
import { TITULO_BLOCO } from './estilos';

type TimeDoEscudo = { id: string; nome: string; sigla: string | null; escudo_url: string | null; escudo_cor: string | null };

/** Escudo do time no painel do capitão: enviar o que o time já tem (com enquadramento) ou montar um no site. */
export function EscudoDoTime({ time }: { time: TimeDoEscudo }) {
  const id = useId();
  const [atual, setAtual] = useState(time);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [montando, setMontando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar(png: Blob, cor?: string) {
    setMsg(null);
    setEnviando(true);
    const r = await enviarEscudo('times', time.id, png, cor);
    setEnviando(false);
    if (!r.ok) return setMsg({ tipo: 'erro', texto: r.erro });
    setAtual((t) => ({ ...t, escudo_url: r.url, escudo_cor: cor ?? t.escudo_cor }));
    setArquivo(null);
    setMontando(false);
    setMsg({ tipo: 'ok', texto: 'Escudo atualizado.' });
  }

  return (
    <section aria-label="Escudo do time" className="grid gap-4 rounded-2xl border border-av-linha p-4">
      <span className={TITULO_BLOCO}>Escudo do time</span>
      <div className="flex flex-wrap items-center gap-4">
        <EscudoTime time={atual} tamanho={96} />
        <div className="flex flex-wrap gap-2">
          <label htmlFor={`${id}-arq`} className="btn-leve cursor-pointer">
            Enviar o escudo que já temos
            <input
              id={`${id}-arq`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                e.target.value = '';
                if (f && (!f.type.startsWith('image/') || f.size > 5 * 1024 * 1024)) return setMsg({ tipo: 'erro', texto: 'O escudo precisa ser uma imagem de até 5 MB.' });
                setMontando(false);
                setArquivo(f);
              }}
            />
          </label>
          <button type="button" className="btn-leve" onClick={() => (setArquivo(null), setMontando(true))}>
            Montar um escudo
          </button>
        </div>
      </div>
      {arquivo && <EnquadrarImagem key={`${arquivo.name}-${arquivo.lastModified}`} arquivo={arquivo} onPronto={(png) => void guardar(png)} textoBotao="Usar este escudo" />}
      {montando && <MontadorEscudo sigla={atual.sigla || atual.nome.slice(0, 3)} onPronto={(png, cor) => void guardar(png, cor)} />}
      {enviando && <p role="status" className="text-sm text-av-cinza">Enviando o escudo...</p>}
      {msg && (
        <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={`text-sm ${msg.tipo === 'erro' ? 'text-[#ff8a8f]' : 'text-av-branco'}`}>
          {msg.texto}
        </p>
      )}
    </section>
  );
}
