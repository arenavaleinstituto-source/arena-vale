'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Liga o Telegram de quem está logado ao bot (spec 2026-11-08, 4.4): código de 6 dígitos válido por 10 minutos. */
export function VincularTelegram() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');

  async function gerar() {
    setMensagem('');
    const { data, error } = await createClient().rpc('gerar_codigo_telegram');
    if (error || !data) {
      setMensagem(/function|função|does not exist/i.test(error?.message ?? '') ? 'O vínculo com o Telegram passa a funcionar depois da atualização do banco (fim da Fase 3).' : 'Não consegui gerar o código. Tente de novo.');
      return;
    }
    setCodigo(String(data));
  }

  async function desvincular() {
    const { error } = await createClient().rpc('desvincular_telegram');
    setCodigo(null);
    setMensagem(error ? 'Não consegui desvincular. Tente de novo.' : 'Telegram desvinculado.');
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-av-linha bg-av-grafite-2 p-4">
      <div className="min-w-0 flex-1 text-sm text-av-cinza">
        {codigo ? (
          <>
            Envie para o bot da ARENA VALE, em até 10 minutos: <code className="rounded-lg bg-black px-2 py-1 font-mono text-base text-av-branco">/vincular {codigo}</code>
          </>
        ) : (
          'Encaminhe notícias do Telegram para o bot e elas viram rascunhos aqui. Primeiro, vincule a sua conta.'
        )}
        {mensagem && <p className="mt-1 text-av-branco">{mensagem}</p>}
      </div>
      <button type="button" className="btn-forte" onClick={gerar}>
        Vincular Telegram
      </button>
      <button type="button" className="btn-leve" onClick={desvincular}>
        Desvincular
      </button>
    </div>
  );
}
