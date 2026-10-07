'use client';

import { useState, useEffect } from 'react';

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
    imagem: 'https://0zjmezlsxvwtj.space.minimax.io/atleta-1.png'
  },
  {
    id: '2',
    nome: 'João Santos',
    categoria: 'FUTEBOL',
    equipe: 'AMIGOS FC',
    campeonato: 'LIGA BLUMENAU 2026',
    imagem: 'https://0zjmezlsxvwtj.space.minimax.io/atleta-2.png'
  },
  {
    id: '3',
    nome: 'Ana Oliveira',
    categoria: 'VÔLEI',
    equipe: 'RESENHA FC',
    campeonato: 'SUPERCOPA VALE 2026',
    imagem: 'https://0zjmezlsxvwtj.space.minimax.io/atleta-3.png'
  }
];

export default function GestaoAtletasClient() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [equipe, setEquipe] = useState('');
  const [campeonato, setCampeonato] = useState('');
  const [imagemPreview, setImagemPreview] = useState('');
  const [urlImagem, setUrlImagem] = useState('');

  useEffect(() => {
    const salvos = localStorage.getItem('arena_vale_atletas');
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
    localStorage.setItem('arena_vale_atletas', JSON.stringify(novaLista));
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
      alert('Preencha todos os campos e anexe a foto do atleta.');
      return;
    }

    const novoAtleta: Atleta = {
      id: Date.now().toString(),
      nome,
      categoria: categoria.toUpperCase(),
      equipe,
      campeonato,
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
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#d4a849]/20 px-2 py-0.5 text-xs font-bold text-[#d4a849]">
                🔒 ÁREA RESTRITA DO COORDENADOR
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase text-white">Gerenciar Atletas em Destaque</h1>
            <p className="text-sm text-[#a8b4cc]">Adicione e remova atletas, equipes, modalidades e campeonatos.</p>
          </div>
          <a
            href="/coordenador"
            className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold transition hover:bg-white/10"
          >
            ← Voltar ao Painel
          </a>
        </div>

        <section className="mb-12 rounded-3xl border border-white/10 bg-[#0e2148] p-6 sm:p-8">
          <h2 className="text-xl font-black uppercase text-[#d4a849]">Novo Atleta Destaque</h2>

          <form onSubmit={handleAdicionar} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#a8b4cc]">NOME COMPLETO</label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#a8b4cc]">MODALIDADE / CATEGORIA</label>
              <input
                type="text"
                placeholder="Ex: FUTEBOL, VÔLEI, FUNDADOR..."
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#a8b4cc]">EQUIPE / CLUBE</label>
              <input
                type="text"
                placeholder="Ex: ARENA VALE SPORTS"
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-[#d4a849]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#a8b4cc]">CAMPEONATO</label>
              <input
                type="text"
                placeholder="Ex: COPA ARENA VALE 2026"
                value={campeonato}
                onChange={(e) => setCampeonato(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-[#d4a849]"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-xs font-bold text-[#a8b4cc]">FOTO DO ATLETA (UPLOAD OU LINK)</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadArquivo}
                  className="w-full rounded-xl border border-white/10 bg-[#071426] px-3 py-2 text-xs text-[#a8b4cc] file:mr-3 file:rounded-lg file:border-0 file:bg-[#d4a849] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#071426]"
                />
                <input
                  type="url"
                  placeholder="Ou cole a URL da imagem (https://...)"
                  value={urlImagem}
                  onChange={(e) => {
                    setUrlImagem(e.target.value);
                    setImagemPreview('');
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-[#d4a849]"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#d4a849] py-3.5 text-sm font-black uppercase text-[#071426] transition hover:bg-[#e0b75a]"
              >
                + Adicionar Destaque
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-black uppercase">Atletas Cadastrados ({atletas.length})</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {atletas.map((atleta) => (
              <article
                key={atleta.id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#10275a] shadow-lg transition hover:border-[#d4a849]/50"
              >
                <div>
                  <div className="h-56 w-full bg-[#071426]">
                    <img src={atleta.imagem} alt={atleta.nome} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-[#d4a849]">⭐ {atleta.categoria}</span>
                    <h3 className="mt-2 text-xl font-black leading-tight text-white">{atleta.nome}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#a8b4cc]">{atleta.equipe}</p>
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#071426]/60 px-2.5 py-1.5 text-xs text-[#d4a849]">
                      <span>🏆</span>
                      <span className="truncate font-semibold">{atleta.campeonato || 'Campeonato Geral'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleExcluir(atleta.id)}
                    className="mt-3 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
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
