export type Severity = 'critico' | 'alto' | 'medio' | 'ajuste';

export type Phase = 'fase1' | 'fase2' | 'fase3';

export interface AuditLeafNode {
  id: string;
  title: string;
  shortLabel: string;
  severity: Severity;
  phase: Phase;
  effort: string;
  location: string;
  liveUrl?: string;
  problem: string;
  evidence: string;
  solution: string;
  codeFix?: string;
}

export interface MindMapBranch {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  badgeBg: string;
  iconName:
    | 'HeartHandshake'
    | 'ShieldAlert'
    | 'Unlink'
    | 'FileEdit'
    | 'Zap'
    | 'Globe'
    | 'BarChart3';
  summary: string;
  items: AuditLeafNode[];
}

export interface RouteScanItem {
  path: string;
  fullUrl: string;
  httpStatus: number;
  sizeLabel: string;
  statusType: 'critico' | 'erro' | 'alerta' | 'ok';
  category: 'Página' | ' Seção' | 'Admin' | 'SEO / Sistema' | 'Mídia';
  finding: string;
  actionRequired: string;
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string; border: string; weight: number }
> = {
  critico: {
    label: 'Bloqueante Crítico',
    color: '#ff3b47',
    bg: 'rgba(229, 9, 20, 0.16)',
    border: 'rgba(229, 9, 20, 0.5)',
    weight: 5,
  },
  alto: {
    label: 'Alta Prioridade',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.45)',
    weight: 3,
  },
  medio: {
    label: 'Média Prioridade',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.14)',
    border: 'rgba(56, 189, 248, 0.4)',
    weight: 2,
  },
  ajuste: {
    label: 'Polimento / Refino',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.4)',
    weight: 1,
  },
};

export const PHASE_META: Record<
  Phase,
  { title: string; subtitle: string; badge: string; accent: string }
> = {
  fase1: {
    title: 'Fase 1 · Bloqueantes Imediatos',
    subtitle: 'Segurança, rotas 404 e links quebrados — corrigir antes de divulgar o link',
    badge: 'URGENTE (2h–4h)',
    accent: '#e50914',
  },
  fase2: {
    title: 'Fase 2 · Conteúdo, Mídia & #projetosocial',
    subtitle: 'Conectar páginas, fotos reais, padronizar PT-BR e comprimir imagens',
    badge: 'PRÉ-LANÇAMENTO (1–2 dias)',
    accent: '#f59e0b',
  },
  fase3: {
    title: 'Fase 3 · Domínio Próprio, SEO & Métricas',
    subtitle: 'Domínio .com.br, Open Graph para WhatsApp, Favicon e Google Analytics 4',
    badge: 'GO-LIVE OFICIAL',
    accent: '#10b981',
  },
};

export const POSITIVE_STRENGTHS = [
  {
    title: 'Identidade Visual Broadcast Forte',
    detail:
      'Paleta escura (#07080c) com vermelho Arena (#e50914) e dourado cria excelente impacto esportivo e hierarquia de destaque.',
  },
  {
    title: 'Página /projetosocial Já Criada no Código',
    detail:
      'Existe uma rota dedicada (/projetosocial) pronta com 4 indicadores de impacto (+1.200 jovens, 20 anos, 15+ comunidades, 100% gratuito) e 3 pilares.',
  },
  {
    title: 'Páginas Jurídicas e CNPJ Presentes',
    detail:
      'As rotas /privacidade e /termos respondem HTTP 200 e o CNPJ (40.694.741/0001-34) já consta no rodapé institucional.',
  },
  {
    title: 'Estrutura Comercial de Cotas Clara',
    detail:
      'As 3 faixas de patrocínio (Master, Apoio Regional e Institucional) explicam entregáveis objetivos para anunciantes.',
  },
];

