'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function InscricaoPage() {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [modalidade, setModalidade] = useState('Futsal');
  const [posicao, setPosicao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');

    try {
      if (!nome || !posicao || !telefone) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Simulação de submissão da candidatura (ou ligação Supabase se configurada)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro ao submeter a inscrição.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#161922] to-[#0b0d12] shadow-inner transition group-hover:border-[#e50914]">
              <span className="text-sm font-black tracking-tighter text-white">
                <span className="text-[#e50914]">A</span>V
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              ARENA <span className="text-[#e50914]">VALE</span>
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#cad0e0] transition hover:border-white/40 hover:text-white"
          >
            ← Voltar ao Portal
          </Link>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL */}
      <main className="mx-auto w-full max-w-4xl px-6 py-12 flex-1">
        {/* Banner de Apresentação */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#161a24] to-[#0b0d12] p-8 sm:p-12 shadow-2xl mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/30 bg-[#e50914]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#e50914]">
            FAÇA PARTE DA PLATAFORMA
          </span>
          <h1 className="mt-4 text-3xl font-black uppercase sm:text-5xl leading-tight text-white">
            INSCRIÇÃO DE <br />
            <span className="text-[#e50914]">ATLETA DESTAQUE</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
            Registe o seu perfil para ganhar visibilidade nos campeonatos regionais, coberturas em direto e na galeria editorial da Arena Vale.
          </p>
        </div>

        {sucesso ? (
          <div className="rounded-[2.5rem] border border-emerald-500/30 bg-[#13161f] p-10 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-400">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">
              Inscrição Enviada com Sucesso!
            </h2>
            <p className="mt-3 text-sm text-[#8a92a6] max-w-md mx-auto">
              Os dados e fotografias foram registados. A equipa editorial da Arena Vale irá avaliar o perfil para inclusão na galeria oficial.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/coordenador/atletasdestaques"
                className="rounded-full bg-[#e50914] px-7 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#ff1e27]"
              >
                Ver Galeria de Atletas
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSucesso(false);
                  setNome('');
                  setPosicao('');
                  setTelefone('');
                  setBio('');
                  setFoto(null);
                  setFotoPreview(null);
                }}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Nova Inscrição
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#13161f] p-8 sm:p-12 shadow-2xl">
            {erro && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Lucas Ferreira"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              {/* Modalidade e Posição */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    Modalidade *
                  </label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  >
                    <option value="Futsal">Futsal</option>
                    <option value="Futebol 7">Futebol 7 (Society)</option>
                    <option value="Futebol de Campo">Futebol de Campo</option>
                    <option value="Voleibol">Voleibol</option>
                    <option value="Basquetebol">Basquetebol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    Posição / Função *
                  </label>
                  <input
                    type="text"
                    required
                    value={posicao}
                    onChange={(e) => setPosicao(e.target.value)}
                    placeholder="Ex: Ala / Fixo / Pivô"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              {/* Contacto e Cidade */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    WhatsApp / Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(47) 99999-9999"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                    Cidade / Região
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Blumenau - SC"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              {/* Upload de Fotografia do Atleta */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                  Fotografia de Perfil do Atleta
                </label>
                <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#0b0d12] p-6 transition hover:border-[#e50914]">
                  {fotoPreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={fotoPreview}
                        alt="Pré-visualização"
                        className="h-32 w-32 rounded-2xl object-cover border border-[#e50914] shadow-lg mb-3"
                      />
                      <label className="cursor-pointer text-xs font-bold text-[#e50914] hover:underline">
                        Trocar fotografia
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center">
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-xs font-bold text-white">Carregar fotografia do atleta</span>
                      <span className="mt-1 text-[11px] text-[#8a92a6]">PNG, JPG ou WEBP até 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Biografia / Conquistas */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#cad0e0]">
                  Histórico Esportivo / Conquistas
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre as suas equipas anteriores, títulos conquistados e metas na temporada..."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder-[#555d6e] outline-none transition focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-[#e50914] py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/25 transition hover:bg-[#ff1e27] hover:scale-[1.01] disabled:opacity-50"
              >
                {enviando ? 'Enviando Cadastro...' : 'Concluir e Enviar Inscrição'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* 3. RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#07080b] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#8a92a6]">
          <div>
            © 2026 Arena Vale · Mídia Esportiva. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white">Portal</Link>
            <Link href="/coordenador/atletasdestaques" className="hover:text-white">Atletas Destaques</Link>
            <Link href="/login" className="hover:text-white">Painel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
