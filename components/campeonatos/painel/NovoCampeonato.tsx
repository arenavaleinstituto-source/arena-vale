'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useModalidades } from '@/lib/midia/useModalidades';
import { regulamentoPadrao, tipoPlacarDaModalidade, validarRegulamento } from '@/lib/campeonatos/regulamento';
import type { FormaDisputa, JogoGerado, Regulamento } from '@/lib/campeonatos/tipos';
import { EditorFormaDisputa } from './EditorFormaDisputa';
import { EditorRegulamento } from './EditorRegulamento';
import { EnquadrarImagem } from './EnquadrarImagem';
import { ListaJogosGerados } from './ListaJogosGerados';
import { MontagemManual, montagemParaGerar } from './MontagemManual';
import { TimesDoCampeonato, type TimeInscrito } from './TimesDoCampeonato';
import { enviarEscudo, gerarJogos } from './api';
import { CAMPO, ROTULO } from './estilos';

const PASSOS = ['Dados e escudo', 'Times', 'Forma de disputa', 'Regulamento', 'Revisar e gerar'];
const FORMA_INICIAL: FormaDisputa = { tipo: 'pontos_corridos', ida_volta: false, final_entre: null, mata: null };

/** Assistente de criação em 5 passos. O campeonato é criado no fim do passo 1 e nasce escondido. */
export function NovoCampeonato({ onCriado }: { onCriado: (id: string) => void }) {
  const sb = createClient();
  const modalidades = useModalidades();
  const [passo, setPasso] = useState(1);
  const [id, setId] = useState<string | null>(null);
  const [dados, setDados] = useState({ nome: '', ano: new Date().getFullYear(), modalidade: '', categoria: '' });
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [escudo, setEscudo] = useState<Blob | null>(null);
  const [times, setTimes] = useState<TimeInscrito[]>([]);
  const [forma, setForma] = useState<FormaDisputa>(FORMA_INICIAL);
  const [grupos, setGrupos] = useState<Record<string, string[]>>({});
  const [sementes, setSementes] = useState<string[]>([]);
  const [regulamento, setRegulamento] = useState<Regulamento | null>(null);
  const [previa, setPrevia] = useState<JogoGerado[] | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const montagem = () => montagemParaGerar(forma, times, grupos, sementes);

  async function simular(campId: string) {
    setPrevia(null);
    const r = await gerarJogos(campId, { forma, ...montagem(), simular: true });
    if (!r.ok) return setMsg(r.erro);
    setPrevia(r.jogos);
    setAvisos(r.avisos);
  }

  async function continuar() {
    setMsg('');
    setOcupado(true);
    try {
      if (passo === 1) {
        if (!dados.nome.trim()) return setMsg('Informe o nome do campeonato.');
        let campId = id;
        if (!campId) {
          const { data, error } = await sb.rpc('criar_campeonato', {
            p_nome: dados.nome.trim(),
            p_ano: dados.ano,
            p_modalidade: dados.modalidade || null,
            p_categoria: dados.categoria.trim() || null,
          });
          if (error || !data) return setMsg(error?.message ?? 'Não consegui criar o campeonato.');
          campId = String(data);
          setId(campId);
        } else {
          const { error } = await sb.from('campeonatos').update({ nome: dados.nome.trim(), ano: dados.ano, modalidade: dados.modalidade || null, categoria: dados.categoria.trim() || null }).eq('id', campId);
          if (error) return setMsg(`Não consegui salvar: ${error.message}`);
        }
        if (escudo) {
          const r = await enviarEscudo('campeonatos', campId, escudo);
          if (!r.ok) setMsg(`Campeonato criado, mas o escudo não foi: ${r.erro}`);
        }
      }
      if (passo === 2 && times.length < 2) return setMsg('Inscreva pelo menos 2 times.');
      if (passo === 3) {
        setRegulamento((r) => ({ ...(r ?? regulamentoPadrao(tipoPlacarDaModalidade(dados.modalidade || null), forma)), forma }));
      }
      if (passo === 4 && regulamento && id) {
        const erro = validarRegulamento(regulamento);
        if (erro) return setMsg(erro);
        const { error } = await sb.from('campeonatos').update({ regulamento }).eq('id', id);
        if (error) return setMsg(`Não consegui salvar o regulamento: ${error.message}`);
        setPasso(5);
        await simular(id);
        return;
      }
      setPasso((p) => Math.min(5, p + 1));
    } finally {
      setOcupado(false);
    }
  }

  async function gerarParaValer() {
    if (!id) return;
    setMsg('');
    setOcupado(true);
    const r = await gerarJogos(id, { forma, ...montagem(), simular: false });
    setOcupado(false);
    if (!r.ok) return setMsg(r.erro);
    onCriado(id);
  }

  const nomes = Object.fromEntries(times.map((t) => [t.id, t.nome]));

  return (
    <div className="grid gap-5">
      <ol className="flex flex-wrap gap-2" aria-label="Passos">
        {PASSOS.map((p, i) => (
          <li key={p} aria-current={passo === i + 1 ? 'step' : undefined} className={`rounded-full px-3 py-1 font-rotulo text-xs font-bold uppercase tracking-wider ${passo === i + 1 ? 'bg-av-vermelho text-white' : passo > i + 1 ? 'border border-av-vermelho/50 text-av-branco' : 'border border-av-linha text-av-cinza'}`}>
            {i + 1}. {p}
          </li>
        ))}
      </ol>

      {passo === 1 && (
        <div className="grid gap-4">
          <label className={ROTULO}>
            Nome do campeonato
            <input className={CAMPO} value={dados.nome} maxLength={80} onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={ROTULO}>
              Modalidade
              <select className={CAMPO} value={dados.modalidade} onChange={(e) => setDados({ ...dados, modalidade: e.target.value })}>
                <option value="">Escolha</option>
                {modalidades.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className={ROTULO}>
              Ano
              <input type="number" className={CAMPO} value={dados.ano} onChange={(e) => setDados({ ...dados, ano: Number(e.target.value) || dados.ano })} />
            </label>
            <label className={ROTULO}>
              Categoria (opcional)
              <input className={CAMPO} value={dados.categoria} placeholder="Ex.: Sub-17" onChange={(e) => setDados({ ...dados, categoria: e.target.value })} />
            </label>
          </div>
          <label className={ROTULO}>
            Escudo do campeonato (opcional)
            <input type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" onChange={(e) => (setArquivo(e.target.files?.[0] ?? null), setEscudo(null))} />
          </label>
          {arquivo && !escudo && <EnquadrarImagem key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`} arquivo={arquivo} onPronto={setEscudo} />}
          {escudo && <p className="text-sm text-av-branco">Escudo pronto ✓</p>}
        </div>
      )}

      {passo === 2 && id && <TimesDoCampeonato campeonatoId={id} inscritos={times} onMudou={setTimes} />}

      {passo === 3 && (
        <div className="grid gap-4">
          <EditorFormaDisputa valor={forma} tipoPlacar={tipoPlacarDaModalidade(dados.modalidade || null)} travada={false} temCampanha onChange={setForma} />
          <MontagemManual forma={forma} times={times} grupos={grupos} sementes={sementes} onGrupos={setGrupos} onSementes={setSementes} />
        </div>
      )}

      {passo === 4 && regulamento && <EditorRegulamento valor={regulamento} onChange={setRegulamento} />}

      {passo === 5 && (
        <div className="grid gap-3">
          <p className="text-sm text-av-cinza">Confira os jogos antes de gerar. Datas, horários e locais ficam “a definir” e você preenche depois.</p>
          {previa ? <ListaJogosGerados jogos={previa} nomes={nomes} /> : !msg && <p className="text-av-cinza">Montando os jogos…</p>}
          {avisos.map((a) => (
            <p key={a} className="text-sm text-av-amarelo">
              {a}
            </p>
          ))}
        </div>
      )}

      {msg && (
        <p role="alert" className="text-sm text-av-vermelho-claro">
          {msg}
        </p>
      )}

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-leve" disabled={passo === 1 || ocupado} onClick={() => (setMsg(''), setPasso((p) => Math.max(1, p - 1)))}>
          Voltar
        </button>
        {passo < 5 ? (
          <button type="button" className="btn-forte" disabled={ocupado} onClick={continuar}>
            Continuar
          </button>
        ) : (
          <button type="button" className="btn-forte" disabled={ocupado || !previa} onClick={gerarParaValer}>
            Gerar os jogos
          </button>
        )}
      </div>
    </div>
  );
}
