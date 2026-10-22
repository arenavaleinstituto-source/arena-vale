'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-[#cad0e0] selection:bg-[#e50914] selection:text-white font-sans">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo 02.png" alt="Arena Vale" className="h-12 w-auto object-contain rounded-lg mix-blend-lighten" />
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
              <li>Melhorar nossos serviços e a experiência no site e aplicativo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 4. Base legal para o tratamento</h2>
            <p className="mb-2">Tratamos seus dados com base em uma ou mais das seguintes hipóteses previstas na LGPD:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Consentimento do titular (por exemplo, ao se cadastrar em um time ou na escolinha)</li>
              <li>Execução de contrato (prestação do serviço de organização esportiva)</li>
              <li>Cumprimento de obrigação legal ou regulatória</li>
              <li>Legítimo interesse, para fins como divulgação de resultados públicos de jogos e cobertura jornalística esportiva</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 5. Com quem compartilhamos seus dados</h2>
            <p className="mb-2">Não vendemos seus dados pessoais. Podemos compartilhar informações com:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6] mb-4">
              <li>Patrocinadores e parceiros institucionais, de forma agregada ou conforme autorização específica (ex: exposição de marca em transmissões)</li>
              <li>Prestadores de serviço que nos auxiliam (hospedagem, processamento de pagamento, envio de mensagens via WhatsApp Business)</li>
              <li>Autoridades públicas, quando exigido por lei, ordem judicial ou para proteção de direitos</li>
              <li>Federações e entidades esportivas, quando necessário para inscrição oficial de equipes em competições</li>
            </ul>
            <p>Resultados de jogos, estatísticas, fotos e vídeos de partidas têm natureza pública e podem ser divulgados nos canais oficiais da Arena Vale (site, aplicativo, redes sociais e transmissões).</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 6. Direito de imagem</h2>
            <p>O uso da imagem de atletas, técnicos, torcedores e demais pessoas retratadas em fotos, vídeos e transmissões da Arena Vale (cobertura de jogos, redes sociais e material de divulgação) pressupõe autorização prévia dessas pessoas. A responsabilidade por obter o consentimento de uso de imagem de cada atleta — ou de seu responsável legal, no caso de menores de idade — é da equipe/clube ao qual o atleta está vinculado, no momento da inscrição na competição.</p>
            <p className="mt-2">Caso algum atleta, responsável ou pessoa retratada deseje solicitar a remoção de uma imagem específica, pode entrar em contato pelos canais indicados na seção 12.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 7. Dados de crianças e adolescentes</h2>
            <p>Atletas menores de 18 anos podem participar de categorias de base e da Escolinha. Nesses casos, o cadastro e o consentimento para tratamento de dados são realizados pelos pais ou responsáveis legais, que podem, a qualquer momento, solicitar a revisão, correção ou exclusão dos dados do menor sob sua responsabilidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 8. Cookies e tecnologias semelhantes</h2>
            <p>Nosso site pode utilizar cookies e tecnologias semelhantes para lembrar preferências, entender como os visitantes usam o site e melhorar sua experiência. Você pode gerenciar ou desativar cookies diretamente nas configurações do seu navegador, embora isso possa afetar algumas funcionalidades.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 9. Armazenamento e segurança dos dados</h2>
            <p>Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida, incluindo controle de acesso e armazenamento em ambientes de banco de dados protegidos. Apesar dos esforços, nenhum sistema é totalmente imune a incidentes de segurança.</p>
            <p className="mt-2">Os dados são armazenados pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 10. Seus direitos como titular de dados</h2>
            <p className="mb-2">Conforme a LGPD, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar informações sobre com quem compartilhamos seus dados</li>
            </ul>
            <p className="mt-4">Para exercer esses direitos, entre em contato pelos canais informados na seção 12.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 11. Alterações desta política</h2>
            <p>Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossos serviços ou na legislação aplicável. A versão mais recente estará sempre disponível em nosso site, com a data da última atualização indicada no topo do documento.</p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-12">
            <h2 className="text-xl font-black uppercase text-[#e50914] mb-3">12. Contato</h2>
            <p className="mb-4">Para dúvidas, solicitações ou exercício de direitos relacionados a esta Política de Privacidade, entre em contato:</p>
            <div className="space-y-2 font-mono text-sm text-[#cad0e0]">
              <p>📱 <strong className="text-white">WhatsApp:</strong> (47) 98844-4404</p>
              <p>📸 <strong className="text-white">Instagram:</strong> @arenavaleoficial</p>
              <p>🏢 <strong className="text-white">CNPJ:</strong> 40.694.741/0001-34</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
