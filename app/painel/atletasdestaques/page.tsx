'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AtletaAdmin {
  id: string;
  nome: string;
  modalidade: string;
  equipe: string;
  destaque_texto: string;
  imagem_url: string;
  ativo: boolean;
}

export default function PainelAtletasDestaque() {
  const router = useRouter();
  const [atletas, setAtletas] = useState<AtletaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do formulário de cadastro/edição
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [equipe, setEquipe] = useState('');
  const [destaqueTexto, setDestaqueTexto] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    carregarAtletas();
  }, []);

  async function carregarAtletas() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('atletas_destaque')
        .select('*')
        .order('created_at', { ascending: false }); // Consulta corrigida e validada

      if (error) {
        setErro(error.message);
      } else if (data) {
        setAtletas(data);
      }
    } catch (err: any) {
      setErro('Erro ao carregar atletas.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarAtleta(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const { error } = await supabase.from('atletas_destaque').insert([
        {
          nome,
          modalidade,
          equipe,
          destaque_texto: destaqueTexto,
          imagem_url: imagemUrl || '/fundo-arena.jpg',
          ativo,
        },
      ]);

      if (error) {
        setErro(error.message);
      } else {
        // Limpar formulário e recarregar lista
        setNome('');
        setModalidade('');
        setEquipe('');
        setDestaqueTexto('');
        setImagemUrl('');
        setAtivo(true);
        carregarAtletas();
      }
    } catch (err: any) {
      setErro('Erro ao guardar atleta.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja remover este atleta?')) return;

    try {
      const { error } = await supabase.from('atletas_destaque').delete().eq('id', id);
      if (error) {
        setErro(error.message);
      } else {
        setAtletas(atletas.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      setErro('Erro ao excluir atleta.');
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">CENTRO DE COMANDO</span>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">Gestão de Atletas em Destaque</h1>
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
          <h2 className="text-xl font-black uppercase tracking-wide mb-6 text-amber-400">Adicionar Novo Atleta</h2>
          
          <form onSubmit={handleSalvarAtleta} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">Nome do Atleta</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Matheus Silva"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">Modalidade</label>
              <input
                type="text"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                placeholder="Ex: Futsal Adulto"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">Equipe</label>
              <input
                type="text"
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
                placeholder="Ex: Vale FC"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">Destaque / Conquista</label>
              <input
                type="text"
                value={destaqueTexto}
                onChange={(e) => setDestaqueTexto(e.target.value)}
                placeholder="Ex: Artilheiro da Temporada · 18 Golos"
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">URL da Imagem (Opcional)</label>
              <input
                type="text"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="/fundo-arena.jpg ou link direto"
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
              <label htmlFor="ativo" className="text-xs font-black uppercase tracking-wider text-slate-300">Atleta ativo (visível no site público)</label>
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
                <div key={atleta.id} className="bg-[#11141d] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                        {atleta.modalidade}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${atleta.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-white">{atleta.nome}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">{atleta.equipe}</p>
                    <p className="text-xs text-slate-300 mt-3 italic">“{atleta.destaque_texto}”</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end">
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
