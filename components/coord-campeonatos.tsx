'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MODALIDADES_SITE } from '@/lib/midia/modalidades';

type Campeonato = {
  id: string;
  nome: string;
  ano: number;
  categoria: string | null;
  formato: string | null;
  status: string;
  data_inicio: string | null;
  data_fim: string | null;
  modalidade: string | null;
};

const STATUS: Record<string, string> = {
  em_andamento: 'Em andamento',
  fase_grupos: 'Fase de grupos',
  mata_mata: 'Mata-mata',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};
const FORMATOS: Record<string, string> = { pontos_corridos: 'Pontos corridos', mata_mata: 'Mata-mata', grupos_mata_mata: 'Grupos + mata-mata' };

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';
const VAZIO = { nome: '', ano: new Date().getFullYear(), categoria: '', formato: 'pontos_corridos', status: 'em_andamento', data_inicio: '', data_fim: '', modalidade: '' };

/** Aba "Campeonatos" do painel: cadastro com modalidade (spec Fase 3, seção 8). */
export function CoordCampeonatos() {
  const supabase = createClient();
  const [lista, setLista] = useState<Campeonato[]>([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.from('campeonatos').select('*').order('ano', { ascending: false });
      if (vivo && data) setLista(data as Campeonato[]);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  const muda = (k: keyof typeof VAZIO) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function criar() {
    setMensagem('');
    if (!form.nome.trim()) {
      setErro('Informe o nome do campeonato.');
      return;
    }
    setErro('');
    const novo = {
      nome: form.nome.trim(),
      ano: Number(form.ano) || new Date().getFullYear(),
      categoria: form.categoria.trim() || null,
      formato: form.formato,
      status: form.status,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
      modalidade: form.modalidade || null,
    };
    const { data, error } = await supabase.from('campeonatos').insert(novo).select().single();
    if (error) {
      setErro(/modalidade/i.test(error.message) ? 'A modalidade passa a funcionar depois da atualização do banco (fim da Fase 3).' : `Erro: ${error.message}`);
      return;
    }
    setLista((l) => [data as Campeonato, ...l]);
    setForm(VAZIO);
    setMensagem('Campeonato criado.');
  }

  async function mudarCampo(id: string, campo: 'modalidade' | 'status', valor: string) {
    const { error } = await supabase.from('campeonatos').update({ [campo]: valor || null }).eq('id', id);
    if (error) {
      setErro(`Erro: ${error.message}`);
      return;
    }
    setLista((l) => l.map((c) => (c.id === id ? { ...c, [campo]: valor || null } : c)));
  }

  return (
    <div className="grid gap-6">
      <div className="panel grid gap-4">
        <h2 className="titulo-secao !text-left !text-2xl">Novo campeonato</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className={`${ROTULO} md:col-span-2`}>
            Nome do campeonato
            <input className={CAMPO} value={form.nome} onChange={muda('nome')} placeholder="Ex.: Copa Arena Vale 2027" />
          </label>
          <label className={ROTULO}>
            Modalidade
            <select className={CAMPO} value={form.modalidade} onChange={muda('modalidade')}>
              <option value="">—</option>
              {MODALIDADES_SITE.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nome}
                </option>
              ))}
            </select>
          </label>
          <label className={ROTULO}>
            Ano
            <input className={CAMPO} type="number" value={form.ano} onChange={muda('ano')} />
          </label>
          <label className={ROTULO}>
            Categoria
            <input className={CAMPO} value={form.categoria} onChange={muda('categoria')} placeholder="Ex.: Sub-17" />
          </label>
          <label className={ROTULO}>
            Formato
            <select className={CAMPO} value={form.formato} onChange={muda('formato')}>
              {Object.entries(FORMATOS).map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className={ROTULO}>
            Início
            <input className={CAMPO} type="date" value={form.data_inicio} onChange={muda('data_inicio')} />
          </label>
          <label className={ROTULO}>
            Fim
            <input className={CAMPO} type="date" value={form.data_fim} onChange={muda('data_fim')} />
          </label>
        </div>
        {erro && <p className="rounded-2xl bg-av-vermelho/10 px-4 py-3 text-sm text-[#ff8a8f]">{erro}</p>}
        <button type="button" onClick={criar} className="btn-forte w-fit">
          Criar campeonato
        </button>
        {mensagem && <p className="text-sm text-av-branco">{mensagem}</p>}
      </div>

      <div className="panel grid gap-3">
        <h2 className="titulo-secao !text-left !text-2xl">Campeonatos cadastrados · {lista.length}</h2>
        {lista.length === 0 && <p className="text-av-cinza">Nenhum campeonato cadastrado.</p>}
        {lista.map((c) => (
          <div key={c.id} className="grid gap-3 rounded-2xl border border-av-linha bg-av-grafite-2 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <strong className="block font-display uppercase">{c.nome}</strong>
              <span className="text-sm text-av-cinza">
                {c.ano}
                {c.categoria ? ` · ${c.categoria}` : ''}
                {c.formato ? ` · ${FORMATOS[c.formato] ?? c.formato}` : ''}
              </span>
            </div>
            <label className="grid gap-1 text-xs text-av-cinza">
              Modalidade de {c.nome}
              <select className={CAMPO} value={c.modalidade ?? ''} onChange={(e) => mudarCampo(c.id, 'modalidade', e.target.value)}>
                <option value="">—</option>
                {MODALIDADES_SITE.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs text-av-cinza">
              Situação de {c.nome}
              <select className={CAMPO} value={c.status} onChange={(e) => mudarCampo(c.id, 'status', e.target.value)}>
                {Object.entries(STATUS).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
