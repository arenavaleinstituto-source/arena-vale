import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Arena Vale Sports',
  description: 'Saiba como a Arena Vale coleta, usa e protege os seus dados pessoais e de navegação.',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-[#cad0e0] selection:bg-[#e50914] selection:text-white font-sans">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
          </Link>
          <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition">
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO DA POLÍTICA */}
      <main className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        <div className="border-b border-white/10 pb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4">DOCUMENTO OFICIAL</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">Política de Privacidade</h1>
          <p className="text-xs font-mono text-[#8a92a6]">Última atualização: 22 de outubro de 2026</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#b8c0d4]">
          <p>A Arena Vale, inscrita sob o CNPJ 40.694.741/0001-34, respeita a privacidade dos usuários do site, do aplicativo e dos canais de atendimento (incluindo WhatsApp) relacionados aos nossos campeonatos, transmissões e serviços esportivos. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos os dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>
          <p>Ao utilizar nosso site, aplicativo ou entrar em contato pelos nossos canais, você concorda com os termos descritos nesta política.</p>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 1. Quem somos</h2>
            <p>Arena Vale é uma plataforma de gestão e cobertura de campeonatos esportivos regionais (futsal, futebol 7, basquete e vôlei), responsável por transmissões ao vivo, organização de competições, gestão de equipes e relacionamento com patrocinadores e criação de projetos sociais.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 2. Quais dados coletamos</h2>
            <p className="mb-2">Dependendo de como você interage conosco, podemos coletar:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li><strong className="text-[#cad0e0]">Dados de identificação:</strong> nome completo, data de nascimento, e-mail, telefone/WhatsApp</li>
              <li><strong className="text-[#cad0e0]">Dados de atletas e equipes:</strong> time, categoria, posição, estatísticas de jogo, fotos e vídeos de partidas</li>
              <li><strong className="text-[#cad0e0]">Dados de responsáveis</strong> (para atletas menores de idade, na Escolinha): nome do responsável, CPF, endereço, dados de contato</li>
              <li><strong className="text-[#cad0e0]">Dados financeiros:</strong> informações de pagamento de mensalidades e inscrições (processadas via chave PIX ou meios de pagamento informados; não armazenamos dados completos de cartão de crédito)</li>
              <li><strong className="text-[#cad0e0]">Dados de navegação:</strong> endereço IP, tipo de dispositivo, páginas visitadas, cookies e identificadores semelhantes</li>
              <li><strong className="text-[#cad0e0]">Comunicações:</strong> mensagens trocadas pelo WhatsApp ou formulários do site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 3. Para que usamos seus dados</h2>
            <p className="mb-2">Utilizamos os dados coletados para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Organizar campeonatos, jogos, inscrições de equipes e escalações</li>
              <li>Emitir cobranças de mensalidades e controlar pagamentos</li>
              <li>Divulgar resultados, estatísticas, tabelas de classificação e conteúdo de atletas em destaque</li>
              <li>Transmitir jogos ao vivo e produzir conteúdo de cobertura esportiva</li>
              <li>Entrar em contato sobre jogos, convocações, cobranças ou oportunidades de patrocínio</li>
              <li>Cumprir obrigações legais e regulatórias aplicáveis a eventos esportivos</li>
