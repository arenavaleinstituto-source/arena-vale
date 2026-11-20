'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useModalidades } from '@/lib/midia/useModalidades';
import { EscudoCampeonato } from '@/components/campeonatos/EscudoCampeonato';
import { EnquadrarImagem } from './EnquadrarImagem';
import { enviarEscudo } from './api';
import { CAMPO, ROTULO } from './estilos';

type Campeonato = { id: string; nome: string; ano: number; categoria: string | null; modalidade: string | null; status: string; logo_url: string | null };

const SITUACOES: [string, string][] = [
  ['em_andamento', 'Em andamento'],
  ['fase_grupos', 'Fase de grupos'],
  ['mata_mata', 'Mata-mata'],
  ['finalizado', 'Encerrado'],
  ['cancelado', 'Cancelado'],
];

/** Aba Dados e escudo do campeonato. */
export function AbaDadosCampeonato({ campeonato, onMudou }: { campeonato: Campeonato; onMudou: () => void }) {
  const modalidades = useModalidades();
  const [f, setF] = useState({ nome: campeonato.nome, ano: campeonato.ano, categoria: campeonato.categoria ?? '', modalidade: campeonato.modalidade ?? '', status: campeonato.status });
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [logo, setLogo] = useState(campeonato.logo_url);
  const [msg, setMsg] = useState('');

  async function salvar() {
    setMsg('');
    if (!f.nome.trim()) return setMsg('Informe o nome do campeonato.');
    const { error } = await createClient()
      .from('campeonatos')
      .update({ nome: f.nome.trim(), ano: f.ano, categoria: f.categoria.trim() || null, modalidade: f.modalidade || null, status: f.status })
      .eq('id', campeonato.id);
    setMsg(error ? `Não consegui salvar: ${error.message}` : 'Dados salvos.');
    if (!error) onMudou();
  }

  async function usarEscudo(png: Blob) {
    const r = await enviarEscudo('campeonatos', campeonato.id, png);
    setArquivo(null);
    if (!r.ok) return setMsg(r.erro);
    setLogo(r.url);
    setMsg('Escudo atualizado.');
    onMudou();
  }

  return (
    <div className="grid gap-4">
      <label className={ROTULO}>
        Nome do campeonato
        <input className={CAMPO} value={f.nome} maxLength={80} onChange={(e) => setF({ ...f, nome: e.target.value })} />
      </label>
      <div className="grid gap-4 sm:grid-cols-4">
        <label className={ROTULO}>
          Ano
          <input type="number" className={CAMPO} value={f.ano} onChange={(e) => setF({ ...f, ano: Number(e.target.value) || f.ano })} />
        </label>
        <label className={ROTULO}>
          Categoria
          <input className={CAMPO} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} />
        </label>
        <label className={ROTULO}>
          Modalidade
          <select className={CAMPO} value={f.modalidade} onChange={(e) => setF({ ...f, modalidade: e.target.value })}>
            <option value="">-</option>
            {modalidades.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label className={ROTULO}>
          Situação
          <select className={CAMPO} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {SITUACOES.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" className="btn-forte w-fit" onClick={salvar}>
        Salvar dados
      </button>

      <div className="grid gap-3 border-t border-av-linha pt-4">
        <div className="flex items-center gap-4">
          <EscudoCampeonato campeonato={{ nome: f.nome, logo_url: logo }} tamanho={96} />
          <label className={ROTULO}>
            Trocar o escudo do campeonato
            <input type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {arquivo && <EnquadrarImagem key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`} arquivo={arquivo} onPronto={usarEscudo} textoBotao="Usar este escudo" />}
      </div>
      {msg && (
        <p role="status" className="text-sm text-av-amarelo">
          {msg}
        </p>
      )}
    </div>
  );
}
