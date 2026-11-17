'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validarRegulamento } from '@/lib/campeonatos/regulamento';
import type { Regulamento } from '@/lib/campeonatos/tipos';
import { EditorRegulamento } from './EditorRegulamento';
import { recalcularVagas } from './api';

/** Aba Regulamento: pontuação, desempates, W.O. e regras adicionais. Salvar recalcula a classificação. */
export function AbaRegulamentoCampeonato({ campeonatoId, regulamento, onMudou }: { campeonatoId: string; regulamento: Regulamento; onMudou: () => void }) {
  const [valor, setValor] = useState(regulamento);
  const [msg, setMsg] = useState<string[]>([]);

  async function salvar() {
    const erro = validarRegulamento(valor);
    if (erro) return setMsg([erro]);
    // A forma de disputa muda pela aba própria (ela recria os jogos); aqui ela fica como está.
    const { error } = await createClient().from('campeonatos').update({ regulamento: { ...valor, forma: regulamento.forma } }).eq('id', campeonatoId);
    if (error) return setMsg([`Não consegui salvar: ${error.message}`]);
    setMsg(['Regulamento salvo.', ...(await recalcularVagas(campeonatoId))]);
    onMudou();
  }

  return (
    <div className="grid gap-4">
      <EditorRegulamento valor={valor} onChange={setValor} />
      <button type="button" className="btn-forte w-fit" onClick={salvar}>
        Salvar regulamento
      </button>
      {msg.map((m) => (
        <p key={m} role="status" className="text-sm text-av-amarelo">
          {m}
        </p>
      ))}
    </div>
  );
}
