/**
 * Conteúdo dos 10 arquivos de correção do site Arena Vale.
 * O zip é gerado no navegador (JSZip) a partir deste mapa — assim o download
 * funciona em qualquer hospedagem, mesmo servindo apenas o index.html.
 */
export interface PatchFile {
  path: string;
  content: string;
}

const MIDDLEWARE = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Arena Vale — proteção centralizada das rotas internas.
 * Coloque em src/middleware.ts (ou middleware.ts na raiz, se o projeto não usa src/).
 *
 * Cookies esperados (grave-os no handler de login, HttpOnly + Secure):
 *   arena_session -> token/ID de sessão
 *   arena_role    -> 'proprietario' | 'coordenador' | 'moderador' | 'capitao'
 */

const PROTEGIDAS = ['/painel', '/proprietario', '/coordenador', '/moderador', '/capitao'];

const CARGO_MINIMO: Record<string, string> = {
  '/proprietario': 'proprietario',
  '/coordenador': 'coordenador',
  '/moderador': 'moderador',
  '/capitao': 'capitao',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protegida = PROTEGIDAS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!protegida) return NextResponse.next();

  const sessao = req.cookies.get('arena_session')?.value;
  const cargo = req.cookies.get('arena_role')?.value;

  // 1) Sem sessão: redireciona ao login guardando o destino
  if (!sessao) {
    const destino = req.nextUrl.clone();
    destino.pathname = '/login';
    destino.search = '?next=' + encodeURIComponent(pathname);
    return NextResponse.redirect(destino);
  }

  // 2) Com sessão, mas sem o cargo exigido: nunca devolve 200
  const base = '/' + pathname.split('/')[1];
  const exigido = CARGO_MINIMO[base];
  if (exigido && cargo !== exigido && cargo !== 'proprietario') {
    return NextResponse.rewrite(new URL('/acesso-negado', req.url), { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/painel/:path*',
    '/proprietario/:path*',
    '/coordenador/:path*',
    '/moderador/:path*',
    '/capitao/:path*',
  ],
};
`;

const ACESSO_NEGADO = `export const metadata = { title: 'Acesso negado', robots: { index: false, follow: false } };

export default function AcessoNegado() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b13] p-6 text-center text-white">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">403</p>
        <h1 className="mt-2 text-3xl font-black uppercase">Acesso negado</h1>
        <p className="mt-2 text-sm text-slate-400">Seu cargo não tem permissão para esta área.</p>
        <a href="/" className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase">
          Voltar ao site
        </a>
      </div>
    </main>
  );
}
`;

const LOGIN_PAGE = `/**
 * Tela de login genérica.
 * REMOVIDO em relação à versão publicada:
 *   - "Hierarquia: Proprietário, Coordenador, Moderador e Capitão"
 *   - botão "⭐ Acesso Rápido: Login do Proprietário"
 *   - selo "ÁREA RESTRITA · CFG6" e rodapé "Configuração CFG6"
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b13] p-4">
      <form
        method="post"
        action="/api/login"
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0a1120] p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-black uppercase tracking-wider text-amber-400">Arena Vale</h1>
        <p className="mt-1 text-xs text-slate-400">Acesso restrito · uso interno</p>

        <label className="mt-6 block text-xs font-semibold uppercase text-slate-300">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#070b13] p-3 text-sm text-white focus:border-amber-400 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase text-slate-300">
          Senha
          <input
            type="password"
            name="senha"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#070b13] p-3 text-sm text-white focus:border-amber-400 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-amber-400 py-3 text-sm font-bold text-[#070b13] transition hover:bg-amber-300"
        >
          Entrar
        </button>

        <a href="/" className="mt-5 block text-center text-xs text-slate-500 hover:text-slate-300">
          Voltar ao site
        </a>
      </form>
    </main>
  );
}
`;

const LOGIN_LAYOUT = `import type { Metadata } from 'next';

// Página restrita: nunca deve aparecer no Google
export const metadata: Metadata = {
  title: 'Acesso Restrito',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

const RODAPE = `/**
 * Rodapé único para TODAS as páginas.
 * Troque qualquer <footer> próprio das páginas por <Rodape />.
 * Isso elimina de vez o "CFG6" que voltou em /agenda e /login.
 *
 * ATENÇÃO: confira o CNPJ. O rodapé publicado exibe 40.694.741/0001-34,
 * mas o domínio arenavale.com.br está registrado em nome de 64.092.049/0001-02.
 */