export const MINDMAP_BRANCHES: MindMapBranch[] = [
  {
    id: 'projeto-social',
    number: '01',
    title: 'Seção #projetosocial',
    subtitle: 'Desconexão Home ↔ Página, provas reais e captação',
    color: '#e50914',
    glow: 'rgba(229, 9, 20, 0.35)',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/40',
    iconName: 'HeartHandshake',
    summary:
      'A âncora #projetosocial na Home está desconectada da página completa /projetosocial que já existe no projeto, além de conter tags internas vazadas e ausência de fotos reais.',
    items: [
      {
        id: 'ps-link-oculto',
        title: 'Conectar #projetosocial na Home à página /projetosocial',
        shortLabel: 'Falta botão p/ /projetosocial na Home',
        severity: 'critico',
        phase: 'fase1',
        effort: '15 min',
        location: 'Home (/#projetosocial)',
        liveUrl: 'https://arena-vale.vercel.app/#projetosocial',
        problem:
          'Na Home, a seção #projetosocial tem apenas 2 linhas de texto e 1 botão para o WhatsApp sem texto pré-preenchido. Ela NÃO tem link para a página completa /projetosocial (que já está pronta com métricas e pilares!).',
        evidence:
          '<section id="projetosocial">...<a href="https://wa.me/5547988444404">💼 Apoiar o Projeto Social</a> (nenhum href="/projetosocial" encontrado no bundle da Home)',
        solution:
          'Adicionar botão "Conhecer o Projeto Completo →" apontando para /projetosocial, trazer os 4 cards numéricos (+1.200 jovens, 20 anos, 15+ comunidades, 100% gratuito) como resumo na Home e adicionar mensagem automática no link do WhatsApp.',
        codeFix: `<div className="mt-8 flex flex-wrap gap-4">
  <Link href="/projetosocial" className="rounded-full bg-[#e50914] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white">
    Conhecer Projeto Completo →
  </Link>
  <a href="https://wa.me/5547988444404?text=Ol%C3%A1%2C%20quero%20apoiar%20o%20Projeto%20Social%20Arena%20Vale!" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white">
    💼 Apoiar via WhatsApp ↗
  </a>
</div>`,
      },
      {
        id: 'ps-nav-404',
        title: 'Menu superior de /projetosocial leva para rota 404 (/campeonatos)',
        shortLabel: 'Link "Campeonatos" dá Erro 404',
        severity: 'critico',
        phase: 'fase1',
        effort: '10 min',
        location: '/projetosocial (Header <nav>)',
        liveUrl: 'https://arena-vale.vercel.app/projetosocial',
        problem:
          'Dentro da página /projetosocial, o menu de navegação superior possui o item "Campeonatos" apontando para /campeonatos, mas essa rota não existe e retorna HTTP 404.',
        evidence:
          '<nav ...><a href="/campeonatos">Campeonatos</a></nav> → GET https://arena-vale.vercel.app/campeonatos retorna HTTP 404 Not Found.',
        solution:
          'Alterar o href para "/#campeonatos" ou criar a página dedicada src/app/campeonatos/page.tsx.',
        codeFix: `// Em src/app/projetosocial/page.tsx:
<Link href="/#campeonatos" className="hover:text-white transition">
  Campeonatos
</Link>`,
      },
      {
        id: 'ps-cfg6-markdown',
        title: 'Remover tag interna "CFG6" e Markdown cru "**CFG6**"',
        shortLabel: 'Tag interna **CFG6** vazada na tela',
        severity: 'alto',
        phase: 'fase1',
        effort: '10 min',
        location: '/projetosocial e /atletasdestaques',
        liveUrl: 'https://arena-vale.vercel.app/projetosocial',
        problem:
          'O selo de topo exibe "RESPONSABILIDADE SOCIAL · CFG6" e o rodapé renderiza asteriscos literais de Markdown não convertido: "Configuração Registada sob a etiqueta **CFG6**". Isso passa impressão de versão de teste.',
        evidence:
          '<span>RESPONSABILIDADE SOCIAL · CFG6</span> e <footer>© 2026 Arena Vale · Configuração Registada sob a etiqueta **CFG6**.</footer>',
        solution:
          'Remover referências internas de versão ("CFG6") da interface pública e padronizar um único componente <Footer /> para todas as páginas.',
      },
      {
        id: 'ps-fotos-reais',
        title: 'Inserir fotos reais dos treinos, alunos e comunidades atendidas',
        shortLabel: 'Zero fotos reais das ações sociais',
        severity: 'alto',
        phase: 'fase2',
        effort: '2h',
        location: '/#projetosocial e /projetosocial',
        problem:
          'Tanto a seção #projetosocial quanto a página /projetosocial não possuem nenhuma fotografia real das crianças, escolinhas ou comunidades (usam apenas emojis ⚽ 📚 🏟️). Para captação social, prova visual é decisiva.',
        evidence:
          'Inspeção de <img> em /projetosocial: apenas 1 tag <img> na página inteira (/logo 02.png no cabeçalho).',
        solution:
          'Adicionar galeria com 4 a 6 fotos reais autorizadas (LGPD/uso de imagem de menores), citando nome dos núcleos/bairros atendidos no Vale.',
      },
      {
        id: 'ps-inscricao-pix',
        title: 'Criar fluxo para inscrição de jovens + transparência PIX/CNPJ',
        shortLabel: 'Falta inscrição de alunos e PIX/Transparência',
        severity: 'medio',
        phase: 'fase2',
        effort: '2h',
        location: '/projetosocial',
        problem:
          'Pais/responsáveis que visitam o site não encontram como inscrever um jovem no projeto 100% gratuito, e doadores/empresas não veem dados de transparência, relatório PDF do projeto ou chave PIX vinculada ao CNPJ.',
        evidence:
          'Apenas CTAs voltados a patrocinador ("Apoiar via WhatsApp" e "Conhecer Cotas"). Sem CTA "Inscrever Atleta/Jovem" nem mídia kit social.',
        solution:
          'Separar 2 caminhos claros: (1) "Quero Inscrever um Jovem" (formulário ou WhatsApp da escolinha) e (2) "Quero Apoiar / Patrocinar" com PDF de Apresentação Institucional e dados oficiais.',
      },
    ],
  },
  {
    id: 'seguranca-painel',
    number: '02',
    title: 'Segurança & Painel',
    subtitle: 'Rota administrativa exposta sem bloqueio no servidor',
    color: '#ff2a35',
    glow: 'rgba(255, 42, 53, 0.4)',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    iconName: 'ShieldAlert',
    summary:
      'A falha mais urgente de toda a conferência: a rota /painel responde HTTP 200 diretamente no servidor, entregando o painel administrativo e e-mail interno sem exigir login prévio.',
    items: [
      {
        id: 'sec-painel-aberto',
        title: 'Bloquear rota /painel no servidor via Next.js Middleware',
        shortLabel: '/painel retorna HTTP 200 sem login!',
        severity: 'critico',
        phase: 'fase1',
        effort: '1h',
        location: 'https://arena-vale.vercel.app/painel',
        liveUrl: 'https://arena-vale.vercel.app/painel',
        problem:
          'Qualquer pessoa que digite /painel na barra de endereços recebe HTTP 200 com o HTML completo do "Centro de Comando & Gestão Editorial" renderizado no servidor antes de qualquer checagem.',
        evidence:
          'GET /painel → HTTP 200 (10.142 bytes) · Exibe: "Painel Restrito • arenavale2026@gmail.com — Centro de Comando & Gestão Editorial".',
        solution:
          'Implementar middleware.ts na raiz do Next.js verificando sessão/token seguro em cookie HttpOnly (Supabase SSR / NextAuth) e redirecionando requisições não autenticadas com HTTP 307 para /login.',
        codeFix: `// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('arena_session')?.value;
  if (req.nextUrl.pathname.startsWith('/painel') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/painel/:path*'] };`,
      },
      {
        id: 'sec-email-hardcoded',
        title: 'Remover e-mail administrativo hardcoded do HTML público',
        shortLabel: 'E-mail interno exposto no código',
        severity: 'critico',
        phase: 'fase1',
        effort: '15 min',
        location: '/painel e /login',
        problem:
          'O endereço arenavale2026@gmail.com aparece fixo no cabeçalho SSR do /painel, facilitando tentativas de phishing ou força bruta no /login.',
        evidence:
          '<span>Painel Restrito • arenavale2026@gmail.com</span> presente no HTML estático.',
        solution:
          'Carregar os dados do usuário logado apenas a partir da sessão autenticada no Server Component após validação real.',
      },
      {
        id: 'sec-headers-noindex',
        title: 'Adicionar meta noindex e Security Headers (CSP / Frame-Options)',
        shortLabel: 'Falta noindex em /login e /painel',
        severity: 'medio',
        phase: 'fase1',
        effort: '30 min',
        location: 'next.config.js + /login + /painel',
        problem:
          'Embora robots.txt tenha Disallow: /painel e /login (o que inclusive revela os nomes das rotas), as páginas não possuem <meta name="robots" content="noindex, nofollow"> nem headers X-Frame-Options / HSTS extras.',
        evidence:
          '<head> de /login e /painel usa exatamente o mesmo metadata público da Home.',
        solution:
          'Adicionar robots: { index: false, follow: false } no metadata de /login e /painel e configurar headers de segurança no next.config.mjs.',
      },
    ],
  },
  {
    id: 'links-conversao',
    number: '03',
    title: 'Links & Conversão',
    subtitle: 'Erros 404, WhatsApp mal codificado (%2520) e CTAs quebrados',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.32)',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    iconName: 'Unlink',
    summary:
      'Há links comerciais importantes com codificação dupla no WhatsApp, link de rede social genérico e botões que prometem funcionalidades ainda inexistentes.',
    items: [
      {
        id: 'lnk-whatsapp-2520',
        title: 'Corrigir dupla codificação "%2520" nos 4 botões de Patrocínio',
        shortLabel: 'Texto "%20" literal no WhatsApp Comercial',
        severity: 'critico',
        phase: 'fase1',
        effort: '15 min',
        location: 'Home (Seção Por Que Patrocinar)',
        liveUrl: 'https://arena-vale.vercel.app/',
        problem:
          'Nos 4 botões mais lucrativos do site (Cota Master, Apoio Regional, Cota Institucional e WhatsApp Patrocínios), os espaços foram codificados duas vezes (%2520). Ao abrir o WhatsApp, o patrocinador vê a frase poluída com vários "%20" no texto!',
        evidence:
          'href="https://wa.me/5547988444404?text=Olá,%2520tenho%2520interesse%2520na%2520Cota%2520Master%2520da%2520Arena%2520Vale!"',
        solution:
          'Usar encodeURIComponent() apenas uma vez ou escrever espaços simples com %20 (nunca passar uma string já com %20 dentro de encodeURIComponent).',
        codeFix: `// Função limpa para gerar links de WhatsApp sem dupla codificação:
const buildWhatsAppUrl = (msg: string) =>
  \`https://wa.me/5547988444404?text=\${encodeURIComponent(msg)}\`;

// Exemplo correto:
buildWhatsAppUrl("Olá, tenho interesse na Cota Master da Arena Vale!")`,
      },
      {
        id: 'lnk-facebook-raiz',
        title: 'Atualizar link do Facebook no rodapé (aponta para facebook.com)',
        shortLabel: 'Ícone Facebook leva p/ facebook.com vazio',
        severity: 'alto',
        phase: 'fase1',
        effort: '5 min',
        location: 'Home (Footer)',
        problem:
          'No rodapé oficial, o botão "Facebook Oficial" aponta genericamente para https://facebook.com em vez da página oficial da Arena Vale (ou do canal do YouTube).',
        evidence:
          '<a href="https://facebook.com" target="_blank" title="Facebook Oficial">',
        solution:
          'Inserir a URL real da fanpage da Arena Vale no Facebook ou substituir pelo ícone oficial do YouTube (@TVArenaVale), que já existe e está ativo.',
      },
      {
        id: 'lnk-app-expectativa',
        title: 'Ajustar CTA "BAIXE O APLICATIVO / INSTALAR O APP"',
        shortLabel: 'Botão "Instalar App" abre WhatsApp',
        severity: 'alto',
        phase: 'fase2',
        effort: '30 min',
        location: 'Home (#app)',
        problem:
          'A seção anuncia "BAIXE O APLICATIVO ARENA VALE" com botão "INSTALAR O APP ↗", mas não existe link da Google Play, App Store nem Web App PWA (/manifest.json retorna 404); o clique abre o WhatsApp pedindo informações.',
        evidence:
          'href="https://wa.me/5547988444404?text=Olá,%20quero%20saber%20mais%20sobre%20o%20aplicativo%20da%20Arena%20Vale!"',
        solution:
          'Se o app estiver em pré-lançamento ou acesso fechado para gestores, mudar o texto do botão para "SOLICITAR ACESSO AO APP ↗" ou "TESTAR WEB APP", evitando frustração do usuário.',
      },
      {
        id: 'lnk-noticias-ancora',
        title: 'Dar destino real aos 3 cards de Notícias (#noticias)',
        shortLabel: 'Cards de Notícias levam só p/ #campeonatos',
        severity: 'medio',
        phase: 'fase2',
        effort: '2h',
        location: 'Home (#noticias)',
        problem:
          'Os 3 artigos da seção "Conteúdo & Cobertura" possuem botão "EXPLORAR COBERTURA ↗", mas todos apontam apenas para a âncora #campeonatos na própria Home (inclusive o card "Incentivo ao Desporto Regional", que deveria levar a /projetosocial).',
        evidence:
          'Nos 3 <article>: <a href="#campeonatos">EXPLORAR COBERTURA ↗</a>.',
        solution:
          'Apontar o Card 01 para /tv, o Card 02 para /projetosocial e o Card 03 para #campeonatos — ou criar rota dinâmica /noticias/[slug] alimentada pelo painel.',
      },
      {
        id: 'lnk-live-embed',
        title: 'Integrar player real do YouTube na seção Sinal Ao Vivo e corrigir corte em /tv',
        shortLabel: 'Box Ao Vivo estático e iframe 140% cortado',
        severity: 'medio',
        phase: 'fase2',
        effort: '1h',
        location: 'Home (Sinal ao Vivo) e /tv',
        liveUrl: 'https://arena-vale.vercel.app/tv',
        problem:
          'Na Home, a área "SINAL AO VIVO" é apenas uma imagem estática da logo com link externo. Já na página /tv, o único iframe do YouTube usa class="h-[140%] w-[140%]", cortando 40% das bordas e controles do vídeo.',
        evidence:
          'Em /tv: <iframe class="h-[140%] w-[140%] max-w-none" src="https://www.youtube.com/embed/sY8Dpv7KIho...">',
        solution:
          'Usar class="h-full w-full" com aspect-video no iframe de /tv e exibir a última transmissão ou live ativa diretamente no player da Home.',
      },
    ],
  },
  {
    id: 'conteudo-linguagem',
    number: '04',
    title: 'Conteúdo & Revisão PT-BR',
    subtitle: 'Páginas vazias, fotos repetidas e português de Portugal',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.32)',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    iconName: 'FileEdit',
    summary:
      'O site tem páginas principais sem dados cadastrados ("Agenda em Atualização"), usa a mesma foto de fundo para todos os atletas e mistura vocabulário de Portugal com do Brasil.',
    items: [
      {
        id: 'cnt-agenda-vazia',
        title: 'Popular a página /agenda com calendário ou rodada inaugural',
        shortLabel: '/agenda exibe apenas "Em Atualização"',
        severity: 'alto',
        phase: 'fase2',
        effort: '1h',
        location: '/agenda',
        liveUrl: 'https://arena-vale.vercel.app/agenda',
        problem:
          'A Home faz grande chamada para "CONFIRA O CALENDÁRIO COMPLETO DE CONFRONTOS", mas ao clicar em /agenda o visitante encontra uma caixa vazia dizendo "Agenda em Atualização".',
        evidence:
          '<h3>Agenda em Atualização</h3> em https://arena-vale.vercel.app/agenda (filtros de modalidades não exibem nenhum jogo).',
        solution:
          'Cadastrar ao menos o cronograma previsto da temporada 2026 (datas de abertura das inscrições, congresso técnico e 1ª rodada) ou jogos amistosos/históricos.',
      },
      {
        id: 'cnt-ptbr-padrao',
        title: 'Padronizar 100% do texto para Português do Brasil (PT-BR)',
        shortLabel: 'Mistura de PT-PT ("desporto", "equipas")',
        severity: 'alto',
        phase: 'fase1',
        effort: '30 min',
        location: 'Todo o site (Home, Meta description, /projetosocial)',
        problem:
          'Sendo uma operação de Santa Catarina (DDD 47, CNPJ brasileiro), há dezenas de palavras em Português Europeu geradas no texto: "desporto", "desportivas", "equipas", "câmaras", "multimédia", "registada". Além disso, falta til em "TRANSMISSAO AO VIVO" na Home.',
        evidence:
          'Meta description: "transmissões desportivas" · Agenda: "equipas" · Card 01: "multimédia... câmaras IA" · Home: "TRANSMISSAO AO VIVO".',
        solution:
          'Revisar todos os textos trocando para "esporte/esportivas", "equipes", "câmeras", "multimídia", "registrada" e corrigir "TRANSMISSÃO AO VIVO".',
      },
      {
        id: 'cnt-fotos-atletas',
        title: 'Substituir imagens repetidas (/fundo-arena.jpg) nos Atletas e Notícias',
        shortLabel: 'Mesma imagem repetida 6x nos cards',
        severity: 'alto',
        phase: 'fase2',
        effort: '2h',
        location: '/atletasdestaques e Home (#noticias)',
        liveUrl: 'https://arena-vale.vercel.app/atletasdestaques',
        problem:
          'Em /atletasdestaques, os atletas Gabriel Mendes (Futsal), Lucas Silveira (Basquete) e Matheus Becker (Futebol 7) usam todos a mesma imagem genérica /fundo-arena.jpg como fundo, sem foto real dos jogadores. Os 3 cards de notícias também repetem /fundo-arena.jpg.',
        evidence:
          '<img src="/fundo-arena.jpg" alt="GABRIEL MENDES"> / <img src="/fundo-arena.jpg" alt="LUCAS SILVEIRA">',
        solution:
          'Subir fotos reais recortadas/retratos dos atletas em destaque (e confirmar se os 3 nomes são atletas reais ou dados fictícios de demonstração antes de ir ao ar).',
      },
      {
        id: 'cnt-logos-parceiros',
        title: 'Inserir logotipos reais de parceiros (ex.: ACADESF e ginásios)',
        shortLabel: 'Parceiros só em texto s/ logotipo',
        severity: 'medio',
        phase: 'fase2',
        effort: '45 min',
        location: 'Home (#campeonatos)',
        problem:
          'O parceiro institucional ACADESF aparece apenas escrito em texto simples, sem logotipo oficial, ao lado de duas caixas tracejadas vazias.',
        evidence:
          '<span>ACADESF</span><span>Parceiro Institucional</span>',
        solution:
          'Exibir a marca oficial da ACADESF e dos ginásios parceiros para elevar a credibilidade comercial junto aos patrocinadores.',
      },
    ],
  },
  {
    id: 'performance-midia',
    number: '05',
    title: 'Performance & Mídia',
    subtitle: 'Imagem de 2,87 MB bloqueando carregamento mobile',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.32)',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    iconName: 'Zap',
    summary:
      'Os recursos visuais não estão otimizados com o componente <Image> do Next.js, fazendo dispositivos móveis baixarem quase 3 MB logo na abertura.',
    items: [
      {
        id: 'perf-fundo-3mb',
        title: 'Comprimir /fundo-arena.jpg (2,87 MB!) para WebP/AVIF + next/image',
        shortLabel: '/fundo-arena.jpg pesa 2,87 MB cru!',
        severity: 'critico',
        phase: 'fase2',
        effort: '30 min',
        location: 'public/fundo-arena.jpg + <head>',
        liveUrl: 'https://arena-vale.vercel.app/fundo-arena.jpg',
        problem:
          'O arquivo /fundo-arena.jpg pesa exatos 2.874.222 bytes (2,87 MB) em JPEG bruto, é carregado via tag <img> comum sem redimensionamento responsivo e ainda está com <link rel="preload"> no <head>, travando a renderização em conexões 4G.',
        evidence:
          'GET /fundo-arena.jpg → 2.874.222 bytes (image/jpeg). Usado 5x na Home.',
        solution:
          'Converter para WebP/AVIF (~180 KB, redução de 93% de peso!) e utilizar o componente <Image fill priority sizes="100vw" /> do next/image apenas no Hero (lazy loading no restante).',
        codeFix: `import Image from 'next/image';

<Image
  src="/fundo-arena.webp"
  alt="Arena Vale"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 1280px"
  className="object-cover object-center brightness-60 contrast-110"
/>`,
      },
      {
        id: 'perf-logo-espaco',
        title: 'Renomear "/logo 02.png" (remover espaço) e exportar PNG/SVG transparente',
        shortLabel: 'Espaço no nome "/logo 02.png" e fundo escuro',
        severity: 'medio',
        phase: 'fase2',
        effort: '20 min',
        location: 'public/logo 02.png (125 KB)',
        liveUrl: 'https://arena-vale.vercel.app/logo%2002.png',
        problem:
          'O arquivo da logo possui espaço em branco no nome ("/logo 02.png") e fundo escuro embutido, exigindo o hack CSS mix-blend-lighten em todo o site (que pode falhar em navegadores iOS/Safari ou fundos claros de compartilhamento).',
        evidence:
          '<img src="/logo 02.png" class="... mix-blend-lighten">',
        solution:
          'Exportar a logo com fundo 100% transparente em /logo-arena-vale.svg ou .webp sem espaços no nome.',
      },
    ],
  },
  {
    id: 'dominio-seo',
    number: '06',
    title: 'Domínio, SEO & Social',
    subtitle: 'Favicon 404, sem preview no WhatsApp, Sitemap com erro e domínio',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.32)',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    iconName: 'Globe',
    summary:
      'Para colocar o site oficialmente no ar, faltam elementos essenciais de identidade na aba do navegador, card de preview no WhatsApp e saneamento do Sitemap.',
    items: [
      {
        id: 'seo-dominio-proprio',
        title: 'Conectar domínio próprio (.com.br) na Vercel + atualizar Sitemap/Robots',
        shortLabel: 'Sair do subdomínio .vercel.app',
        severity: 'critico',
        phase: 'fase3',
        effort: '45 min',
        location: 'Vercel Domains + sitemap.xml + robots.txt',
        problem:
          'O site ainda opera em subdomínio gratuito (arena-vale.vercel.app) e tanto o robots.txt quanto o sitemap.xml estão chumbados com esse endereço provisório.',
        evidence:
          'Sitemap: https://arena-vale.vercel.app/sitemap.xml',
        solution:
          'Registrar domínio oficial (ex.: arenavale.com.br ou arenavalesports.com.br), apontar DNS para a Vercel com SSL automático e usar variável NEXT_PUBLIC_SITE_URL no sitemap.ts e robots.ts.',
      },
      {
        id: 'seo-favicon-manifest',
        title: 'Criar favicon.ico, apple-touch-icon e manifest.webmanifest (hoje 404)',
        shortLabel: '/favicon.ico e /manifest.json dão 404',
        severity: 'alto',
        phase: 'fase2',
        effort: '20 min',
        location: 'src/app/favicon.ico e manifest.ts',
        liveUrl: 'https://arena-vale.vercel.app/favicon.ico',
        problem:
          'As requisições para /favicon.ico e /manifest.json retornam HTTP 404. A aba do navegador fica sem o escudo da Arena Vale e celulares não conseguem salvar atalho com ícone na tela inicial.',
        evidence:
          'GET /favicon.ico → HTTP 404 · GET /manifest.json → HTTP 404.',
        solution:
          'Adicionar icon.png (512x512), apple-icon.png (180x180), favicon.ico e manifest.ts dentro de src/app/.',
      },
      {
        id: 'seo-opengraph-whatsapp',
        title: 'Configurar Open Graph (og:image 1200x630) para compartilhamento no WhatsApp',
        shortLabel: 'Link sem miniatura no WhatsApp/Instagram',
        severity: 'alto',
        phase: 'fase2',
        effort: '30 min',
        location: 'src/app/layout.tsx e /projetosocial',
        problem:
          'Não há nenhuma tag og:title, og:description, og:image ou twitter:card no HTML. Quando alguém envia https://arena-vale.vercel.app/#projetosocial no WhatsApp de um patrocinador, aparece apenas um link seco sem imagem.',
        evidence:
          'Inspeção do <head>: apenas <title> e <meta name="description">. Zero tags property="og:*".',
        solution:
          'Configurar openGraph e twitter no objeto metadata do layout.tsx com banner 1200x630px oficial da Arena Vale.',
        codeFix: `// Em src/app/layout.tsx:
export const metadata: Metadata = {
  metadataBase: new URL('https://arenavale.com.br'),
  title: { default: 'Arena Vale Sports | O Palco do Esporte no Vale', template: '%s | Arena Vale' },
  description: 'Transmissões ao vivo, gestão de campeonatos, atletas em destaque e Projeto Social esportivo no Vale.',
  openGraph: {
    title: 'Arena Vale Sports · Transmissões & Campeonatos',
    description: 'Cobertura ao vivo, campeonatos oficiais e Projeto Social transformando vidas pelo esporte.',
    images: [{ url: '/og-arena-vale.jpg', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
};`,
      },
      {
        id: 'seo-sitemap-lastmod',
        title: 'Corrigir Sitemap.xml (remover rota 404 /campeonatos e data futura 2026-10-22)',
        shortLabel: 'Sitemap tem URL 404 e data futura',
        severity: 'medio',
        phase: 'fase3',
        effort: '15 min',
        location: '/sitemap.xml',
        liveUrl: 'https://arena-vale.vercel.app/sitemap.xml',
        problem:
          'O sitemap.xml envia ao Google a URL /campeonatos (que retorna 404!) e declara <lastmod>2026-10-22T19:48:25.842Z</lastmod> (uma data no futuro), o que gera alertas no Google Search Console.',
        evidence:
          '<loc>https://arena-vale.vercel.app/campeonatos</loc> + <lastmod>2026-10-22T19:48:25.842Z</lastmod>',
        solution:
          'Usar new Date() real no momento do build, remover rotas inexistentes e incluir /privacidade e /termos.',
      },
      {
        id: 'seo-titles-unicos',
        title: 'Criar <title> e description únicos para /tv, /agenda, /patrocinio e /atletas',
        shortLabel: '6 páginas com <title> idêntico',
        severity: 'ajuste',
        phase: 'fase3',
        effort: '20 min',
        location: '/tv, /agenda, /atletasdestaques, /patrocinio',
        problem:
          'Apenas /projetosocial tem <title> próprio ("Projeto Social | Arena Vale Sports"). Todas as outras 5 páginas usam o título repetido "Arena Vale Sports".',
        evidence:
          'GET /tv, /agenda, /patrocinio, /atletasdestaques → <title>Arena Vale Sports</title>',
        solution:
          'Exportar metadata específico em cada page.tsx para ranquear buscas regionais por modalidade e patrocínio.',
      },
    ],
  },
  {
    id: 'analytics-operacao',
    number: '07',
    title: 'Métricas, LGPD & Operação',
    subtitle: 'Rastreamento real de tráfego, cookies e captação',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.32)',
    badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    iconName: 'BarChart3',
    summary:
      'Para comprovar audiência aos anunciantes da Cota Master, o site precisa medir acessos e cliques reais nos botões de WhatsApp.',
    items: [
      {
        id: 'ops-analytics',
        title: 'Instalar Google Analytics 4 (GA4) + Vercel Analytics + eventos de clique',
        shortLabel: 'Zero scripts de Analytics instalados',
        severity: 'alto',
        phase: 'fase3',
        effort: '40 min',
        location: 'src/app/layout.tsx',
        problem:
          'Não há Google Analytics, Tag Manager, Meta Pixel nem Vercel Analytics no bundle. Sem isso, é impossível provar métricas auditadas de audiência para fechar cotas de patrocínio.',
        evidence:
          'Nenhum script gtag, gtm, fbq ou _vercel/insights detectado no HTML ou chunks JS.',
        solution:
          'Instalar @vercel/analytics e @next/third-parties/google (GA4), disparando eventos customizados ao clicar em "Anuncie", "Garantir Cota" e "Apoiar Projeto Social".',
      },
      {
        id: 'ops-lgpd-banner',
        title: 'Adicionar aviso de Cookies / LGPD alinhado à página /privacidade',
        shortLabel: 'Falta banner de consentimento LGPD',
        severity: 'medio',
        phase: 'fase3',
        effort: '45 min',
        location: 'Layout Global',
        problem:
          'O rodapé já possui /privacidade e /termos, mas ao ativar Analytics e embeds do YouTube, é recomendável exibir aviso discreto de cookies conforme a LGPD.',
        evidence:
          'Iframe do YouTube carrega direto em /tv sem youtube-nocookie.com ou banner de consentimento.',
        solution:
          'Usar domínio youtube-nocookie.com nos embeds e adicionar barra compacta de aceite de cookies no primeiro acesso.',
      },
      {
        id: 'ops-email-contato',
        title: 'Criar e-mail profissional @arenavale.com.br e formulário alternativo ao WhatsApp',
        shortLabel: 'Dependência 100% de WhatsApp + Gmail',
        severity: 'ajuste',
        phase: 'fase3',
        effort: '1h',
        location: 'Comercial & Rodapé',
        problem:
          'Departamentos de marketing de médias/grandes empresas costumam exigir e-mail corporativo e envio de proposta formal por e-mail além do WhatsApp.',
        evidence:
          'Único canal público de contato é wa.me/5547988444404 e e-mail interno @gmail.com.',
        solution:
          'Configurar contato@arenavale.com.br / comercial@arenavale.com.br e disponibilizar download direto do Mídia Kit 2026 em PDF.',
      },
    ],
  },
];

