'use client';

import { useId, useState } from 'react';
import { desenharEscudo, type OpcoesEscudo } from '@/lib/campeonatos/escudo-svg';
import { svgParaPng } from '@/lib/ui/svg-para-png';
import { CAMPO, ROTULO } from './estilos';

const FORMATOS: { valor: OpcoesEscudo['formato']; nome: string }[] = [
  { valor: 'classico', nome: 'Clássico' },
  { valor: 'redondo', nome: 'Redondo' },
  { valor: 'losango', nome: 'Losango' },
  { valor: 'moderno', nome: 'Moderno' },
];
const DETALHES: { valor: OpcoesEscudo['detalhe']; nome: string }[] = [
  { valor: 'nenhum', nome: 'Nenhum' },
  { valor: 'faixa', nome: 'Faixa' },
  { valor: 'listras', nome: 'Listras' },
  { valor: 'estrela', nome: 'Estrela' },
];

/** Monta um escudo no site (formato, duas cores, texto e detalhe), com a prévia ao vivo. */
export function MontadorEscudo({ sigla, onPronto }: { sigla: string; onPronto: (png: Blob, cor: string) => void }) {
  const id = useId();
  const [opcoes, setOpcoes] = useState<OpcoesEscudo>({ formato: 'classico', cor1: '#e50914', cor2: '#ffffff', texto: sigla.slice(0, 4).toUpperCase(), detalhe: 'nenhum' });
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const mudar = (campos: Partial<OpcoesEscudo>) => setOpcoes((o) => ({ ...o, ...campos }));
  const svg = desenharEscudo(opcoes);

  async function usar() {
    setErro('');
    setGerando(true);
    try {
      onPronto(await svgParaPng(svg), opcoes.cor1);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui gerar o escudo.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-f`} className={ROTULO}>
          Formato
          <select id={`${id}-f`} className={CAMPO} value={opcoes.formato} onChange={(e) => mudar({ formato: e.target.value as OpcoesEscudo['formato'] })}>
            {FORMATOS.map((f) => <option key={f.valor} value={f.valor}>{f.nome}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-d`} className={ROTULO}>
          Detalhe
          <select id={`${id}-d`} className={CAMPO} value={opcoes.detalhe} onChange={(e) => mudar({ detalhe: e.target.value as OpcoesEscudo['detalhe'] })}>
            {DETALHES.map((d) => <option key={d.valor} value={d.valor}>{d.nome}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-c1`} className={ROTULO}>
          Cor principal
          <input id={`${id}-c1`} type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-av-linha bg-transparent" value={opcoes.cor1} onChange={(e) => mudar({ cor1: e.target.value })} />
        </label>
        <label htmlFor={`${id}-c2`} className={ROTULO}>
          Cor do detalhe
          <input id={`${id}-c2`} type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-av-linha bg-transparent" value={opcoes.cor2} onChange={(e) => mudar({ cor2: e.target.value })} />
        </label>
        <label htmlFor={`${id}-t`} className={`${ROTULO} sm:col-span-2`}>
          Texto do escudo
          <input id={`${id}-t`} maxLength={4} className={`${CAMPO} uppercase`} value={opcoes.texto} onChange={(e) => mudar({ texto: e.target.value.toUpperCase().slice(0, 4) })} />
        </label>
      </div>
      <div className="grid justify-items-center gap-3">
        <div role="img" aria-label="Prévia do escudo" className="h-40 w-40 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <button type="button" className="btn-forte" disabled={gerando} onClick={usar}>
          {gerando ? 'Gerando...' : 'Usar este escudo'}
        </button>
        {erro && <p role="alert" className="text-sm text-[#ff8a8f]">{erro}</p>}
      </div>
    </div>
  );
}
