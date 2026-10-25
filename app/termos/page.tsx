import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Arena Vale Sports',
  description: 'Termos de uso, regras de competição e condições de serviço da plataforma Arena Vale.',
};

export default function TermosDeUsoPage() {
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

      {/* CONTEÚDO DOS TERMOS */}
      <main className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        <div className="border-b border-white/10 pb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4">DOCUMENTO OFICIAL</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">Termos de Uso</h1>
          <p className="text-xs font-mono text-[#8a92a6]">Última atualização: 22 de outubro de 2026</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#b8c0d4]">
          <p>Bem-vindo(a) à Arena Vale (CNPJ 40.694.741/0001-34). Estes Termos de Uso regulam o acesso e a utilização do nosso site, aplicativo e canais de atendimento relacionados à organização de campeonatos, transmissões esportivas e serviços correlatos ("Serviços"). Ao acessar ou usar os Serviços, você concorda integralmente com estes Termos. Caso não concorde, recomendamos que não utilize os Serviços.</p>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 1. Quem pode usar os Serviços</h2>
            <p>Os Serviços destinam-se a atletas, responsáveis legais (no caso de menores de 18 anos), técnicos, coordenadores de equipe, patrocinadores e torcedores em geral. Ao se cadastrar como coordenador de equipe, você declara ter poderes para representar o time/clube e seus atletas para os fins descritos nestes Termos e na nossa Política de Privacidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 2. Cadastro e conta</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Você é responsável por fornecer informações verdadeiras, completas e atualizadas no cadastro de atletas, equipes e usuários</li>
              <li>Você é responsável por manter a confidencialidade de login e senha de acesso ao Painel</li>
              <li>Inscrições de equipes ficam sujeitas à aprovação da coordenação da Arena Vale antes de passarem a constar publicamente no site</li>
              <li>Reservamo-nos o direito de recusar, suspender ou cancelar cadastros que violem estes Termos ou as regras dos campeonatos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 3. Direito de imagem</h2>
            <p>A responsabilidade por obter o consentimento de uso de imagem de cada atleta — ou de seu responsável legal, no caso de menores de idade — é da equipe/clube ao qual o atleta está vinculado, no momento da inscrição. Ao inscrever um atleta, a equipe declara possuir essa autorização e isenta a Arena Vale de responsabilidade por eventual uso indevido decorrente da ausência desse consentimento. Mais detalhes na nossa Política de Privacidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 4. Mensalidades, inscrições e pagamentos</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Valores de inscrição em campeonatos e mensalidades da Escolinha são informados previamente à confirmação</li>
              <li>Pagamentos podem ser processados via PIX ou outro meio informado no momento da cobrança</li>
              <li>Cancelamentos e reembolsos seguem a política específica informada no momento da contratação de cada serviço; na ausência de política específica, entre em contato pelos canais da seção 11 para análise caso a caso</li>
              <li>Atrasos no pagamento de mensalidades podem resultar em suspensão do acesso aos serviços vinculados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 5. Regras de competição e conduta</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8a92a6]">
              <li>Atletas, técnicos e equipes devem seguir os regulamentos específicos de cada campeonato, divulgados separadamente</li>
              <li>Não toleramos conduta antidesportiva, discriminatória, violenta ou que coloque em risco a integridade de participantes, árbitros ou público</li>
              <li>A Arena Vale pode advertir, suspender ou desclassificar atletas/equipes que violem as regras de conduta ou os regulamentos das competições</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 6. Conteúdo gerado por usuários</h2>
            <p>Ao enviar comentários, mensagens no chat das transmissões, fotos ou vídeos para a Arena Vale, você garante possuir os direitos necessários sobre esse conteúdo e concede à Arena Vale licença não exclusiva para exibi-lo em nossos canais oficiais (site, aplicativo, transmissões e redes sociais). Reservamo-nos o direito de remover ou moderar qualquer conteúdo que viole estes Termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 7. Propriedade intelectual</h2>
            <p>A marca "Arena Vale", sua identidade visual, logotipo e os conteúdos originais produzidos por nós (textos, transmissões, artes, estatísticas editadas) são de propriedade da Arena Vale ou de seus licenciantes, sendo vedada a reprodução não autorizada para fins comerciais.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 8. Patrocínio e publicidade</h2>
            <p>Marcas parceiras e patrocinadoras podem ter sua logo e material publicitário exibidos nos Serviços conforme cotas contratadas. A Arena Vale não se responsabiliza por produtos ou serviços oferecidos por anunciantes e patrocinadores, que são de responsabilidade exclusiva de cada parceiro.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 9. Limitação de responsabilidade</h2>
            <p>Os Serviços são fornecidos "como estão". Envidamos esforços razoáveis para manter o site, aplicativo e transmissões disponíveis e precisos, mas não garantimos disponibilidade ininterrupta nem a ausência total de erros (por exemplo, em placares ou estatísticas em tempo real). Não nos responsabilizamos por danos indiretos decorrentes do uso dos Serviços, exceto nos casos previstos em lei.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 10. Alterações destes Termos</h2>
            <p>Podemos atualizar estes Termos periodicamente para refletir mudanças em nossos Serviços ou na legislação aplicável. A versão mais recente estará sempre disponível em nosso site, com a data da última atualização indicada no topo do documento. O uso continuado dos Serviços após a atualização implica concordância com os novos termos.</p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-12">
            <h2 className="text-xl font-black uppercase text-[#e50914] mb-3">11. Contato</h2>
            <p className="mb-4">Para dúvidas sobre estes Termos de Uso, entre em contato:</p>
            <div className="space-y-2 font-mono text-sm text-[#cad0e0]">
              <p>📱 <strong className="text-white">WhatsApp:</strong> (47) 98844-4404</p>
              <p>📸 <strong className="text-white">Instagram:</strong> @arenavaleoficial</p>
              <p>🏢 <strong className="text-white">CNPJ:</strong> 40.694.741/0001-34</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase text-white mb-3 mt-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e50914]" /> 12. Lei aplicável e foro</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca sede da Arena Vale para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </section>

        </div>
      </main>
    </div>
  );
}
