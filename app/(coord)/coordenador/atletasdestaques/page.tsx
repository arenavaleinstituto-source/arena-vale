'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Atleta {
  id: string;
  nome: string;
  categoria: string;
  equipe: string;
  campeonato: string;
  imagem: string;
}

const ATLETAS_PADRAO: Atleta[] = [
  {
    id: '1',
    nome: 'Maurício Miranda',
    categoria: 'FUNDADOR',
    equipe: 'ARENA VALE SPORTS',
    campeonato: 'COPA ARENA VALE 2026',
    imagem: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    nome: 'João Santos',
    categoria: 'FUTEBOL',
    equipe: 'AMIGOS FC',
    campeonato: 'LIGA BLUMENAU 2026',
    imagem: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    nome: 'Ana Oliveira',
    categoria: 'VÔLEI',
    equipe: 'RESENHA FC',
    campeonato: 'SUPERCOPA VALE 2026',
    imagem: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80'
  }
];

export default function GerenciarAtletasDestaques() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [equipe, setEquipe] = useState('');
  const [campeonato, setCampeonato] = useState('');
  const [imagemPreview, setImagemPreview] = useState('');
  const [urlImagem, setUrlImagem] = useState('');

  useEffect(() => {
    const salvos = typeof window !== 'undefined' ? localStorage.getItem('arena_vale_atletas') : null;
    if (salvos) {
      try {
        setAtletas(JSON.parse(salvos));
      } catch {
        setAtletas(ATLETAS_PADRAO);
      }
    } else {
      setAtletas(ATLETAS_PADRAO);
    }
  }, []);

  const salvarLista = (novaLista: Atleta[]) => {
    setAtletas(novaLista);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arena_vale_atletas', JSON.stringify(novaLista));
    }
  };

  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
        setUrlImagem('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    const fotoFinal = imagemPreview || urlImagem;

    if (!nome.trim() || !categoria.trim() || !equipe.trim() || !campeonato.trim() || !fotoFinal) {
      alert('Preencha todos os campos e adicione a imagem do atleta.');
      return;
    }

    const novoAtleta: Atleta = {
      id: Date.now().toString(),
      nome: nome.trim(),
      categoria: categoria.trim().toUpperCase(),
      equipe: equipe.trim(),
      campeonato: campeonato.trim(),
      imagem: fotoFinal
    };

    const atualizados = [novoAtleta, ...atletas];
    salvarLista(atualizados);

    setNome('');
    setCategoria('');
    setEquipe('');
    setCampeonato('');
    setImagemPreview('');
    setUrlImagem('');
  };

  const handleExcluir = (id: string) => {
    if (confirm('Deseja realmente excluir este atleta em destaque?')) {
      const atualizados = atletas.filter((a) => a.id !== id);
      salvarLista(atualizados);
    }
  };

  return (
    <div className="min-h-screen bg-[#071426] p-6 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Topo */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#d4a849]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d4a849]">
              🔒 ÁREA RESTRITA DO COORDENADOR
            </span>
            <h1 className="mt-3 text-3xl font-black uppercase text-white sm:text-4xl">
              GERENCIAR ATLETAS EM DESTAQUE
            </h1>
            <p className="mt-1 text-sm text-[#a8b4cc]">
              Adicione e remova atletas, equipes, modalidades e campeonatos.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
          >
            ← Voltar ao Início
          </Link>
        </div>

        {/* Formulário Novo Atleta */}
        <section className="mb-12 rounded-[2rem] border border-white/10 bg-[#0e2148] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-wide text-[#d4a849]">
            NOVO ATLETA DESTAQUE
          </h2>

          <form onSubmit={handleAdicionar} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#a8b4cc]">
                NOME COMPLETO
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#a8b4cc]">
                MODALIDADE / CATEGORIA
              </label>
              <input
                type="text"
                placeholder="Ex: FUTEBOL, VÔLEI, FUNDADOR..."
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#a8b4cc]">
                EQUIPE / CLUBE
              </label>
              <input
                type="text"
                placeholder="Ex: ARENA VALE SPORTS"
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#a8b4cc]">
                CAMPEONATO
              </label>
              <input
                type="text"
                placeholder="Ex: COPA ARENA VALE 2026"
                value={campeonato}
                onChange={(e) => setCampeonato(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#d4a849]"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#a8b4cc]">
                FOTO DO ATLETA (UPLOAD OU LINK)
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadArquivo}
                  className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-2.5 text-xs text-[#a8b4cc] file:mr-3 file:rounded-xl file:border-0 file:bg-[#d4a849] file:px-4 file:py-2 file:text-xs file:font-black file:text-[#071426]"
                />
                <input
                  type="url"
                  placeholder="Ou cole a URL da imagem (https://...)"
                  value={urlImagem}
                  onChange={(e) => {
                    setUrlImagem(e.target.value);
                    setImagemPreview('');
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-[#071426] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#d4a849]"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#d4a849] py-4 text-sm font-black uppercase tracking-wider text-[#071426] shadow-lg transition hover:bg-[#e0b75a]"
              >
                + ADICIONAR DESTAQUE
              </button>
            </div>
          </form>
        </section>

        {/* Lista de Atletas */}
        <section>
          <h2 className="mb-8 text-2xl font-black uppercase text-white">
            ATLETAS CADASTRADOS ({atletas.length})
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {atletas.map((atleta) => (
              <article
                key={atleta.id}
                className="flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e2148] shadow-xl"
              >
                <div>
                  <div className="h-60 w-full overflow-hidden bg-[#071426]">
                    <img
                      src={atleta.imagem}
                      alt={atleta.nome}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-[#d4a849]/15 px-3 py-1 text-xs font-black uppercase text-[#d4a849]">
                      ★ {atleta.categoria}
                    </span>
                    <h3 className="mt-3 text-2xl font-black text-white">{atleta.nome}</h3>
                    <p className="mt-1 text-sm font-bold text-[#a8b4cc]">{atleta.equipe}</p>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#071426]/70 px-3 py-2 text-xs text-[#d4a849]">
                      <span>🏆</span>
                      <span className="truncate font-bold uppercase">
                        {atleta.campeonato || 'Campeonato Geral'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleExcluir(atleta.id)}
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
                  >
                    🗑️ Excluir Atleta
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
