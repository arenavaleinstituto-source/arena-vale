'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  buscarDestaques,
  formatarDataBR,
  imagemDestaque,
  MODALIDADES,
  type Destaque,
} from '@/lib/content';

/**
 * PAINEL — Gestão de Atletas em Destaque
 *
 * ⚠️ CORREÇÃO CRÍTICA DE SCHEMA
 * Este painel gravava em `nome`, `modalidade`, `equipe`, `destaque_texto` e
 * `imagem_url` — NENHUMA dessas colunas existe na tabela `atletas_destaque`
 * de produção. As colunas reais são:
 *     id, foto_url, atleta_nome, time_nome, campeonato_nome,
 *     ativo, ordem, created_at, created_by
 * Ou seja: publicar um atleta por aqui falhava com erro do PostgREST, e a
 * galeria pública (que lia as mesmas colunas inexistentes) nunca mostrava
 * os atletas publicados.
 *
 * Agora este painel grava nas colunas REAIS e usa o mesmo mapeamento
 * canônico do site público (`mapearDestaque`).
 */
export default function PainelAtletasDestaque() {
  const [atletas, setAtletas] = useState<Destaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do formulário de cadastro
  const [atletaNome, setAtletaNome] = useState('');
  const [timeNome, setTimeNome] = useState('');
  const [campeonatoNome, setCampeonatoNome] = useState('');
  const [modalidade, setModalidade] = useState<string>('FUTSAL');
  const [jogos, setJogos] = useState('');
  const [golsOuPontos, setGolsOuPontos] = useState('');
  const [assistencias, setAssistencias] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregarAtletas() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { destaques, erro: erroLeitura } = await buscarDestaques(supabase, {
        incluirInativos: true,
      });

      if (erroLeitura) {
        setErro(erroLeitura);
        setAtletas([]);
      } else {
        setAtletas(destaques);
      }
    } catch (err: any) {
      setErro(err?.message || 'Erro ao carregar atletas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAtletas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSalvarAtleta(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('atletas_destaque').insert([
        {
          // Colunas REAIS da tabela.
          atleta_nome: atletaNome.trim(),
          time_nome: timeNome.trim(),
          campeonato_nome: campeonatoNome.trim(),
          modalidade: modalidade.trim(),
          jogos: jogos.trim() || null,
          gols_ou_pontos: golsOuPontos.trim() || null,
          assistencias: assistencias.trim() || null,
          ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 1,
          ativo,
        },
      ]);

      if (error) {
        setErro(error.message);
      } else {
        // Limpar formulário e recarregar lista
        setAtletaNome('');
        setTimeNome('');
        setCampeonatoNome('');
        setJogos('');
        setGolsOuPontos('');
        setAssistencias('');
        setOrdem((atual) => atual + 1);
        setAtivo(true);
        await carregarAtletas();
      }
    } catch (err: any) {
      setErro(err?.message || 'Erro ao guardar atleta.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlternarAtivo(id: string, proximo: boolean) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('atletas_destaque')
        .update({ ativo: proximo })
        .eq('id', id);
      if (error) throw error;
      setAtletas((lista) => lista.map((a) => (a.id === id ? { ...a, ativo: proximo } : a)));
    } catch (err: any) {
      setErro(err?.message || 'Erro ao alterar a situação do atleta.');
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja remover este atleta?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('atletas_destaque').delete().eq('id', id);
      if (error) {
        setErro(error.message);
      } else {
        setAtletas((lista) => lista.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      setErro(err?.message || 'Erro ao excluir atleta.');
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              CENTRO DE COMANDO
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
              Gestão de Atletas em Destaque
            </h1>
          </div>
          <Link
            href="/painel"
            className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition"
          >
            ← Voltar ao Painel
          </Link>
        </div>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase">
            {erro}
          </div>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-[#11141d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl mb-12">
          <h2 className="text-xl font-black uppercase tracking-wide mb-6 text-amber-400">
            Adicionar Novo Atleta
          </h2>

          <form onSubmit={handleSalvarAtleta} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Nome do Atleta
              </label>
              <input
                type="text"
                value={atletaNome}
                onChange={(e) => setAtletaNome(e.target.value)}
                placeholder="Ex: Matheus Silva"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Equipe
              </label>
              <input
                type="text"
                value={timeNome}
                onChange={(e) => setTimeNome(e.target.value)}
                placeholder="Ex: Vale FC"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Campeonato
              </label>
              <input
                type="text"
                value={campeonatoNome}
                onChange={(e) => setCampeonatoNome(e.target.value)}
                placeholder="Ex: Copa Arena Vale de Futsal 2026"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Modalidade
              </label>
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Jogos
                </label>
                <input
                  type="text"
                  value={jogos}
                  onChange={(e) => setJogos(e.target.value)}
                  placeholder="12"
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Gols / Pontos
                </label>
                <input
                  type="text"
                  value={golsOuPontos}
                  onChange={(e) => setGolsOuPontos(e.target.value)}
                  placeholder="18 Gols"
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Assistências
                </label>
                <input
                  type="text"
                  value={assistencias}
                  onChange={(e) => setAssistencias(e.target.value)}
                  placeholder="9"
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Posição na galeria
              </label>
              <input
                type="number"
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value))}
                min={1}
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4 rounded border-white/15 bg-[#07080c] text-amber-400 focus:ring-0"
              />
              <label
                htmlFor="ativo"
                className="text-xs font-black uppercase tracking-wider text-slate-300"
              >
                Atleta ativo (visível no site público)
              </label>
            </div>

            <div className="sm:col-span-2 pt-4">
              <button
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#07080c] font-black uppercase text-xs tracking-widest rounded-full transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {salvando ? 'A guardar...' : '+ Publicar Atleta em Destaque'}
              </button>
            </div>
          </form>
        </div>

        {/* LISTA DE ATLETAS CADASTRADOS */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide mb-6">Atletas Cadastrados</h2>

          {loading ? (
            <p className="text-sm text-slate-400">A carregar atletas...</p>
          ) : atletas.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum atleta cadastrado até o momento.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {atletas.map((atleta) => (
                <div
                  key={atleta.id}
                  className="bg-[#11141d] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagemDestaque(atleta)}
                    alt={atleta.nome}
                    className="w-full h-28 object-cover rounded-xl mb-4 border border-white/5"
                  />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                        {atleta.modalidade}
                      </span>
                      {/* BUG CORRIGIDO: usava o estado do formulário (`ativo`),
                          e não o do atleta — todos os cards mostravam o mesmo
                          status. */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          atleta.ativo
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {atleta.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black uppercase text-white">{atleta.nome}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                      {atleta.equipe}
                    </p>
                    {atleta.campeonato && (
                      <p className="text-xs text-slate-300 mt-3 italic">“{atleta.campeonato}”</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-2 uppercase">
                      Posição {atleta.ordem} · {formatarDataBR(atleta.created_at)}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAlternarAtivo(atleta.id, !atleta.ativo)}
                      className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase transition"
                    >
                      {atleta.ativo ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluir(atleta.id)}
                      className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
