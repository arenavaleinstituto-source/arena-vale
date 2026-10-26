export const ARENA_CONSTANTS = {
  brandName: 'Arena Vale Sports',
  slogan: 'O palco do esporte é aqui.',
  cnpj: '40.694.741/0001-34',
  pixKey: '40.694.741/0001-34',
  whatsappNumber: '5547988444404',
  whatsappDisplay: '(47) 98844-4404',
  instagramUrl: 'https://www.instagram.com/arenavaleoficial/',
  youtubeChannelUrl: 'https://www.youtube.com/@TVArenaVale',
  featuredYoutubeId: 'sY8Dpv7KIho',
  contactEmail: 'contato@arenavalesports.com.br',
};

/**
 * Generates clean single-encoded WhatsApp URLs (fixes the %2520 double-encoding bug)
 */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${ARENA_CONSTANTS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export type ModalityKey = 'Futsal' | 'Futebol 7' | 'Basquetebol' | 'Voleibol';

export interface ChampionshipInfo {
  modality: ModalityKey;
  badge: string;
  title: string;
  status: string;
  description: string;
  categories: string;
  format: string;
  duration: string;
  venue: string;
  image: string;
}

export const CHAMPIONSHIPS_DATA: Record<ModalityKey, ChampionshipInfo> = {
  Futsal: {
    modality: 'Futsal',
    badge: 'CIRCUITO OFICIAL 2026',
    title: 'Circuito Arena Vale de Futsal 2026',
    status: 'Inscrições Abertas · Temporada 2026',
    description:
      'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra. Temporada organizada em fase de grupos seguida de mata-mata, com transmissão ao vivo em HD pela TV Arena Vale.',
    categories: 'Sub-15, Sub-20, Livre (Adulto) e Master (35+)',
    format: 'Fase de grupos + Mata-mata eliminatório',
    duration: '2 tempos de 20 min (Base) ou 25 min (Livre/Master)',
    venue: 'Ginásios parceiros homologados da região do Vale',
    image:
      'https://images.pexels.com/photos/29388472/pexels-photo-29388472.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  'Futebol 7': {
    modality: 'Futebol 7',
    badge: 'COPA SOCIETY 2026',
    title: 'Copa Arena Vale de Futebol 7 Society',
    status: 'Credenciamento de Equipes · 2026',
    description:
      'Velocidade, intensidade e grandes confrontos nos campos sintéticos da região. Cobertura multicâmera, estatísticas completas de artilharia, súmula digital e arbitragem oficial escalada pela Arena Vale.',
    categories: 'Livre Masculino, Feminino e Veteranos (40+)',
    format: 'Turno classificatório + Quartas, Semifinal e Final Ao Vivo',
    duration: '2 tempos de 25 minutos corridos',
    venue: 'Arenas sintéticas parceiras do Vale',
    image:
      'https://images.pexels.com/photos/6077792/pexels-photo-6077792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  Basquetebol: {
    modality: 'Basquetebol',
    badge: 'LIGA VALE HOOPS 2026',
    title: 'Liga Regional Arena Vale de Basquetebol',
    status: 'Calendário Confirmado · 2026',
    description:
      'O basquete regional ganha palco profissional com placar eletrônico integrado à transmissão, escolha do MVP da rodada e cobertura fotográfica dedicada para valorizar atletas e patrocinadores.',
    categories: 'Sub-19 e Adulto Livre',
    format: 'Temporada regular + Playoffs melhor de 3 na Final',
    duration: '4 quartos de 10 minutos (regras oficiais FIBA)',
    venue: 'Ginásios municipais e clubes parceiros do Vale',
    image:
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  Voleibol: {
    modality: 'Voleibol',
    badge: 'TAÇA VALE VÔLEI 2026',
    title: 'Taça Arena Vale de Voleibol Masculino & Feminino',
    status: 'Pré-Inscrição Aberta · 2026',
    description:
      'Equipes femininas, masculinas e mistas em etapas regionais vibrantes. Estrutura completa de arbitragem federada, narração ao vivo e premiação oficial para destaques de cada posição.',
    categories: 'Livre Feminino, Livre Masculino e Sub-18',
    format: 'Chaves regionais + Fase Final Ouro e Prata',
    duration: 'Melhor de 3 sets (Final em melhor de 5 sets)',
    venue: 'Complexos esportivos da região do Vale',
    image:
      'https://images.pexels.com/photos/6203569/pexels-photo-6203569.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
};

export interface MatchScheduleItem {
  id: string;
  date: string;
  time: string;
  modality: ModalityKey;
  category: string;
  teamA: string;
  teamB: string;
  venue: string;
  broadcast: boolean;
  stage: string;
}

export const INITIAL_MATCHES: MatchScheduleItem[] = [
  {
    id: 'm1',
    date: 'Sáb · 16 Mai 2026',
    time: '19:30',
    modality: 'Futsal',
    category: 'Livre Adulto · Grupo A',
    teamA: 'Fênix Club Futsal',
    teamB: 'União do Vale EC',
    venue: 'Ginásio Central do Vale',
    broadcast: true,
    stage: 'Rodada de Abertura',
  },
  {
    id: 'm2',
    date: 'Sáb · 16 Mai 2026',
    time: '21:00',
    modality: 'Futsal',
    category: 'Master 35+ · Grupo B',
    teamA: 'Atlético Blumenauense',
    teamB: 'Real Indaial Futsal',
    venue: 'Ginásio Central do Vale',
    broadcast: true,
    stage: '1ª Rodada',
  },
  {
    id: 'm3',
    date: 'Dom · 17 Mai 2026',
    time: '10:00',
    modality: 'Futebol 7',
    category: 'Livre Masculino',
    teamA: 'Arena FC Society',
    teamB: 'Bairro Garcia United',
    venue: 'Arena Sintética Norte',
    broadcast: true,
    stage: '1ª Rodada',
  },
  {
    id: 'm4',
    date: 'Qua · 20 Mai 2026',
    time: '20:15',
    modality: 'Basquetebol',
    category: 'Adulto Livre',
    teamA: 'Vale United Basquete',
    teamB: ' Brusque Hawks',
    venue: 'Ginásio Poliesportivo Sul',
    broadcast: false,
    stage: 'Fase Classificatória',
  },
  {
    id: 'm5',
    date: 'Dom · 24 Mai 2026',
    time: '15:30',
    modality: 'Voleibol',
    category: 'Livre Feminino',
    teamA: 'Vôlei Futuro Vale',
    teamB: 'Aliança Esportiva SC',
    venue: 'Complexo ACADESF',
    broadcast: true,
    stage: 'Etapa Inaugural',
  },
];

export interface AthleteHighlight {
  id: string;
  name: string;
  modality: ModalityKey;
  award: string;
  teamAndRole: string;
  matches: number;
  scoreLabel: string;
  assistsLabel: string;
  image: string;
}

export const ATHLETES_DATA: AthleteHighlight[] = [
  {
    id: 'atl-1',
    name: 'GABRIEL MENDES',
    modality: 'Futsal',
    award: 'Artilheiro da Copa Vale 2026',
    teamAndRole: 'Fênix Club · Ala / Fixo',
    matches: 12,
    scoreLabel: '18 Gols',
    assistsLabel: '9 Assist.',
    image:
      'https://images.pexels.com/photos/15818644/pexels-photo-15818644.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'atl-2',
    name: 'LUCAS SILVEIRA',
    modality: 'Basquetebol',
    award: 'MVP da Rodada Classificatória',
    teamAndRole: 'Vale United Basquete · Armador',
    matches: 8,
    scoreLabel: '164 Pts',
    assistsLabel: '42 Assist.',
    image:
      'https://images.pexels.com/photos/974516/pexels-photo-974516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'atl-3',
    name: 'MATHEUS BECKER',
    modality: 'Futebol 7',
    award: 'Melhor Jogador do Mês',
    teamAndRole: 'Arena FC · Pivô / Atacante',
    matches: 10,
    scoreLabel: '14 Gols',
    assistsLabel: '6 Assist.',
    image:
      'https://images.pexels.com/photos/13521967/pexels-photo-13521967.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'atl-4',
    name: 'CAMILA HOFFMANN',
    modality: 'Voleibol',
    award: 'Melhor Ponteira · Taça Vale',
    teamAndRole: 'Vôlei Futuro Vale · Ponteira',
    matches: 9,
    scoreLabel: '118 Pts',
    assistsLabel: '24 Aces',
    image:
      'https://images.pexels.com/photos/34544419/pexels-photo-34544419.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export interface NewsArticle {
  id: string;
  number: string;
  tag: string;
  subTag: string;
  title: string;
  excerpt: string;
  fullText: string;
  ctaLabel: string;
  targetPage: 'tv' | 'projetosocial' | 'campeonatos';
  image: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    number: '01',
    tag: 'BROADCAST',
    subTag: 'AO VIVO',
    title: 'NOVA TEMPORADA DE TRANSMISSÕES',
    excerpt:
      'A Arena Vale prepara cobertura técnica e multimídia completa para o esporte regional com câmeras em alta definição e placar em tempo real.',
    fullText:
      'A temporada 2026 da TV Arena Vale eleva o padrão das transmissões esportivas regionais em Santa Catarina. Com operação multicâmera, replays instantâneos, grafismos de placar eletrônico dedicados e equipe de narração e comentários, cada partida ganha visibilidade profissional no YouTube e nas redes sociais oficiais.',
    ctaLabel: 'ACESSAR TV ARENA VALE',
    targetPage: 'tv',
    image:
      'https://images.pexels.com/photos/29803795/pexels-photo-29803795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'news-2',
    number: '02',
    tag: 'PROJETO VALE',
    subTag: 'IMPACTO SOCIAL',
    title: 'INCENTIVO AO ESPORTE COMUNITÁRIO',
    excerpt:
      'Aproximamos marcas, atletas e escolinhas gratuitas com impacto direto em mais de 15 comunidades da região do Vale.',
    fullText:
      'Com 20 anos de dedicação ao esporte comunitário e mais de 1.200 jovens beneficiados gratuitamente, o Projeto Social Arena Vale une formação cidadã, acompanhamento escolar e acesso a treinos estruturados. Empresas parceiras podem associar sua marca diretamente à transformação social da juventude.',
    ctaLabel: 'CONHECER PROJETO SOCIAL',
    targetPage: 'projetosocial',
    image:
      'https://images.pexels.com/photos/8941609/pexels-photo-8941609.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'news-3',
    number: '03',
    tag: 'COMPETIÇÕES',
    subTag: 'OFICIAL',
    title: 'ORGANIZAÇÃO E GESTÃO ESPORTIVA',
    excerpt:
      'Coordenação técnica, súmula digital e arbitragem estruturadas para elevar o nível de todas as competições da temporada.',
    fullText:
      'Da inscrição das equipes à grande final transmitida ao vivo, a Arena Vale oferece gestão esportiva ponta a ponta: delegados de quadra, arbitragem homologada para Futsal, Futebol 7, Basquete e Vôlei, além de estatísticas individuais que destacam os protagonistas da região.',
    ctaLabel: 'VER CAMPEONATOS 2026',
    targetPage: 'campeonatos',
    image:
      'https://images.pexels.com/photos/16393063/pexels-photo-16393063.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export interface HostingOption {
  id: string;
  name: string;
  badge: string;
  cost: string;
  difficulty: string;
  timeToLive: string;
  bestFor: string;
  steps: string[];
  configSnippetTitle: string;
  configSnippet: string;
}

export const NO_VERCEL_HOSTING_OPTIONS: HostingOption[] = [
  {
    id: 'netlify-drop',
    name: '1. Netlify Drop (Sem Git · Arrastar e Soltar)',
    badge: 'MAIS RÁPIDO HOJE (2 MINUTOS)',
    cost: 'R$ 0 / Grátis (com SSL HTTPS automático)',
    difficulty: 'Muito Fácil (não exige terminal nem GitHub)',
    timeToLive: '2 minutos',
    bestFor:
      'Colocar o site no ar imediatamente sem acesso à conta antiga da Vercel e sem precisar configurar repositório.',
    steps: [
      'Gere a pasta de produção estática rodando "npm run build" (cria a pasta dist/).',
      'Crie uma conta gratuita nova em app.netlify.com e acesse app.netlify.com/drop.',
      'Arraste a pasta "dist" inteira para a tela do navegador — o site entra no ar na hora!',
      'Em "Domain Management", conecte seu domínio .com.br apontando o DNS no Registro.br.',
    ],
    configSnippetTitle: 'public/_redirects (Evita erro 404 em rotas SPA no Netlify)',
    configSnippet: `/*    /index.html   200`,
  },
  {
    id: 'cloudflare-pages',
    name: '2. Cloudflare Pages (Melhor Performance no Brasil)',
    badge: 'MELHOR CUSTO-BENEFÍCIO PROFISSIONAL',
    cost: 'R$ 0 / Banda Ilimitada Grátis',
    difficulty: 'Fácil',
    timeToLive: '5 minutos',
    bestFor:
      'Site definitivo de alta audiência em dias de transmissão ao vivo — não cobra por picos de tráfego e tem CDN em dezenas de cidades brasileiras.',
    steps: [
      'Crie uma conta gratuita em dash.cloudflare.com.',
      'Vá em "Workers & Pages" → "Create" → aba "Pages" → "Upload assets" (ou conecte um GitHub novo seu).',
      'Faça upload da pasta "dist" (ou configure Build command: npm run build | Output directory: dist).',
      'Ative o domínio próprio (ex.: arenavalesports.com.br) com certificado SSL e proteção DDoS gratuitos.',
    ],
    configSnippetTitle: 'Configuração de Build no Cloudflare Pages',
    configSnippet: `Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node.js version: 20`,
  },
  {
    id: 'hostinger-cpanel',
    name: '3. Hospedagem Comum (Hostinger, Locaweb, KingHost, cPanel)',
    badge: 'FUNCIONA EM QUALQUER SERVIDOR TRADICIONAL',
    cost: 'Usa a hospedagem que você já tiver',
    difficulty: 'Fácil (Gerenciador de Arquivos / FTP)',
    timeToLive: '5 a 10 minutos',
    bestFor:
      'Quem já possui domínio + hospedagem tradicional com e-mails corporativos (@arenavale.com.br) e quer centralizar tudo num só painel.',
    steps: [
      'Como refizemos o site em React + Vite (estático puro, sem servidor Node/Vercel), ele roda em qualquer hospedagem comum!',
      'Execute "npm run build" para gerar a pasta "dist".',
      'Abra o Gerenciador de Arquivos (cPanel / hPanel) na pasta "public_html" e envie o conteúdo de "dist".',
      'Crie o arquivo ".htaccess" abaixo dentro de "public_html" para habilitar cache e URLs limpas.',
    ],
    configSnippetTitle: 'public_html/.htaccess (Apache / Hostinger / Locaweb)',
    configSnippet: `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`,
  },
  {
    id: 'github-pages',
    name: '4. GitHub Pages (100% Gratuito via Repositório Novo)',
    badge: 'CÓDIGO SOB SEU CONTROLE TOTAL',
    cost: 'R$ 0 / Grátis',
    difficulty: 'Média',
    timeToLive: '8 minutos',
    bestFor:
      'Manter histórico de versões em uma conta GitHub exclusiva da Arena Vale para nunca mais ficar refém de conta de terceiros.',
    steps: [
      'Crie um repositório novo no GitHub oficial da Arena Vale (ex.: arenavale2026).',
      'Suba os arquivos deste projeto e ative Settings → Pages → Source: GitHub Actions.',
      'Adicione o arquivo .github/workflows/deploy.yml abaixo; a cada alteração, o site publica sozinho.',
    ],
    configSnippetTitle: '.github/workflows/deploy.yml (Deploy Automático GitHub Pages)',
    configSnippet: `name: Deploy Arena Vale
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
      - uses: actions/deploy-pages@v4`,
  },
];