export const ROUTE_SCAN_RESULTS: RouteScanItem[] = [
  {
    path: '/#projetosocial',
    fullUrl: 'https://arena-vale.vercel.app/#projetosocial',
    httpStatus: 200,
    sizeLabel: 'Seção na Home',
    statusType: 'alerta',
    category: ' Seção',
    finding:
      'Seção minimalista (2 linhas) sem fotos e SEM link para a página /projetosocial completa que já existe.',
    actionRequired: 'Vincular botão para /projetosocial + métricas + fotos reais.',
  },
  {
    path: '/projetosocial',
    fullUrl: 'https://arena-vale.vercel.app/projetosocial',
    httpStatus: 200,
    sizeLabel: '22,2 KB',
    statusType: 'alerta',
    category: 'Página',
    finding:
      'Página estruturada, mas menu "Campeonatos" dá 404, exibe "**CFG6**" cru no rodapé e não tem fotos reais.',
    actionRequired: 'Corrigir link /campeonatos → /#campeonatos, remover CFG6 e inserir fotos.',
  },
  {
    path: '/painel',
    fullUrl: 'https://arena-vale.vercel.app/painel',
    httpStatus: 200,
    sizeLabel: '10,1 KB',
    statusType: 'critico',
    category: 'Admin',
    finding:
      'FALHA CRÍTICA: Painel administrativo renderiza com HTTP 200 sem autenticação no servidor e expõe e-mail interno.',
    actionRequired: 'Proteger imediatamente com middleware.ts e sessão HttpOnly.',
  },
  {
    path: '/campeonatos',
    fullUrl: 'https://arena-vale.vercel.app/campeonatos',
    httpStatus: 404,
    sizeLabel: '5,6 KB',
    statusType: 'erro',
    category: 'Página',
    finding:
      'Rota inexistente (404), porém está listada no sitemap.xml oficial e no menu de /projetosocial.',
    actionRequired: 'Criar página /campeonatos ou redirecionar (308) para /#campeonatos.',
  },
  {
    path: '/fundo-arena.jpg',
    fullUrl: 'https://arena-vale.vercel.app/fundo-arena.jpg',
    httpStatus: 200,
    sizeLabel: '2,87 MB (!)',
    statusType: 'critico',
    category: 'Mídia',
    finding:
      'Imagem pesadíssima (2.874.222 bytes) carregada com preload bloqueante e repetida em 6 cards.',
    actionRequired: 'Converter para WebP (~180 KB) e usar componente <Image /> do Next.js.',
  },
  {
    path: '/favicon.ico',
    fullUrl: 'https://arena-vale.vercel.app/favicon.ico',
    httpStatus: 404,
    sizeLabel: '404',
    statusType: 'erro',
    category: 'SEO / Sistema',
    finding: 'Ícone da aba do navegador ausente (retorna página 404).',
    actionRequired: 'Gerar favicon.ico, icon.png e apple-touch-icon.',
  },
  {
    path: '/manifest.json',
    fullUrl: 'https://arena-vale.vercel.app/manifest.json',
    httpStatus: 404,
    sizeLabel: '404',
    statusType: 'erro',
    category: 'SEO / Sistema',
    finding: 'Ausente; impede instalação como Web App (PWA) no celular.',
    actionRequired: 'Criar src/app/manifest.ts com ícones 192x192 e 512x512.',
  },
  {
    path: '/agenda',
    fullUrl: 'https://arena-vale.vercel.app/agenda',
    httpStatus: 200,
    sizeLabel: '6,9 KB',
    statusType: 'alerta',
    category: 'Página',
    finding: 'Página vazia exibindo apenas "Agenda em Atualização".',
    actionRequired: 'Inserir datas oficiais de abertura da temporada 2026.',
  },
  {
    path: '/tv',
    fullUrl: 'https://arena-vale.vercel.app/tv',
    httpStatus: 200,
    sizeLabel: '7,6 KB',
    statusType: 'alerta',
    category: 'Página',
    finding: 'Possui apenas 1 vídeo cadastrado e o iframe está com w-[140%] h-[140%] cortando controles.',
    actionRequired: 'Ajustar iframe para w-full h-full e ampliar catálogo de vídeos.',
  },
  {
    path: '/atletasdestaques',
    fullUrl: 'https://arena-vale.vercel.app/atletasdestaques',
    httpStatus: 200,
    sizeLabel: '12,5 KB',
    statusType: 'alerta',
    category: 'Página',
    finding: '3 atletas sem fotos individuais (usam /fundo-arena.jpg) e rodapé com "**CFG6**" cru.',
    actionRequired: 'Adicionar fotos reais dos atletas e limpar rodapé.',
  },
  {
    path: '/patrocinio',
    fullUrl: 'https://arena-vale.vercel.app/patrocinio',
    httpStatus: 200,
    sizeLabel: '12,3 KB',
    statusType: 'ok',
    category: 'Página',
    finding: 'Página funcional, mas com <title> genérico duplicado e sem link direto no menu principal da Home.',
    actionRequired: 'Personalizar <title> SEO e revisar links WhatsApp.',
  },
  {
    path: '/sitemap.xml',
    fullUrl: 'https://arena-vale.vercel.app/sitemap.xml',
    httpStatus: 200,
    sizeLabel: '1,2 KB',
    statusType: 'alerta',
    category: 'SEO / Sistema',
    finding: 'Aponta para domínio .vercel.app, inclui rota 404 (/campeonatos) e usa data futura (2026-10-22).',
    actionRequired: 'Corrigir URLs, data real de modificação e domínio final.',
  },
  {
    path: '/robots.txt',
    fullUrl: 'https://arena-vale.vercel.app/robots.txt',
    httpStatus: 200,
    sizeLabel: '110 B',
    statusType: 'alerta',
    category: 'SEO / Sistema',
    finding: 'Expõe caminhos /login e /painel e referencia sitemap no domínio .vercel.app.',
    actionRequired: 'Atualizar Sitemap para domínio próprio e usar meta noindex nas rotas internas.',
  },
  {
    path: '/logo 02.png',
    fullUrl: 'https://arena-vale.vercel.app/logo%2002.png',
    httpStatus: 200,
    sizeLabel: '125 KB',
    statusType: 'alerta',
    category: 'Mídia',
    finding: 'Nome de arquivo com espaço em branco e fundo escuro dependente de mix-blend-lighten.',
    actionRequired: 'Renomear para /logo-arena-vale.webp ou .svg com fundo transparente.',
  },
  {
    path: '/privacidade & /termos',
    fullUrl: 'https://arena-vale.vercel.app/privacidade',
    httpStatus: 200,
    sizeLabel: '15,4 KB / 13,4 KB',
    statusType: 'ok',
    category: 'Página',
    finding: 'Páginas jurídicas ativas e linkadas no rodapé da Home com CNPJ informado.',
    actionRequired: 'Apenas validar e-mail oficial do Encarregado de Dados (DPO).',
  },
];
