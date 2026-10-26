export interface Patch {
  id: string;
  order: string;
  title: string;
  file: string;
  kind: 'seguranca' | 'conteudo' | 'seo';
  severity: 'critico' | 'alto' | 'medio';
  problem: string;
  howTo: string;
  code: string;
  verify: string;
  expected: string;
}

export const PATCHES: Patch[] = [
  {
    id: 'patch-middleware',
    order: '1',
    title: 'Trancar /proprietario, /coordenador, /moderador e /capitao no servidor',
    file: 'src/middleware.ts  (criar se não existir)',
    kind: 'seguranca',
    severity: 'critico',
    problem:
      'Hoje /proprietario e /coordenador respondem HTTP 200 a qualquer visitante, com tela de "Palavra-passe Mestra" e "credencial de segurança". /moderador e /capitao já estão protegidos (307). A proteção precisa ser centralizada num único middleware e valer para as 4 rotas + /painel.',
    howTo:
      'Salve como src/middleware.ts na raiz do projeto Next.js (junto de app/ ou src/app/). O cookie de sessão deve ser gravado no login. Cargo "proprietario" tem acesso a tudo.',
    code: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Todas as rotas internas exigem sessão autenticada
const PROTEGIDAS = ['/painel', '/proprietario', '/coordenador', '/moderador', '/capitao'];

// Cargo mínimo exigido por rota (você pode gravar em cookie no login)
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

  // 1) Sem sessão: leva ao login guardando o destino
  if (!sessao) {
    const destino = req.nextUrl.clone();
    destino.pathname = '/login';
    destino.search = '?next=' + encodeURIComponent(pathname);
    return NextResponse.redirect(destino);
  }

  // 2) Com sessão, mas sem o cargo exigido: nunca devolve 200
  const exigido = CARGO_MINIMO[pathname];
  if (exigido && cargo !== exigido && cargo !== 'proprietario') {
    return NextResponse.rewrite(new URL('/acesso-negado', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/painel/:path*', '/proprietario', '/coordenador', '/moderador', '/capitao'],
};`,
    verify:
      'for p in proprietario coordenador moderador capitao painel; do echo -n "/$p "; curl -s -o /dev/null -w "%{http_code}\\n" https://SEU-DOMINIO/$p; done',
    expected: 'Esperado: 307 nas 5 rotas. Hoje: 200, 200, 307, 307, 307.',
  },
  {
    id: 'patch-login',
    order: '2',
    title: 'Tela de login sem revelar hierarquia, atalho do proprietário e CFG6',
    file: 'app/login/page.tsx',
    kind: 'seguranca',
    severity: 'alto',
    problem:
      'A página pública lista "Hierarquia: Proprietário, Coordenador, Moderador e Capitão", mostra um botão "⭐ Acesso Rápido: Login do Proprietário" e o selo "ÁREA RESTRITA · CFG6". Isso entrega a um visitante comum o mapa completo da área administrativa.',
    howTo:
      'Substitua o conteúdo do formulário por este bloco genérico. Remova também qualquer botão/atalho que aponte para /proprietario.',
    code: `// app/login/page.tsx — formulário genérico, sem citar cargos
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b13] p-4">
      <form className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0a1120] p-8">
        <h1 className="text-2xl font-black uppercase text-amber-400">Arena Vale</h1>
        <p className="mt-1 text-xs text-slate-400">Acesso restrito · uso interno</p>

        <label className="mt-6 block text-xs font-semibold uppercase text-slate-300">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#070b13] p-3 text-sm text-white"
          />
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase text-slate-300">
          Senha
          <input
            type="password"
            name="senha"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#070b13] p-3 text-sm text-white"
          />
        </label>

        <button className="mt-6 w-full rounded-lg bg-amber-400 py-3 text-sm font-bold text-[#070b13]">
          Entrar
        </button>

        <a href="/" className="mt-5 block text-center text-xs text-slate-500">
          Voltar ao site
        </a>
      </form>
    </main>
  );
}