export function Rodape() {
  return (
    <footer className="border-t border-white/10 bg-[#050609] px-6 py-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-semibold text-[#8a92a6]">O palco do esporte é aqui.</p>
        <p className="mt-1 font-mono text-xs text-[#646e82]">CNPJ: 40.694.741/0001-34</p>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-[#646e82] sm:flex-row">
          <span>
            © {new Date().getFullYear()} Arena Vale · Mídia Esportiva, Eventos &amp; Projeto Social. Todos os
            direitos reservados.
          </span>
          <nav className="flex items-center gap-4">
            <a href="/privacidade" className="underline underline-offset-4 hover:text-white">
              Política de Privacidade
            </a>
            <a href="/termos" className="underline underline-offset-4 hover:text-white">
              Termos de Uso
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
`;

const CAMPEONATOS_DATA = `export interface Campeonato {
  slug: string;
  modalidade: 'Futsal' | 'Futebol 7' | 'Basquetebol' | 'Voleibol';
  categoria: string;
  titulo: string;
  status: string;
  resumo: string;
  categorias: string;
  formato: string;
  duracao: string;
  local: string;
}

export const CAMPEONATOS: Campeonato[] = [
  {
    slug: 'circuito-futsal-2026',
    modalidade: 'Futsal',
    categoria: 'CIRCUITO 2026',
    titulo: 'Circuito Arena Vale de Futsal 2026',
    status: 'Inscrições abertas · Temporada 2026',
    resumo:
      'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra. O Circuito organiza a temporada em fase de grupos seguida de mata-mata, com transmissão ao vivo das principais partidas pela TV Arena Vale.',
    categorias: 'Sub-15, Sub-20, Livre (adulto) e Master (35+)',
    formato: 'Fase de grupos + mata-mata eliminatório',
    duracao: '2 tempos de 20 min (base) ou 25 min (Livre/Master)',
    local: 'Ginásios parceiros da região do Vale',
  },
  {
    slug: 'copa-futebol-7-2026',
    modalidade: 'Futebol 7',
    categoria: 'PRÉ-TEMPORADA',
    titulo: 'Copa Arena Vale de Futebol 7',
    status: 'Em breve · Temporada 2026',
    resumo:
      'Disputado em campos society, o futebol 7 reúne equipes da região em jogos rápidos e intensos, com cobertura da TV Arena Vale, súmula digital e arbitragem oficial.',
    categorias: 'Livre Masculino, Feminino e Veteranos (40+)',
    formato: 'Turno classificatório + quartas, semifinal e final',
    duracao: '2 tempos de 25 minutos corridos',
    local: 'Arenas sintéticas parceiras do Vale',
  },
  {
    slug: 'liga-basquete-2026',
    modalidade: 'Basquetebol',
    categoria: 'LIGA REGIONAL',
    titulo: 'Liga Regional Arena Vale de Basquetebol',
    status: 'Calendário em definição · 2026',
    resumo:
      'O basquete regional ganha palco profissional com placar eletrônico integrado à transmissão, eleição do MVP da rodada e cobertura fotográfica dedicada.',
    categorias: 'Sub-19 e Adulto Livre',
    formato: 'Temporada regular + playoffs',
    duracao: '4 quartos de 10 minutos',
    local: 'Ginásios municipais e clubes parceiros',
  },
  {
    slug: 'taca-volei-2026',
    modalidade: 'Voleibol',
    categoria: 'TAÇA VALE',
    titulo: 'Taça Arena Vale de Voleibol',
    status: 'Pré-inscrição aberta · 2026',
    resumo:
      'Equipes femininas, masculinas e mistas em etapas regionais, com arbitragem federada, narração ao vivo e premiação oficial.',
    categorias: 'Livre Feminino, Livre Masculino e Sub-18',
    formato: 'Chaves regionais + fase final',
    duracao: 'Melhor de 3 sets (final em melhor de 5)',
    local: 'Complexos esportivos da região do Vale',
  },
];
`;

const CAMPEONATOS_PAGE = `import type { Metadata } from 'next';
import { CAMPEONATOS } from '@/src/data/campeonatos';
import { Rodape } from '@/src/components/Rodape';

export const metadata: Metadata = {
  title: 'Campeonatos e Competições',
  description:
    'Circuito de Futsal, Copa de Futebol 7, Liga de Basquetebol e Taça de Voleibol: conheça os campeonatos oficiais da Arena Vale na temporada 2026.',
};

const WHATS = '5547988444404';
const wa = (msg: string) => \`https://wa.me/\${WHATS}?text=\${encodeURIComponent(msg)}\`;

/**
 * Renderizado no servidor: o conteúdo entra no HTML inicial
 * (indexável pelo Google e visível mesmo se uma API falhar).
 * Substitui a versão que exibia apenas "A carregar base de dados...".
 */
export default function CampeonatosPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-16 text-white">
        <a href="/" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white">
          ← Voltar ao início
        </a>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">Competições oficiais</p>
        <h1 className="mt-2 text-4xl font-black uppercase sm:text-5xl">Campeonatos da temporada 2026</h1>

        <div className="mt-10 space-y-8">
          {CAMPEONATOS.map((c) => (
            <article key={c.slug} id={c.slug} className="rounded-3xl border border-white/10 bg-[#11141d] p-8">
              <span className="rounded-full bg-[#e50914]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#e50914]">
                {c.categoria}
              </span>
              <h2 className="mt-3 text-3xl font-black uppercase">{c.titulo}</h2>
              <p className="mt-1 text-sm font-bold uppercase text-amber-400">{c.status}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#cad0e0]">{c.resumo}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Categorias', c.categorias],
                  ['Formato', c.formato],
                  ['Duração da partida', c.duracao],
                  ['Local', c.local],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-[#e50914]">{k}</dt>
                    <dd className="mt-1 text-xs font-bold text-white">{v}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={wa(\`Olá! Quero inscrever minha equipe no \${c.titulo}.\`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#ff1e27]"
              >
                Inscrever equipe ↗
              </a>
            </article>
          ))}
        </div>
      </main>
      <Rodape />
    </>
  );
}
`;

const LAYOUT = `import type { Metadata } from 'next';
import './globals.css';

/**
 * URL base por variável de ambiente.
 * Hoje:   NEXT_PUBLIC_SITE_URL=https://arena-vale.vercel.app
 * Depois: NEXT_PUBLIC_SITE_URL=https://www.arenavale.com.br  (quando o DNS ativar)
 * Sitemap, robots, canonical e Open Graph seguem essa variável automaticamente.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arena-vale.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  alternates: { canonical: './' },
  title: {
    default: 'Arena Vale Sports | O Palco do Esporte no Vale',
    template: '%s | Arena Vale Sports',
  },
  description:
    'Transmissões esportivas ao vivo, campeonatos de futsal, futebol 7, basquete e vôlei, atletas em destaque e Projeto Social na região do Vale.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Arena Vale',
    title: 'Arena Vale Sports | O Palco do Esporte no Vale',
    description:
      'Acompanhe transmissões ao vivo, campeonatos oficiais e o Projeto Social que transforma vidas pelo esporte.',
    // app/opengraph-image.tsx gera a imagem automaticamente
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#070b13] text-white antialiased">{children}</body>
    </html>
  );
}
`;

const ENV_EXAMPLE = `# Copie para .env.local e ajuste.
# Enquanto o DNS do domínio próprio não ativar, mantenha o endereço que responde:
NEXT_PUBLIC_SITE_URL=https://arena-vale.vercel.app

# Quando www.arenavale.com.br estiver no ar (A 76.76.21.21 no apex + CNAME cname.vercel-dns.com no www):
# NEXT_PUBLIC_SITE_URL=https://www.arenavale.com.br
`;

const SITEMAP = `import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arena-vale.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  // Rotas de cargo (proprietario/coordenador/moderador/capitao) NUNCA entram aqui.
  const rotas = [
    '',
    '/tv',
    '/agenda',
    '/atletasdestaques',
    '/campeonatos',
    '/patrocinio',
    '/projetosocial',
    '/noticias',
    '/privacidade',
    '/termos',
  ];

  return rotas.map((rota) => ({
    url: BASE + rota,
    lastModified: new Date(),
    changeFrequency: rota === '' || rota === '/agenda' ? 'daily' : 'weekly',
    priority: rota === '' ? 1 : 0.8,
  }));
}
`;

const ROBOTS = `import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arena-vale.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/painel', '/proprietario', '/coordenador', '/moderador', '/capitao', '/acesso-negado'],
    },
    sitemap: BASE + '/sitemap.xml',
  };
}
`;

const OG_IMAGE = `import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Arena Vale Sports · O palco do esporte é aqui';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Gera o banner 1200x630 automaticamente — substitui a foto genérica /fundo-arena.jpg no WhatsApp.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 70,
          background: 'linear-gradient(135deg, #07080c 0%, #17090c 60%, #2b0b10 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 18,
              background: '#e50914',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              fontWeight: 900,
            }}
          >
            AV
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 8 }}>ARENA VALE</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 96, fontWeight: 900, lineHeight: 0.95 }}>
          <span>O PALCO DO</span>
          <span>
            <span style={{ color: '#e50914' }}>ESPORTE</span> É AQUI
          </span>
        </div>

        <div style={{ fontSize: 32, color: '#b8c0d4' }}>Transmissões ao vivo · Campeonatos · Projeto Social</div>
      </div>
    ),
    size
  );
}
`;

const NOTICIAS_PAGE = `import type { Metadata } from 'next';
import { Rodape } from '@/src/components/Rodape';

export const metadata: Metadata = {
  title: 'Comunicados Oficiais',
  description: 'Notícias e comunicados oficiais da Arena Vale: transmissões, campeonatos e Projeto Social.',
};

// Conteúdo estático renderizado no servidor (substitui "A carregar base de dados...").
const COMUNICADOS = [
  {
    slug: 'nova-temporada-transmissoes',
    titulo: 'Nova temporada de transmissões',
    data: '2026-10-20',
    texto:
      'A Arena Vale prepara cobertura técnica e multimídia completa para o esporte regional, com câmeras em alta definição, replays e placar eletrônico integrado à transmissão.',
  },
  {
    slug: 'incentivo-esporte-comunitario',
    titulo: 'Incentivo ao esporte comunitário',
    data: '2026-10-14',
    texto:
      'Aproximamos marcas, atletas e projetos com impacto direto na comunidade esportiva do Vale. Conheça o Projeto Social e as formas de apoiar.',
  },
  {
    slug: 'organizacao-gestao-esportiva',
    titulo: 'Organização e gestão esportiva',
    data: '2026-10-07',
    texto:
      'Coordenação técnica, súmula digital e arbitragem estruturadas para elevar o nível de todas as competições da temporada 2026.',
  },
];

export default function NoticiasPage() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-16 text-white">
        <a href="/" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white">
          ← Voltar ao início
        </a>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[#e50914]">Arena Press</p>
        <h1 className="mt-2 text-4xl font-black uppercase sm:text-5xl">Comunicados oficiais</h1>

        <div className="mt-10 space-y-6">
          {COMUNICADOS.map((n) => (
            <article key={n.slug} id={n.slug} className="rounded-2xl border border-white/10 bg-[#11141d] p-6">
              <time dateTime={n.data} className="text-xs font-bold uppercase text-amber-400">
                {new Date(n.data).toLocaleDateString('pt-BR')}
              </time>
              <h2 className="mt-1 text-2xl font-black uppercase">{n.titulo}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#cad0e0]">{n.texto}</p>
            </article>
          ))}
        </div>
      </main>
      <Rodape />
    </>
  );
}
`;

const ATLETAS_DATA = `/**
 * Suba os retratos em /public/atletas/ (800x1000, WebP ou JPG < 120 KB)
 * com autorização de uso de imagem de cada atleta.
 * Enquanto não houver foto, o card usa /atletas/avatar-padrao.svg (incluído neste pacote).
 */
export interface Atleta {
  slug: string;
  nome: string;
  modalidade: 'Futsal' | 'Futebol 7' | 'Basquetebol' | 'Voleibol';
  destaque: string;
  equipe: string;
  jogos: number;
  marca: string;
  assistencias: string;
  foto: string;
}

export const ATLETAS: Atleta[] = [
  {
    slug: 'gabriel-mendes',
    nome: 'Gabriel Mendes',
    modalidade: 'Futsal',
    destaque: 'Artilheiro da Copa Vale 2026',
    equipe: 'Fênix Club · Ala/Fixo',
    jogos: 12,
    marca: '18 gols',
    assistencias: '9 assist.',
    foto: '/atletas/gabriel-mendes.jpg',
  },
  {
    slug: 'lucas-silveira',
    nome: 'Lucas Silveira',
    modalidade: 'Basquetebol',
    destaque: 'MVP da rodada classificatória',
    equipe: 'Vale United · Armador',
    jogos: 8,
    marca: '164 pontos',
    assistencias: '42 assist.',
    foto: '/atletas/lucas-silveira.jpg',
  },
  {
    slug: 'matheus-becker',
    nome: 'Matheus Becker',
    modalidade: 'Futebol 7',
    destaque: 'Melhor jogador do mês',
    equipe: 'Arena FC · Pivô',
    jogos: 10,
    marca: '14 gols',
    assistencias: '6 assist.',
    foto: '/atletas/matheus-becker.jpg',
  },
];

export const AVATAR_PADRAO = '/atletas/avatar-padrao.svg';
`;

const AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1f2e"/>
      <stop offset="1" stop-color="#0a0c14"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <circle cx="400" cy="380" r="150" fill="#2a3042"/>
  <path d="M130 900c0-170 120-290 270-290s270 120 270 290z" fill="#2a3042"/>
  <rect x="0" y="930" width="800" height="70" fill="#e50914"/>
  <text x="400" y="978" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#fff" letter-spacing="6">ARENA VALE</text>
</svg>
`;

const FOTOS_TXT = `Suba aqui os retratos dos atletas (800x1000 px, WebP ou JPG abaixo de 120 KB):

  gabriel-mendes.jpg
  lucas-silveira.jpg
  matheus-becker.jpg

Exija autorização de uso de imagem por escrito de cada atleta (ou do responsável, se menor de idade).
Enquanto a foto não existir, o card usa avatar-padrao.svg.
`;

const SCRIPT_PTBR = `#!/usr/bin/env bash
# Lista todas as ocorrências de Português de Portugal que ainda precisam ser trocadas.
# Rode na raiz do projeto:  bash scripts-ptbr.sh
# Depois faça a substituição no editor (ou com sed, revisando cada caso).

echo "== Ocorrências a corrigir =="
grep -rniE "desporto|desportiv|equipas|\\bequipa\\b|multimédia|câmaras|registada|palavra-passe|a carregar|a sua marca|as nossas|TRANSMISSAO|geridos" \\
  --include=*.tsx --include=*.ts --include=*.mdx --include=*.json \\
  app/ src/ components/ 2>/dev/null || true

cat <<'TABELA'

== Tabela de substituição ==
  desporto              -> esporte
  desportivas/desportiva-> esportivas/esportiva
  desportivo            -> esportivo
  equipas / equipa      -> equipes / equipe
  multimédia            -> multimídia
  câmaras               -> câmeras
  registada             -> registrada
  palavra-passe         -> senha
  a carregar            -> carregando
  a sua marca           -> sua marca
  as nossas             -> nossas
  TRANSMISSAO           -> TRANSMISSÃO  (acento)
  geridos               -> gerenciados

Exemplo de meta description corrigida (app/patrocinio/page.tsx):
  "Associe sua marca ao esporte. Conheça nossas cotas de patrocínio da Arena Vale."
TABELA
`;

const VERIFICAR = `#!/usr/bin/env bash
# Rotina de verificação pós-deploy — Arena Vale Sports
# Uso:  bash verificar-arena.sh                       (testa arena-vale.vercel.app)
#       bash verificar-arena.sh https://www.arenavale.com.br
DOMAIN="\${1:-https://arena-vale.vercel.app}"
ok(){ printf "  \\033[32m✔\\033[0m %s\\n" "$1"; }
bad(){ printf "  \\033[31m✘\\033[0m %s\\n" "$1"; }

echo "== BUILD (antes das correções era page-6d4911af914250ac.js) =="
curl -s "$DOMAIN/" | grep -oE "page-[a-z0-9]+\\.js" | sort -u | sed 's/^/  /'

echo; echo "== ROTAS DE CARGO — todas devem redirecionar (307) =="
for p in proprietario coordenador moderador capitao painel; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/$p")
  [ "$c" = "307" ] && ok "/$p -> $c" || bad "/$p -> $c (esperado 307)"
done

echo; echo "== LOGIN — não pode revelar hierarquia nem CFG6 =="
n=$(curl -s "$DOMAIN/login" | grep -oiE "propriet[aá]rio|coordenador|moderador|capit[aã]o|acesso r[aá]pido|CFG6" | wc -l)
[ "$n" = "0" ] && ok "login limpo" || bad "login ainda expõe $n termo(s)"

echo; echo "== CFG6 em todas as páginas (esperado 0) =="
n=$(for p in "" agenda login tv campeonatos projetosocial atletasdestaques patrocinio privacidade termos noticias; do curl -sL "$DOMAIN/$p"; done | grep -c "CFG6")
[ "$n" = "0" ] && ok "0 ocorrências" || bad "$n ocorrência(s) de CFG6"

echo; echo "== /campeonatos e /noticias renderizados no servidor =="
c=$(curl -s "$DOMAIN/campeonatos" | grep -ci "a carregar"); [ "$c" = "0" ] && ok "/campeonatos sem 'a carregar'" || bad "/campeonatos ainda com 'a carregar'"
c=$(curl -s "$DOMAIN/campeonatos" | grep -ci "Circuito"); [ "$c" -gt 0 ] && ok "/campeonatos lista os circuitos" || bad "/campeonatos sem conteúdo"
c=$(curl -s "$DOMAIN/noticias" | grep -ci "a carregar"); [ "$c" = "0" ] && ok "/noticias sem 'a carregar'" || bad "/noticias ainda com 'a carregar'"

echo; echo "== PT-BR (esperado 0) =="
n=$(for p in "" patrocinio login atletasdestaques termos agenda campeonatos tv; do curl -sL "$DOMAIN/$p"; done | grep -oiE "desport[a-z]*|palavra-passe|transmissao|equipas|a carregar|a sua marca|as nossas|geridos" | wc -l)
[ "$n" = "0" ] && ok "nenhum termo PT-PT" || bad "$n termo(s) PT-PT restante(s)"

echo; echo "== SEO =="
curl -s "$DOMAIN/" | grep -qE 'rel="canonical"' && ok "canonical presente" || bad "canonical ausente"
curl -s "$DOMAIN/login" | grep -qiE 'name="robots"[^>]*noindex' && ok "/login com noindex" || bad "/login sem noindex"
t=$(curl -s "$DOMAIN/" | grep -oE "<title>[^<]*</title>"); echo "  título home: $t"
c=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/opengraph-image"); [ "$c" = "200" ] && ok "opengraph-image gerada" || bad "opengraph-image -> $c"
n=$(curl -s "$DOMAIN/sitemap.xml" | grep -cE "proprietario|coordenador|moderador|capitao"); [ "$n" = "0" ] && ok "sitemap sem rotas de cargo" || bad "sitemap lista rotas de cargo"
echo "  robots.txt:"; curl -s "$DOMAIN/robots.txt" | sed 's/^/    /'

echo; echo "== Não pode regredir =="
c=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/manifest.json"); [ "$c" = "200" ] && ok "manifest.json 200" || bad "manifest.json $c"
c=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/favicon.ico"); [ "$c" = "200" ] && ok "favicon.ico 200" || bad "favicon.ico $c"
s=$(curl -s -o /dev/null -w '%{size_download}' "$DOMAIN/fundo-arena.jpg"); [ "$s" -lt 350000 ] && ok "fundo-arena.jpg \${s} B" || bad "fundo-arena.jpg \${s} B (esperado < 350000)"

echo; echo "== Domínio próprio =="
st=$(curl -s -H "accept: application/dns-json" "https://dns.google/resolve?name=www.arenavale.com.br&type=A" | grep -oE '"Status":[0-9]' | head -1)
[ "$st" = '"Status":0' ] && ok "www.arenavale.com.br resolve" || bad "www.arenavale.com.br sem DNS ($st) — crie A 76.76.21.21 no apex e CNAME cname.vercel-dns.com no www"
`;

const LEIA_ME = `# Arena Vale — Pacote de Correções (5ª conferência · 26/10/2026)

Extraia este zip **na raiz do projeto Next.js** (a pasta onde ficam \`app/\`, \`package.json\` e \`next.config\`).
Os arquivos já estão nos caminhos corretos. Onde já existir arquivo, substitua.

> Se o seu projeto usa \`src/app/\` em vez de \`app/\`, mova as pastas de \`app/\` para \`src/app/\`
> e troque \`@/src/...\` por \`@/...\` nos imports.

## O que está incluído (10 correções)

| # | Arquivo | Corrige |
|---|---|---|
| 1 | \`src/middleware.ts\` + \`app/acesso-negado/page.tsx\` | **/proprietario e /coordenador abertos (HTTP 200)** → 307 para /login, com cargo mínimo por rota |
| 2 | \`app/login/page.tsx\` + \`app/login/layout.tsx\` | Login revelando "Hierarquia: Proprietário, Coordenador…", botão "Acesso Rápido do Proprietário" e CFG6 · adiciona \`noindex\` |
| 3 | \`src/components/Rodape.tsx\` | Rodapé único — elimina o CFG6 que voltou em /agenda e /login |
| 4 | \`src/data/campeonatos.ts\` + \`app/campeonatos/page.tsx\` | /campeonatos esvaziada ("A carregar base de dados…") → conteúdo no servidor |
| 5 | \`app/layout.tsx\` + \`.env.example\` | Título da home, canonical, Open Graph e **URL base por variável** (troca de domínio sem editar arquivos) |
| 6 | \`app/sitemap.ts\` + \`app/robots.ts\` | Sitemap/robots gerados pelo Next, sem rotas de cargo, apontando para o domínio que responde |
| 7 | \`app/opengraph-image.tsx\` | Banner 1200×630 gerado por código (substitui a foto genérica no WhatsApp) |
| 8 | \`app/noticias/page.tsx\` | /noticias vazia → 3 comunicados renderizados no servidor |
| 9 | \`src/data/atletas.ts\` + \`public/atletas/\` | Fichas dos atletas com foto individual + avatar padrão |
| 10 | \`scripts-ptbr.sh\` | Localiza todo PT-PT restante (desporto, palavra-passe, TRANSMISSAO, geridos…) |

## Ordem de aplicação

1. **Segurança primeiro** — arquivos 1 e 2. Podem ser publicados sozinhos hoje.
2. Rodapé único (3): troque qualquer \`<footer>\` das páginas por \`<Rodape />\`.
3. Conteúdo e SEO (4 a 9).
4. \`bash scripts-ptbr.sh\` e corrija as ocorrências listadas.
5. Crie \`.env.local\` a partir de \`.env.example\`.

## Publicar

\`\`\`bash
npm install
npm run build          # precisa compilar sem erro
npx vercel --prod      # ou: git add . && git commit -m "fix: seguranca, conteudo, seo" && git push
\`\`\`

## Confirmar no ar

\`\`\`bash
bash verificar-arena.sh
# ou, quando o domínio próprio ativar:
bash verificar-arena.sh https://www.arenavale.com.br
\`\`\`

Cada linha sai com ✔ ou ✘ e o valor esperado. Se o hash do build continuar
\`page-6d4911af914250ac.js\`, o deploy não entrou.

## Dois pontos que dependem de você

- **DNS do domínio**: \`arenavale.com.br\` está registrado, mas a zona não tem registro A/CNAME.
  No Registro.br → DNS → editar zona: \`A 76.76.21.21\` no apex e \`CNAME cname.vercel-dns.com\` no \`www\`.
  Depois adicione os dois em Vercel → Settings → Domains e troque \`NEXT_PUBLIC_SITE_URL\`.
- **CNPJ**: o rodapé exibe \`40.694.741/0001-34\`; o domínio está registrado em nome de \`64.092.049/0001-02\`.
  Confirme qual é o correto antes de fechar patrocínios.

## Cookies esperados pelo middleware

O handler de login (\`/api/login\`) deve gravar, como \`HttpOnly; Secure; SameSite=Lax\`:

- \`arena_session\` — token/ID de sessão
- \`arena_role\` — \`proprietario\` | \`coordenador\` | \`moderador\` | \`capitao\`

Sem \`arena_session\` → 307 para \`/login?next=…\`. Com sessão mas cargo insuficiente → 403.
`;

export const PATCH_FILES: PatchFile[] = [
  { path: 'LEIA-ME.md', content: LEIA_ME },
  { path: 'verificar-arena.sh', content: VERIFICAR },
  { path: 'scripts-ptbr.sh', content: SCRIPT_PTBR },
  { path: '.env.example', content: ENV_EXAMPLE },
  { path: 'src/middleware.ts', content: MIDDLEWARE },
  { path: 'src/components/Rodape.tsx', content: RODAPE },
  { path: 'src/data/campeonatos.ts', content: CAMPEONATOS_DATA },
  { path: 'src/data/atletas.ts', content: ATLETAS_DATA },
  { path: 'app/layout.tsx', content: LAYOUT },
  { path: 'app/sitemap.ts', content: SITEMAP },
  { path: 'app/robots.ts', content: ROBOTS },
  { path: 'app/opengraph-image.tsx', content: OG_IMAGE },
  { path: 'app/login/page.tsx', content: LOGIN_PAGE },
  { path: 'app/login/layout.tsx', content: LOGIN_LAYOUT },
  { path: 'app/campeonatos/page.tsx', content: CAMPEONATOS_PAGE },
  { path: 'app/noticias/page.tsx', content: NOTICIAS_PAGE },
  { path: 'app/acesso-negado/page.tsx', content: ACESSO_NEGADO },
  { path: 'public/atletas/avatar-padrao.svg', content: AVATAR_SVG },
  { path: 'public/atletas/COLOQUE-AS-FOTOS-AQUI.txt', content: FOTOS_TXT },
];

export const PATCH_ZIP_NAME = 'arena-vale-correcoes.zip';
export const PATCH_ROOT_FOLDER = 'arena-vale-patch';
