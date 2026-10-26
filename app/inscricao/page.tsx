'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Atleta {
  nome: string;
  camisa: string;
  posicao: string;
  documento: string;
}

export default function InscricaoPage() {
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [modalidade, setModalidade] = useState('Futsal');
  const [categoria, setCategoria] = useState('Livre / Adulto');
  const [cidade, setCidade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [documentoResponsavel, setDocumentoResponsavel] = useState('');
  const [termoAceito, setTermoAceito] = useState(false);

  const [atletas, setAtletas] = useState<Atleta[]>([
    { nome: '', camisa: '', posicao: '', documento: '' }
  ]);

  const adicionarAtleta = () => {
    setAtletas([...atletas, { nome: '', camisa: '', posicao: '', documento: '' }]);
  };

  const removerAtleta = (index: number) => {
    if (atletas.length > 1) {
      setAtletas(atletas.filter((_, i) => i !== index));
    }
  };

  const atualizarAtleta = (index: number, campo: keyof Atleta, valor: string) => {
    const novaLista = [...atletas];
    novaLista[index][campo] = valor;
    setAtletas(novaLista);
  };

  const handleEnviarInscricao = (e: React.FormEvent) => {
    e.preventDefault();

    if (!termoAceito) {
      alert('É obrigatório ler e aceitar o Termo de Responsabilidade e Cessão de Imagem para prosseguir.');
      return;
    }

    const dataHoraRegistro = new Date().toLocaleString('pt-BR');

    let texto = `*INSCRIÇÃO OFICIAL · ARENA VALE*\n`;
    texto += `*CNPJ Organizador:* 40.694.741/0001-34\n`;
    texto += `------------------------------------\n`;
    texto += `*Equipa:* ${nomeEquipe}\n`;
    texto += `*Modalidade:* ${modalidade}\n`;
    texto += `*Categoria:* ${categoria}\n`;
    texto += `*Cidade/Região:* ${cidade}\n`;
    texto += `*Responsável pelo Registo:* ${responsavel}\n`;
    texto += `*Documento (CPF/RG):* ${documentoResponsavel}\n`;
    texto += `*Data/Hora do Registo:* ${dataHoraRegistro}\n`;
    texto += `------------------------------------\n`;
    texto += `*TERMO DE DIREITO DE IMAGEM: ACEITE CONFIRMADO*\n`;
    texto += `O responsável declara possuir a autorização prévia de todos os atletas para transmissão, fotos e divulgação oficial na plataforma Arena Vale (CNPJ 40.694.741/0001-34).\n`;
    texto += `------------------------------------\n`;
    texto += `*ELENCO DE ATLETAS (${atletas.length}):*\n`;

    atletas.forEach((atleta, idx) => {
      if (atleta.nome.trim()) {
        texto += `${idx + 1}. ${atleta.nome.toUpperCase()} | Nº: ${atleta.camisa || 'S/N'} | Pos: ${atleta.posicao || 'N/I'} | Doc: ${atleta.documento || 'Pendente'}\n`;
      }
    });

    const linkWhatsapp = `https://wa.me/5547988444404?text=${encodeURIComponent(texto)}`;
    window.open(linkWhatsapp, '_blank');
  };

  return (<div className="min-h-screen bg-[#0b0d12] text-white selection:bg-[#e50914] selection:text-white"><header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/" className="flex items-center gap-2"><img src="/logo.png" alt="Arena Vale" className="h-14 sm:h-16 w-auto object-contain" /></Link><Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#a0a8be] hover:border-white/40 hover:text-white transition">← Voltar ao Início</Link></div></header><main className="mx-auto max-w-5xl px-6 py-12"><div className="mb-10 text-center"><span className="rounded-full bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#e50914]">Ficha Oficial de Cadastro</span><h1 className="mt-4 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">Inscrição de Equipa & Atletas</h1><p className="mt-3 text-sm text-[#8a92a6] max-w-2xl mx-auto">Preencha os dados oficiais da agremiação, o elenco de atletas e confirme o termo de responsabilidade de imagens perante a Arena Vale (CNPJ 40.694.741/0001-34).</p></div><form onSubmit={handleEnviarInscricao} className="space-y-8"><div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl"><h2 className="text-lg font-black uppercase tracking-wider text-[#e50914] mb-6 flex items-center gap-2"><span>⚽</span> 1. Dados da Agremiação & Modalidade</h2><div className="grid gap-5 sm:grid-cols-2"><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Nome da Equipa / Clube *</label><input type="text" required placeholder="Ex: Fênix Futsal Blumenau" value={nomeEquipe} onChange={(e) => setNomeEquipe(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Modalidade *</label><select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none"><option value="Futsal">Futsal</option><option value="Basquetebol">Basquetebol</option><option value="Futebol 7">Futebol 7</option><option value="Voleibol">Voleibol</option></select></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Categoria *</label><input type="text" required placeholder="Ex: Livre, Veteranos, Sub-17" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Cidade / Município *</label><input type="text" required placeholder="Ex: Blumenau / SC" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div></div></div><div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl"><h2 className="text-lg font-black uppercase tracking-wider text-[#e50914] mb-6 flex items-center gap-2"><span>👤</span> 2. Responsável pelo Registo (Capitão / Dirigente)</h2><div className="grid gap-5 sm:grid-cols-2"><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Nome Completo do Responsável *</label><input type="text" required placeholder="Nome do Capitão ou Dirigente" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a92a6] mb-2">Documento (CPF ou RG) *</label><input type="text" required placeholder="000.000.000-00" value={documentoResponsavel} onChange={(e) => setDocumentoResponsavel(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#0b0d12] px-4 py-3 text-sm text-white focus:border-[#e50914] focus:outline-none" /></div></div></div><div className="rounded-[2rem] border border-white/10 bg-[#13161f] p-6 sm:p-8 shadow-xl"><div className="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h2 className="text-lg font-black uppercase tracking-wider text-[#e50914] flex items-center gap-2"><span>📋</span> 3. Elenco de Atletas Inscritos</h2><p className="text-xs text-[#8a92a6] mt-1">Registe o nome, número de camisola e documento de cada integrante.</p></div><button type="button" onClick={adicionarAtleta} className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition">+ Adicionar Atleta</button></div><div className="space-y-3">{atletas.map((atleta, index) => (<div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-xl border border-white/5 bg-[#0b0d12] p-3 text-xs"><div className="sm:col-span-1 text-center font-black text-[#8a92a6]">#{index + 1}</div><div className="sm:col-span-4"><input type="text" required placeholder="Nome completo do atleta *" value={atleta.nome} onChange={(e) => atualizarAtleta(index, 'nome', e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#13161f] px-3 py-2 text-white placeholder:text-[#555d6e] focus:border-[#e50914] focus:outline-none" /></div><div className="sm:col-span-2"><input type="text" placeholder="Nº Camisola" value={atleta.camisa} onChange={(e) => atualizarAtleta(index, 'camisa', e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#13161f] px-3 py-2 text-white placeholder:text-[#555d6e] focus:border-[#e50914] focus:outline-none" /></div><div className="sm:col-span-2"><input type="text" placeholder="Posição" value={atleta.posicao} onChange={(e) => atualizarAtleta(index, 'posicao', e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#13161f] px-3 py-2 text-white placeholder:text-[#555d6e] focus:border-[#e50914] focus:outline-none" /></div><div className="sm:col-span-2"><input type="text" placeholder="Doc (RG/CPF)" value={atleta.documento} onChange={(e) => atualizarAtleta(index, 'documento', e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#13161f] px-3 py-2 text-white placeholder:text-[#555d6e] focus:border-[#e50914] focus:outline-none" /></div><div className="sm:col-span-1 text-center">{atletas.length > 1 && (<button type="button" onClick={() => removerAtleta(index)} className="text-red-400 hover:text-red-300 font-black text-sm" title="Remover atleta">✕</button>)}</div></div>))}</div></div><div className="rounded-[2rem] border border-[#e50914]/40 bg-[#181114] p-6 sm:p-8 shadow-2xl"><div className="flex items-center gap-3 mb-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e50914]/20 text-[#e50914] text-lg font-black">⚖️</span><div><h3 className="text-base font-black uppercase tracking-wider text-white">Termo de Responsabilidade & Autorização de Direito de Imagem</h3><p className="text-[11px] text-[#8a92a6]">Adesão formal perante a ARENA VALE (CNPJ: 40.694.741/0001-34).</p></div></div><div className="rounded-xl border border-white/10 bg-[#0b0d12]/80 p-4 text-xs text-[#cad0e0] leading-relaxed max-h-48 overflow-y-auto space-y-2 mb-6"><p><strong>1. DECLARAÇÃO DE RESPONSABILIDADE:</strong> Na qualidade de representante, capitão ou dirigente da agremiação acima qualificada, declaro sob as penas da lei que todas as informações e dados dos atletas aqui inseridos são verídicos e de minha inteira responsabilidade perante a entidade mantenedora ARENA VALE (inscrita sob o CNPJ 40.694.741/0001-34).</p><p><strong>2. AUTORIZAÇÃO DE DIREITO DE IMAGEM E VOZ:</strong> Declaro que possuo a expressa e prévia anuência de todos os atletas e membros inscritos (bem como dos respetivos responsáveis legais, no caso de atletas menores de idade) para que as suas imagens, nomes, vozes e desempenhos desportivos sejam captados, fotografados, filmados, reproduzidos e transmitidos em direto ou gravados pela plataforma ARENA VALE e seus canais multimédia (website, YouTube, redes sociais e parceiros institucionais).</p><p><strong>3. FINALIDADE E GRATUIDADE:</strong> A cessão e divulgação destas imagens é concedida a título gratuito, em âmbito universal, para fins informativos, desportivos, de entretenimento, divulgação institucional dos campeonatos e valorização dos atletas em destaque.</p><p><strong>4. ISENÇÃO:</strong> Isento a plataforma Arena Vale (CNPJ 40.694.741/0001-34), seus gestores, moderadores, entidades parceiras e patrocinadores de qualquer encargo financeiro ou responsabilidade judicial/extrajudicial oriunda do uso legítimo das imagens e dados fornecidos neste formulário.</p></div><label className="flex items-start gap-3 cursor-pointer select-none"><input type="checkbox" required checked={termoAceito} onChange={(e) => setTermoAceito(e.target.checked)} className="mt-1 h-5 w-5 rounded border-white/20 bg-[#0b0d12] text-[#e50914] focus:ring-[#e50914] focus:ring-offset-0 cursor-pointer" /><span className="text-xs text-white font-bold leading-normal">Li, compreendi e concordo integralmente com os termos acima. Declaro ter autorização de todos os atletas relacionados para o uso e divulgação de suas imagens na plataforma Arena Vale (CNPJ 40.694.741/0001-34). *</span></label></div><div className="text-center pt-4"><button type="submit" className="w-full sm:w-auto min-w-[320px] rounded-full bg-[#e50914] px-10 py-4 text-sm font-black uppercase tracking-wider text-white shadow-2xl shadow-[#e50914]/40 hover:bg-[#ff1e27] hover:scale-105 transition">Confirmar Inscrição & Enviar para Homologação →</button><p className="mt-3 text-[11px] text-[#8a92a6]">Ao submeter, o registo formal e o termo assinado digitalmente serão transmitidos à coordenação da Arena Vale.</p></div></form></main><footer className="border-t border-white/10 bg-[#07080b] py-8 text-center text-xs text-[#8a92a6]">© 2026 Arena Vale · CNPJ: 40.694.741/0001-34 · Todos os direitos reservados.</footer></div>);
}