// REMOVER do arquivo anterior:
//   <p>Hierarquia: Proprietário, Coordenador, Moderador e Capitão</p>
//   <button>⭐ Acesso Rápido: Login do Proprietário</button>
//   <span>ÁREA RESTRITA · CFG6</span>
//   <footer>© ... Configuração CFG6 ...</footer>`,
    verify:
      'curl -s https://SEU-DOMINIO/login | grep -oiE "propriet[aá]rio|coordenador|moderador|capit[aã]o|acesso r[aá]pido|CFG6" | sort | uniq -c',
    expected: 'Esperado: nenhuma linha (0 ocorrências).',
  },
  {
    id: 'patch-rodape',
    order: '3',
    title: 'Rodapé único em todas as páginas (elimina o CFG6 de vez)',
    file: 'src/components/Rodape.tsx  +  usar em app/*/page.tsx',
    kind: 'conteudo',
    severity: 'alto',
    problem:
      'O CFG6 apareceu em /agenda e /login porque essas páginas usam um rodapé próprio. Um componente compartilhado resolve o sintoma e evita que voltem a divergir.',
    howTo:
      'Crie o componente e troque os rodapés das páginas por <Rodape />. Confere o CNPJ antes de publicar: o rodapé exibe 40.694.741/0001-34, mas o domínio arenavale.com.br está registrado em nome de 64.092.049/0001-02.',
    code: `// src/components/Rodape.tsx
export function Rodape() {
  return (
    <footer className="border-t border-white/10 bg-[#050609] px-6 py-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-semibold text-[#8a92a6]">
          O palco do esporte é aqui.
        </p>
        <p className="mt-1 font-mono text-xs text-[#646e82]">
          CNPJ: 40.694.741/0001-34
        </p>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-[#646e82] sm:flex-row">
          <span>© {new Date().getFullYear()} Arena Vale · Mídia Esportiva, Eventos &amp; Projeto Social.</span>
          <nav className="flex items-center gap-4">
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/termos">Termos de Uso</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}`,
    verify: 'for p in "" agenda login tv campeonatos projetosocial; do echo -n "/$p "; curl -s https://SEU-DOMINIO/$p | grep -c "CFG6"; done',
    expected: 'Esperado: 0 em todas as páginas.',
  },
  {
    id: 'patch-campeonatos',
    order: '4',
    title: 'Restaurar o conteúdo de /campeonatos (perdeu 51%)',
    file: 'src/data/campeonatos.ts  +  app/campeonatos/page.tsx',
    kind: 'conteudo',
    severity: 'alto',
    problem:
      'A página passou a renderizar só o título e "A carregar base de dados...", reduzindo 20.286 B → 9.903 B. O texto dos circuitos precisa voltar para o HTML do servidor — conteúdo que só aparece depois do carregamento não entra no índice do Google e some se a API falhar.',
    howTo:
      'Grave os dados num arquivo do projeto e renderize no servidor (server component). A API pode continuar para dados dinâmicos, mas o HTML inicial já precisa conter os campeonatos.',
    code: `// src/data/campeonatos.ts
export const CAMPEONATOS = [
  {
    slug: 'circuito-futsal-2026',
    categoria: 'CIRCUITO 2026',
    titulo: 'Circuito Arena Vale de Futsal 2026',
    status: 'Inscrições abertas · Temporada 2026',
    resumo:
      'O futsal é a modalidade mais tradicional da região do Vale, reunindo equipes de clubes, bairros e empresas em disputas de alto nível técnico dentro de quadra.',
    categorias: 'Sub-15, Sub-20, Livre (adulto) e Master (35+)',
    formato: 'Fase de grupos + mata-mata eliminatório',
    duracao: '2 tempos de 20 min (base) ou 25 min (Livre/Master)',
    local: 'Ginásios parceiros da região do Vale',
  },
  {
    slug: 'copa-futebol-7-2026',
    categoria: 'PRÉ-TEMPORADA',
    titulo: 'Copa Arena Vale de Futebol 7',
    status: 'Em breve · Temporada 2026',
    resumo:
      'Disputado em campos society, o futebol 7 reúne equipes da região em jogos rápidos, com cobertura da TV Arena Vale e arbitragem oficial.',
    categorias: 'Livre Masculino, Feminino e Veteranos (40+)',
    formato: 'Turno classificatório + quartas, semifinal e final',
    duracao: '2 tempos de 25 minutos corridos',
    local: 'Arenas sintéticas parceiras do Vale',
  },
];

// app/campeonatos/page.tsx — renderizado no servidor, sem "A carregar..."
import { CAMPEONATOS } from '@/src/data/campeonatos';

export default function CampeonatosPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-black uppercase">Campeonatos da Arena Vale</h1>
      <div className="mt-10 space-y-10">
        {CAMPEONATOS.map((c) => (
          <article key={c.slug} id={c.slug} className="rounded-3xl border border-white/10 bg-[#11141d] p-8">
            <span className="text-xs font-black uppercase text-[#e50914]">{c.categoria}</span>
            <h2 className="mt-2 text-3xl font-black uppercase">{c.titulo}</h2>
            <p className="mt-1 text-sm font-bold text-amber-400">{c.status}</p>
            <p className="mt-4 text-sm text-[#cad0e0]">{c.resumo}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-4">
              <div><dt className="text-xs font-black text-[#e50914]">Categorias</dt><dd className="text-xs text-white">{c.categorias}</dd></div>
              <div><dt className="text-xs font-black text-[#e50914]">Formato</dt><dd className="text-xs text-white">{c.formato}</dd></div>
              <div><dt className="text-xs font-black text-[#e50914]">Duração</dt><dd className="text-xs text-white">{c.duracao}</dd></div>
              <div><dt className="text-xs font-black text-[#e50914]">Local</dt><dd className="text-xs text-white">{c.local}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </main>
  );
}`,
    verify: 'curl -s https://SEU-DOMINIO/campeonatos | grep -oiE "Circuito|Copa|a carregar" | sort | uniq -c',
    expected: 'Esperado: Circuito e Copa presentes; "a carregar" = 0.',
  },
  {
    id: 'patch-metadata',
    order: '5',
    title: 'Título da home, canonical, noindex do login e URL base por variável',
    file: 'app/layout.tsx  +  app/login/layout.tsx',
    kind: 'seo',
    severity: 'alto',
    problem:
      'A home e /login compartilham o título genérico "Arena Vale Sports". Nenhuma página tem canonical. E o robots.txt declara o sitemap em www.arenavale.com.br, que ainda não responde — o Google não consegue ler seu sitemap.',
    howTo:
      'Centralize a URL base numa variável de ambiente. Assim, quando o DNS do domínio novo ativar, você só muda o valor — sitemap, robots, canonical e Open Graph passam a apontar para o domínio certo sem editar arquivo por arquivo.',
    code: `// .env.local  (criar/ajustar)
NEXT_PUBLIC_SITE_URL="https://arena-vale.vercel.app"
// Quando o DNS do www.arenavale.com.br ativar, troque para:
// NEXT_PUBLIC_SITE_URL="https://www.arenavale.com.br"

// app/layout.tsx
import type { Metadata } from 'next';

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
    images: [{ url: '/og-arena-vale.png', width: 1200, height: 630 }],
  },
};

// app/login/layout.tsx  (página restrita nunca deve aparecer no Google)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acesso Restrito',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}`,
    verify: 'curl -s https://SEU-DOMINIO/ | grep -oE "<title>[^<]*</title>|rel=\\"canonical\\""; curl -s https://SEU-DOMINIO/login | grep -oE "name=\\"robots\\"[^>]*"',
    expected: 'Esperado: home com slogan próprio + canonical presente + robots noindex no login.',
  },
  {
    id: 'patch-sitemap-robots',
    order: '6',
    title: 'Sitemap e robots gerados pelo Next (sem rotas de cargo)',
    file: 'app/sitemap.ts  +  app/robots.ts',
    kind: 'seo',
    severity: 'medio',
    problem:
      'O sitemap atual não inclui /noticias e o robots.txt aponta para um domínio que ainda não responde. As rotas de cargo não podem aparecer em nenhum dos dois.',
    howTo:
      'Com estes arquivos, o Next.js gera /sitemap.xml e /robots.txt no build usando a mesma variável NEXT_PUBLIC_SITE_URL do passo 5.',
    code: `// app/sitemap.ts
import type { MetadataRoute } from 'next';

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

// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arena-vale.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/painel',
        '/proprietario',
        '/coordenador',
        '/moderador',
        '/capitao',
      ],
    },
    sitemap: BASE + '/sitemap.xml',
  };
}`,
    verify: 'curl -s https://SEU-DOMINIO/robots.txt; curl -s https://SEU-DOMINIO/sitemap.xml | grep -cE "proprietario|coordenador|moderador|capitao"',
    expected: 'Esperado: sitemap apontando para o domínio que responde + 0 rotas de cargo listadas.',
  },
  {
    id: 'patch-og-image',
    order: '7',
    title: 'Banner Open Graph gerado por código (1200×630 com escudo e slogan)',
    file: 'app/opengraph-image.tsx',
    kind: 'seo',
    severity: 'medio',
    problem:
      'O og:image aponta para /fundo-arena.jpg, uma foto de arena declarada como 1200×630. Funciona, mas não traz logo nem slogan — é o card que roda no WhatsApp dos patrocinadores.',
    howTo:
      'Este arquivo gera a imagem automaticamente em PNG no build, sem precisar de designer nem arquivo de arte.',
    code: `import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Arena Vale Sports · O palco do esporte é aqui';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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

        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.95 }}>
          O PALCO DO
          <br />
          <span style={{ color: '#e50914' }}>ESPORTE</span> É AQUI
        </div>

        <div style={{ fontSize: 32, color: '#b8c0d4' }}>
          Transmissões ao vivo · Campeonatos · Projeto Social
        </div>
      </div>
    ),
    size
  );
}`,
    verify: 'curl -s -o /dev/null -w "%{http_code} %{content_type}\\n" https://SEU-DOMINIO/opengraph-image',
    expected: 'Esperado: 200 image/png gerada pelo Next (o og:image passa a apontar para ela).',
  },
  {
    id: 'patch-ptbr',
    order: '8',
    title: 'Tabela final de Português do Brasil',
    file: 'busca e substituição em app/  (textos e meta descriptions)',
    kind: 'conteudo',
    severity: 'alto',
    problem:
      'Restam termos de Portugal em páginas internas e, principalmente, nas meta descriptions — que aparecem como texto de prévia nos resultados do Google.',
    howTo:
      'Faça a substituição abaixo em todo o projeto. Depois rode o comando de verificação: ele varre todas as rotas de uma vez.',
    code: `# Terminal, na raiz do projeto — mostra cada ocorrência antes de trocar
grep -rniE "desporto|desportiv|equipas|equipa|multimédia|câmaras|registada|palavra-passe|a carregar|a sua marca|as nossas|TRANSMISSAO|geridos" app/ src/ components/

# Substituições:
#   desporto              -> esporte
#   desportivas/esportiva -> esportivas/esportiva
#   equipas / equipa      -> equipes / equipe
#   multimédia            -> multimídia
#   câmaras               -> câmeras
#   registada             -> registrada
#   palavra-passe         -> senha
#   a carregar            -> carregando
#   a sua marca           -> sua marca
#   as nossas             -> nossas
#   TRANSMISSAO           -> TRANSMISSÃO   (acento)
#   geridos               -> gerenciados

# Exemplo de description corrigida (app/patrocinio):
#   "Associe sua marca ao esporte. Conheça nossas cotas de patrocínio da Arena Vale."`,
    verify: 'for p in "" patrocinio login proprietario atletasdestaques termos agenda; do curl -sL https://SEU-DOMINIO/$p; done | grep -oiE "desport[a-z]*|palavra-passe|transmissao|equipas|a carregar|a sua marca|as nossas|geridos" | sort | uniq -c',
    expected: 'Esperado: nenhuma linha (0 ocorrências).',
  },
  {
    id: 'patch-noticias',
    order: '9',
    title: 'Decidir o destino de /noticias (hoje vazia e fora do sitemap)',
    file: 'app/noticias/page.tsx',
    kind: 'conteudo',
    severity: 'medio',
    problem:
      'A rota responde 200 mas mostra apenas "A carregar base de dados...". Página vazia publicada piora a qualidade percebida pelo Google e frustra quem clica.',
    howTo:
      'Duas opções válidas: publicar os comunicados (recomendado, aproveitando os 3 cards da home) ou redirecionar a rota para a home até ter conteúdo.',
    code: `// OPÇÃO A — redirecionar enquanto não há conteúdo (mínimo em 1 linha)
// next.config.mjs
async redirects() {
  return [{ source: '/noticias', destination: '/#noticias', permanent: false }];
}

// OPÇÃO B — publicar de verdade, com conteúdo estático no servidor
const COMUNICADOS = [
  {
    titulo: 'Nova temporada de transmissões',
    data: '2026-10-20',
    texto: 'A Arena Vale prepara cobertura técnica e multimídia completa para o esporte regional, com câmeras em alta definição.',
  },
  {
    titulo: 'Incentivo ao esporte comunitário',
    data: '2026-10-14',
    texto: 'Aproximamos marcas, atletas e projetos com impacto direto na comunidade esportiva do Vale.',
  },
  {
    titulo: 'Organização e gestão esportiva',
    data: '2026-10-07',
    texto: 'Coordenação e arbitragem estruturadas para elevar o nível técnico de todas as competições da temporada.',
  },
];

export default function NoticiasPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-black uppercase">Comunicados oficiais</h1>
      <div className="mt-8 space-y-6">
        {COMUNICADOS.map((n) => (
          <article key={n.titulo} className="rounded-2xl border border-white/10 bg-[#11141d] p-6">
            <time className="text-xs font-bold text-amber-400">{n.data}</time>
            <h2 className="mt-1 text-2xl font-black uppercase">{n.titulo}</h2>
            <p className="mt-3 text-sm text-[#cad0e0]">{n.texto}</p>
          </article>
        ))}
      </div>
    </main>
  );
}`,
    verify: 'curl -s https://SEU-DOMINIO/noticias | grep -oiE "carregar|comunicado" | sort | uniq -c',
    expected: 'Esperado: títulos de comunicados presentes; "carregar" = 0.',
  },
  {
    id: 'patch-atletas',
    order: '10',
    title: 'Retrato individual para cada atleta em destaque',
    file: 'src/data/atletas.ts  (e uploads em /public/atletas/)',
    kind: 'conteudo',
    severity: 'medio',
    problem:
      'Os cards de Gabriel Mendes, Lucas Silveira e Matheus Becker estão sem foto própria. A página tem uma única imagem (a logo).',
    howTo:
      'Suba retratos próprios (com autorização de uso de imagem dos atletas) e aponte cada ficha para o seu arquivo. Enquanto não houver foto, use um avatar neutro padrão em vez de deixar o espaço vazio.',
    code: `// public/atletas/  -> gabriel-mendes.jpg, lucas-silveira.jpg, matheus-becker.jpg

export const ATLETAS = [
  {
    slug: 'gabriel-mendes',
    nome: 'Gabriel Mendes',
    modalidade: 'Futsal',
    destaque: 'Artilheiro da Copa Vale 2026',
    equipe: 'Fênix Club · Ala/Fixo',
    foto: '/atletas/gabriel-mendes.jpg',   // 800x1000, WebP < 120 KB
  },
  {
    slug: 'lucas-silveira',
    nome: 'Lucas Silveira',
    modalidade: 'Basquetebol',
    destaque: 'MVP da rodada classificatória',
    equipe: 'Vale United · Armador',
    foto: '/atletas/lucas-silveira.jpg',
  },
  {
    slug: 'matheus-becker',
    nome: 'Matheus Becker',
    modalidade: 'Futebol 7',
    destaque: 'Melhor jogador do mês',
    equipe: 'Arena FC · Pivô',
    foto: '/atletas/matheus-becker.jpg',
  },
];

// No card, usar next/image com fallback:
// <Image src={atleta.foto} alt={atleta.nome} width={800} height={1000}
//        onError={(e) => (e.currentTarget.src = '/atletas/avatar-padrao.jpg')} />`,
    verify: `curl -s https://SEU-DOMINIO/atletasdestaques | grep -oE 'src="[^"]*"' | sort | uniq -c`,
    expected: 'Esperado: 1 imagem distinta por atleta (hoje: apenas a logo).',
  },
];

