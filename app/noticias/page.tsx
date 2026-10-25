'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NoticiasPage() {
  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Comunicado Oficial');
  const [selo, setSelo] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [conteudo, setConteudo] = useState('');
  
  // Estados do sistema (loading e mensagens)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estados da tabela de notícias
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);

  const supabase = createClient();

  // Função 1: Buscar as notícias para a grelha
  const fetchNoticias = async () => {
    setLoadingLista(true);
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNoticias(data);
    }
    setLoadingLista(false);
  };

  // Carregar a lista assim que a página abre
  useEffect(() => {
    fetchNoticias();
  }, []);

  // Função 2: Gravar a nova notícia
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let imagem_url = null;

    // A. Enviar a imagem para o Storage (se selecionada)
    if (imagem) {
      const fileExt = imagem.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('noticias-capas')
        .upload(filePath, imagem);

      if (uploadError) {
        setMessage({ type: 'error', text: 'Erro ao enviar a imagem. Confirme se a imagem não é muito grande.' });
        setLoading(false);
        return;
      }

      // Obter o link público da imagem enviada
      const { data: publicUrlData } = supabase.storage
        .from('noticias-capas')
        .getPublicUrl(filePath);
        
      imagem_url = publicUrlData.publicUrl;
    }

    // B. Gravar os dados na tabela do banco de dados
    const { error } = await supabase
      .from('noticias')
      .insert([
        {
          titulo,
          categoria,
          selo,
          conteudo,
          imagem_url,
        }
      ]);

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Não consegui salvar a notícia no banco de dados.' });
    } else {
      setMessage({ type: 'success', text: '✔ Notícia publicada com sucesso! Já está salva no banco e visível no site.' });
      
      // Limpar formulário após sucesso
      setTitulo('');
      setSelo('');
      setConteudo('');
      setImagem(null);
      
      // Atualizar a tabela automaticamente!
      fetchNoticias();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070b13] p-8 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link href="/painel" className="text-[#d4af37] text-sm font-bold uppercase hover:underline mb-4 inline-block">
            ← Voltar ao Centro de Comando
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-wider">Publicar Notícias & Comunicados</h1>
          <p className="text-[#8a92a6] mt-2 text-sm">
            Lance notas oficiais, convocações de arbitragem e novidades do portal. Tudo que você publicar aqui aparece direto no site, pra todo mundo.
          </p>
        </div>

        {/* Zona do Formulário */}
        <div className="bg-[#101726] border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
          <form onSubmit={handlePublicar} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Título da Notícia</label>
                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Definidas as datas da semifinal da Copa Regional" className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition text-sm appearance-none">
                  <option value="Comunicado Oficial">Comunicado Oficial</option>
                  <option value="Campeonatos">Campeonatos</option>
                  <option value="Arbitragem">Arbitragem</option>
                  <option value="Parceria">Parceria</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Selo (Tag pequena ao lado da categoria)</label>
              <input type="text" value={selo} onChange={(e) => setSelo(e.target.value)} placeholder="NOVO" className="w-full md:w-1/2 bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Imagem de Capa (Banner Destaque)</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#d4af37] transition bg-[#070b13]">
                <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files ? e.target.files[0] : null)} className="hidden" id="upload-capa" />
                <label htmlFor="upload-capa" className="cursor-pointer flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">📷</span>
                  <p className="text-sm font-bold text-[#d4af37] hover:underline">Clique para enviar a imagem</p>
                  <p className="text-xs text-[#8a92a6] mt-1">{imagem ? imagem.name : 'Formatos suportados: PNG, JPG ou WEBP (Recomendado 16:9)'}</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#cad0e0] uppercase mb-2">Conteúdo do Comunicado</label>
              <textarea required rows={6} value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Escreva os detalhes da notícia, escalas ou notas oficiais..." className="w-full bg-[#070b13] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition text-sm resize-y"></textarea>
            </div>

            {/* Mensagem de Sucesso ou Erro */}
            {message && (
              <div className={`p-4 rounded-lg font-bold text-sm border ${message.type === 'success' ? 'bg-[#070b13] border-[#d4af37] text-[#d4af37]' : 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]'}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-fit bg-[#d4af37] hover:bg-[#b5952f] text-[#070b13] font-black uppercase tracking-wider px-8 py-3 rounded-lg transition disabled:opacity-50 mt-2">
              {loading ? 'A Publicar...' : 'Publicar Notícia'}
            </button>
          </form>
        </div>

        {/* NOVA ZONA: Tabela de Notícias Publicadas */}
        <div className="bg-[#101726] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#d4af37] mb-6 uppercase border-b border-white/10 pb-4">Últimas Publicações</h2>
          
          {loadingLista ? (
            <div className="text-center py-8 text-[#8a92a6]">A carregar comunicados do banco de dados...</div>
          ) : noticias.length === 0 ? (
            <div className="text-center py-8 text-[#8a92a6]">Nenhuma notícia registada ainda. O painel está vazio.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase text-[#8a92a6]">
                    <th className="py-3 px-4 font-bold">Título</th>
                    <th className="py-3 px-4 font-bold">Categoria</th>
                    <th className="py-3 px-4 font-bold">Data de Publicação</th>
                  </tr>
                </thead>
                <tbody>
                  {noticias.map((nota) => (
                    <tr key={nota.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-bold text-white">{nota.titulo}</td>
                      <td className="py-4 px-4">
                        <span className="bg-[#070b13] border border-white/10 text-[#d4af37] text-xs px-2 py-1 rounded font-bold uppercase">
                          {nota.categoria}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#8a92a6]">
                        {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
