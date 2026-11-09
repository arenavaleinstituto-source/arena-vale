'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Aba "Ao Vivo" do painel (spec Fase 3, seção 6): reserva manual do ao vivo. */
export function AbaAoVivo({ aoVivoDetectado }: { aoVivoDetectado: boolean }) {
  const supabase = createClient();
  const [manual, setManual] = useState(false);
  const [link, setLink] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.from('site_config').select('*').eq('id', 'main').maybeSingle();
      const d = data as { ao_vivo_manual?: boolean; ao_vivo_link?: string | null } | null;
      if (vivo && d) {
        setManual(d.ao_vivo_manual === true);
        setLink(d.ao_vivo_link ?? '');
      }
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  async function salvar() {
    setMensagem('');
    if (manual && !/^https:\/\/\S+$/.test(link.trim())) {
      setErro('Cole o link da live começando com https://');
      return;
    }
    setErro('');
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 'main', ao_vivo_manual: manual, ao_vivo_link: link.trim() || null, updated_at: new Date().toISOString() });
    if (error) {
      setMensagem(/column|coluna/i.test(error.message) ? 'Esta opção passa a funcionar depois da atualização do banco (fim da Fase 3).' : `Erro: ${error.message}`);
      return;
    }
    setMensagem(manual ? 'Pronto: o site mostra o player ao vivo.' : 'Pronto: o site volta a detectar a live sozinho.');
  }

  return (
    <div className="panel grid gap-5">
      <h2 className="titulo-secao !text-left !text-2xl">Ao Vivo</h2>
      <p className="text-av-cinza">
        Detecção automática: <strong className={aoVivoDetectado ? 'text-av-amarelo' : 'text-av-branco'}>{aoVivoDetectado ? 'ao vivo agora' : 'fora do ar'}</strong>. O site
        confere o canal TV Arena Vale a cada 2 minutos.
      </p>
      <label className="flex items-center gap-3 text-av-branco">
        <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} className="h-5 w-5 accent-[#e50914]" />
        Estamos ao vivo agora
      </label>
      <label className="grid gap-1.5 text-sm text-av-cinza">
        Link da transmissão
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://www.youtube.com/live/..."
          className="w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho"
        />
      </label>
      {erro && <p className="rounded-2xl bg-av-vermelho/10 px-4 py-3 text-sm text-[#ff8a8f]">{erro}</p>}
      <button type="button" onClick={salvar} className="btn-forte w-fit">
        Salvar
      </button>
      {mensagem && <p className="text-sm text-av-branco">{mensagem}</p>}
    </div>
  );
}