export const APPLY_FLOW = [
  {
    step: '1',
    title: 'Confirme onde está o código',
    detail:
      'Se você tem o projeto na máquina, abra o terminal na pasta. Se só tem o painel da Vercel/GitHub, cada patch indica o caminho do arquivo para criar ou editar.',
  },
  {
    step: '2',
    title: 'Aplique os patches 1 e 2 primeiro',
    detail:
      'São segurança: middleware de acesso e limpeza do login. Podem ser publicados sozinhos, sem depender dos demais.',
  },
  {
    step: '3',
    title: 'Aplique o rodapé único (3) e remonte o CFG6',
    detail:
      'Um único componente de rodapé evita que a etiqueta interna volte a aparecer em páginas novas.',
  },
  {
    step: '4',
    title: 'Conteúdo e SEO (4 a 10)',
    detail:
      'Campeonatos, metadata, sitemap/robots, banner OG, PT-BR, notícias e fotos de atletas.',
  },
  {
    step: '5',
    title: 'Publique e confirme pelo hash',
    detail:
      'O hash atual do build é page-6d4911af914250ac.js. Se após publicar continuar igual, o deploy não entrou.',
  },
  {
    step: '6',
    title: 'Rode a rotina de verificação',
    detail:
      'Cada patch traz o comando de checagem e o resultado esperado. Se quiser, copie o script completo da aba Sincronizar & Publicar.',
  },
];
