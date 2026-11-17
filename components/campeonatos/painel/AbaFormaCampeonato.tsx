'use client';

import { useState } from 'react';
import type { FormaDisputa, Regulamento } from '@/lib/campeonatos/tipos';
import { EditorFormaDisputa } from './EditorFormaDisputa';
import { MontagemManual, montagemParaGerar } from './MontagemManual';
import { gerarJogos } from './api';

type Props = {
  campeonatoId: string;
  regulamento: Regulamento;
  times: { id: string; nome: string }[];
  temJogos: boolean;
  /** Há resultado: o tipo da forma de disputa fica travado (as fases futuras ainda podem mudar). */
  travada: boolean;
  onMudou: () => void;
};

/** Aba Forma de disputa: muda as opções e recria os jogos que ainda não foram disputados. */
export function AbaFormaCampeonato({ campeonatoId, regulamento, times, temJogos, travada, onMudou }: Props) {
  const [forma, setForma] = useState<FormaDisputa>(regulamento.forma);
  const [grupos, setGrupos] = useState<Record<string, string[]>>({});
  const [sementes, setSementes] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ tipo: 'erro' | 'ok'; textos: string[] } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function salvar() {
    setMsg(null);
    const pergunta = temJogos ? 'Recriar os jogos que ainda não foram disputados?' : 'Gerar os jogos agora?';
    if (!window.confirm(pergunta)) return;
    setOcupado(true);
    const r = await gerarJogos(campeonatoId, { forma, ...montagemParaGerar(forma, times, grupos, sementes), formaMudou: forma.tipo !== regulamento.forma.tipo, simular: false });
    setOcupado(false);
    if (!r.ok) return setMsg({ tipo: 'erro', textos: [r.erro] });
    setMsg({ tipo: 'ok', textos: ['Jogos atualizados.', ...r.avisos] });
    onMudou();
  }

  return (
    <div className="grid gap-4">
      <EditorFormaDisputa valor={forma} tipoPlacar={regulamento.tipo_placar} travada={travada} temCampanha onChange={setForma} />
      <MontagemManual forma={forma} times={times} grupos={grupos} sementes={sementes} onGrupos={setGrupos} onSementes={setSementes} />
      <button type="button" className="btn-forte w-fit" disabled={ocupado} onClick={salvar}>
        Salvar forma de disputa
      </button>
      {msg && (
        <div role={msg.tipo === 'erro' ? 'alert' : 'status'} className={`grid gap-1 text-sm ${msg.tipo === 'erro' ? 'text-av-vermelho-claro' : 'text-av-amarelo'}`}>
          {msg.textos.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      )}
    </div>
  );
}
