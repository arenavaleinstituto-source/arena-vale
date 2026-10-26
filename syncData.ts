export type SyncStatus = 'no-ar' | 'pendente';
export type SyncSeverity = 'critico' | 'alto' | 'medio';

export interface SyncItem {
  id: string;
  title: string;
  status: SyncStatus;
  severity?: SyncSeverity;
  area: string;
  wave?: 2 | 3 | 4 | 5;
  before?: string;
  after?: string;
  evidence: string;
  effort?: string;
  verifyLabel?: string;
  verifyCommand?: string;
  expected?: string;
}

export interface BuildRecord {
  label: string;
  js: string;
  css: string;
  etag?: string;
  when: string;
  fixes: number;
  current?: boolean;
  note: string;
}

export const BUILD_TIMELINE: BuildRecord[] = [
  {
    label: 'Build 1 · Auditoria inicial',
    js: 'page-adc196894735c5c6.js',
    css: '51956b253d258784.css',
    when: '22/10/2026 · 1ª conferência',
    fixes: 0,
    note: 'Estado original: /painel aberto em 200, /campeonatos 404, imagem de 2,87 MB, zero Open Graph.',
  },
  {
    label: 'Build 2 · 1º deploy',
    js: 'page-185ccac4f9667bfe.js',
    css: 'cbd6913da5a760f8.css',
    when: '23/10/2026 · 03:39 UTC',
    fixes: 6,
    note: 'Corrigiu o %2520 do WhatsApp, ligou a Home à página /projetosocial e reescreveu /tv e /agenda.',
  },
  {
    label: 'Build 3 · 2º deploy',
    js: 'page-e3b9d481e3cc4877.js',
    css: '60ab1aa0b779e3ec.css',
    when: '23/10/2026 · 04:44 UTC',
    fixes: 11,
    note: 'Eliminou os 4 bloqueantes: /painel 307, /campeonatos 200, manifest 200, imagem −89%, Open Graph completo.',
  },
  {
    label: 'Build 4 · 3º deploy',
    js: 'page-d4ac1211a282b6de.js',
    css: '572911f239727220.css',
    when: '25/10/2026 · 01:43 UTC',
    fixes: 4,
    note: 'Favicon e ícones no ar, agenda com jogos, logo quebrada corrigida, último CFG6 removido, home 100% PT-BR.',
  },
  {
    label: 'Build 5 · Deploy atual',
    js: 'page-6d4911af914250ac.js',
    css: '8b6bf2dad2244c33.css',
    etag: '9c644def509570ac76a4361330d25f49',
    when: '26/10/2026 · 07:21 UTC (5ª conferência)',
    fixes: 5,
    current: true,
    note: 'Trouxe melhorias de conteúdo, mas criou 5 rotas de cargo sem pedido — e deixou Proprietário e Coordenador acessíveis sem login.',
  },
];

export const BUILD_FINGERPRINT = {
  site: 'https://arena-vale.vercel.app',
  buildAnterior: 'page-d4ac1211a282b6de.js',
  buildAtual: 'page-6d4911af914250ac.js',
  cssAnterior: '572911f239727220.css',
  cssAtual: '8b6bf2dad2244c33.css',
  etag: '9c644def509570ac76a4361330d25f49',
  deployEm: '26/10/2026 · 07:21 UTC',
  cache: 'HIT (x-vercel-cache) · age 130s',
  servidor: 'Vercel · HTML home 49.986 bytes (−808 vs build 4)',
  hsts: 'strict-transport-security ativo (63072000s, preload)',
  mudou: true,
};

export const SCAN_HEADLINE = {
  conference: 5,
  blockersBefore: 4,
  blockersNow: 0,
  newRoutesFound: 5,
  newBlockers: 2,
  regressions: 3,
};

export const DOMAIN_STATUS = {
  declaradoNoRobots: 'https://www.arenavale.com.br',
  resolucaoDns:
    'Domínio REGISTRADO no Registro.br (RDAP 200) com NS a.sec.dns.br / b.sec.dns.br e DNSSEC assinado — mas a zona segue sem registro A/AAAA e o www retorna NXDOMAIN. Falta criar os apontamentos.',
  testadoEm: '26/10/2026 · 07:25 UTC (re-testado nesta conferência, sem mudança)',
  sitemapReal: 'https://arena-vale.vercel.app/sitemap.xml (7 URLs, todas 200)',
};

export const NEW_ROUTES_SCAN = [
  { path: '/proprietario', status: 200, size: '10.728 B', state: 'critico', note: 'Tela "👑 ALTA ADMINISTRAÇÃO · Acesso do Proprietário" com campo "Palavra-passe Mestra" — acessível a qualquer visitante.' },
  { path: '/coordenador', status: 200, size: '9.315 B', state: 'critico', note: 'Tela "🔒 ÁREA PROTEGIDA · Digite a credencial de segurança" — pública, sem redirect.' },
  { path: '/moderador', status: 307, size: '→ /login?next=/moderador', state: 'ok', note: 'Protegida corretamente no servidor.' },
  { path: '/capitao', status: 307, size: '→ /login?next=/capitao', state: 'ok', note: 'Protegida corretamente no servidor.' },
  { path: '/painel/usuarios', status: 307, size: '15 B', state: 'ok', note: 'Protegida corretamente no servidor.' },
  { path: '/noticias', status: 200, size: '9.763 B', state: 'alerta', note: 'Página criada mas vazia: "A carregar base de dados..." e fora do sitemap.' },
];

export const SYNC_ITEMS: SyncItem[] = [
  /* ========== BUILD 5 — NESTA 5ª CONFERÊNCIA (5) ========== */
  {
    id: 'w5-app-cta',
    title: 'CTA do aplicativo ajustado (não prometia download)',
    status: 'no-ar',
    wave: 5,
    area: 'Conversão',
    before: '"BAIXE O APLICATIVO ARENA VALE" + botão "INSTALAR O APP ↗" abrindo o WhatsApp',
    after: '"CONHEÇA O APLICATIVO ARENA VALE" + botão "SAIBA MAIS PELO WHATSAPP ↗"',
    evidence:
      'Era exatamente a recomendação da 1ª conferência: o texto agora condiz com o destino real do clique, sem criar expectativa de loja de aplicativos.',
  },
  {
    id: 'w5-noticias-ptbr',
    title: 'Cards de notícias convertidos para PT-BR',
    status: 'no-ar',
    wave: 5,
    area: 'Revisão PT-BR',
    before: '"cobertura técnica e multimédia… com câmaras IA" / "comunidade desportiva do Vale"',
    after: '"cobertura técnica e multimídia… com câmeras IA" / "comunidade esportiva do Vale"',
    evidence:
      'Medido agora na home: desporto 0×, desportiva 0×, equipas 0×, multimédia 0×, câmaras 0×.',
  },
  {
    id: 'w5-tv',
    title: '/tv expandida e com título novo',
    status: 'no-ar',
    wave: 5,
    area: 'TV / Broadcast',
    before: '6.958 B · "TV Arena Vale | Transmissões ao Vivo"',
    after: '13.619 B · "TV Arena Vale | Transmissões e Jogos ao Vivo"',
    evidence: 'Página praticamente dobrou de conteúdo e manteve o player em 16:9 correto.',
  },
  {
    id: 'w5-juridicas',
    title: 'Páginas jurídicas expandidas',
    status: 'no-ar',
    wave: 5,
    area: 'LGPD / Jurídico',
    before: '/privacidade 15.395 B · /termos 13.410 B',
    after: '/privacidade 32.521 B (+111%) · /termos 27.380 B (+104%)',
    evidence:
      'Ambas ganharam título próprio e corpo de texto substancial. Vale uma leitura de revisão antes de divulgar, por serem documentos com efeito legal.',
  },
  {
    id: 'w5-agenda-jogos',
    title: 'Agenda com confrontos e equipes reais do Vale',
    status: 'no-ar',
    wave: 5,
    area: 'Conteúdo',
    before: '10.081 B · 3 jogos com nomes genéricos',
    after: '17.126 B · Valeprev Futsal × Atlético Blumenau (28/10 19:30 · Ginásio Municipal do Vale) e Botafogo do Vale × Ajax Pomerode (30/10 20:15 · Arena Principal)',
    evidence:
      'Atenção: os 3 jogos publicados no build 4 foram substituídos por estes 2. Se os anteriores eram os corretos, vale conferir a base de dados.',
  },

  /* ========== BUILD 4 (4) ========== */
  {
    id: 'w4-favicon',
    title: 'Favicon e ícones publicados',
    status: 'no-ar',
    wave: 4,
    area: 'Identidade',
    before: '/favicon.ico, /icon.png e /apple-icon.png → 404',
    after: 'todos → 200 + 4 tags no <head>',
    evidence: 'Re-testado nesta 5ª conferência: favicon.ico 200 (124.925 B), estável.',
  },
  {
    id: 'w4-logo-quebrada',
    title: 'Referência quebrada ao logo antigo removida',
    status: 'no-ar',
    wave: 4,
    area: 'Mídia',
    before: '/atletasdestaques usava "/logo 02.png" → 404',
    after: '0 referências · /logo.png 200',
    evidence: '/atletasdestaques permanece com 15.679 B — não foi alterado neste build.',
  },
  {
    id: 'w4-agenda',
    title: '/agenda reestruturada e populada',
    status: 'no-ar',
    wave: 4,
    area: 'Conteúdo',
    before: '5.967 B · "A carregar agenda de confrontos..."',
    after: '17.126 B com jogos, datas, horários e locais',
    evidence: 'A página deixou de ser um esqueleto vazio.',
  },
  {
    id: 'w4-cfg6',
    title: 'Etiqueta CFG6 removida das páginas principais',
    status: 'no-ar',
    wave: 4,
    area: 'Conteúdo',
    before: '4 ocorrências em /projetosocial e 1 em /atletasdestaques',
    after: '0 ocorrências em home, /projetosocial, /campeonatos, /tv, /patrocinio, /privacidade, /termos',
    evidence:
      'Re-testado agora: continua zerada nessas páginas. Porém voltou em /agenda e /login — ver pendências.',
  },

  /* ========== BUILD 3 (11) ========== */
  {
    id: 'w3-painel',
    title: '/painel protegido no servidor',
    status: 'no-ar',
    wave: 3,
    area: 'Segurança · BLOQUEANTE',
    before: 'HTTP 200 com "Centro de Comando" renderizado',
    after: 'HTTP 307 → /login',
    evidence: 'Re-testado na 5ª conferência: segue 307. Sem regressão.',
  },
  {
    id: 'w3-email',
    title: 'E-mail administrativo interno removido',
    status: 'no-ar',
    wave: 3,
    area: 'Segurança',
    before: 'arenavale2026@gmail.com exposto',
    after: '0 ocorrências nas páginas varridas',
    evidence: 'Continua limpo nesta conferência.',
  },
  {
    id: 'w3-imagem',
    title: 'Imagem principal comprimida em 89%',
    status: 'no-ar',
    wave: 3,
    area: 'Performance · BLOQUEANTE',
    before: 'fundo-arena.jpg 2.874.222 B',
    after: '308.577 B',
    evidence: 'Re-medido agora: 308.577 B, estável.',
  },
  {
    id: 'w3-manifest',
    title: 'manifest.json publicado (PWA)',
    status: 'no-ar',
    wave: 3,
    area: 'Identidade · BLOQUEANTE',
    before: 'HTTP 404',
    after: 'HTTP 200 (460 B)',
    evidence: 'Manifest íntegro nesta conferência.',
  },
  {
    id: 'w3-logo',
    title: 'Logo renomeada sem espaço',
    status: 'no-ar',
    wave: 3,
    area: 'Mídia',
    before: '/logo 02.png',
    after: '/logo.png · 200 · 124.925 B',
    evidence: '11 referências na home, todas válidas.',
  },
  {
    id: 'w3-opengraph',
    title: 'Open Graph + Twitter Card completos',
    status: 'no-ar',
    wave: 3,
    area: 'SEO / Social',
    before: '0 tags og:*',
    after: 'og:title, og:description, og:image 1200×630, og:locale pt_BR, twitter:card',
    evidence: 'Link já gera prévia no WhatsApp.',
  },
  {
    id: 'w3-titles',
    title: 'Títulos únicos por página',
    status: 'no-ar',
    wave: 3,
    area: 'SEO',
    before: '5 páginas com o mesmo título',
    after: '8 de 10 páginas com título exclusivo',
    evidence:
      'Confirmado agora: /tv, /agenda, /atletasdestaques, /campeonatos, /patrocinio, /projetosocial, /privacidade e /termos. Restam / e /login.',
  },
  {
    id: 'w3-facebook',
    title: 'Link genérico do Facebook removido',
    status: 'no-ar',
    wave: 3,
    area: 'Links',
    before: 'href="https://facebook.com"',
    after: 'Só YouTube e Instagram oficiais',
    evidence: 'Rodapé sem destino vazio.',
  },
  {
    id: 'w3-ptbr-home',
    title: 'Home 100% em PT-BR',
    status: 'no-ar',
    wave: 3,
    area: 'Revisão PT-BR',
    before: 'desporto 3×, desportiva 4×, desportivo 1×',
    after: 'desport* 0× · esporte 13× · esportiva 6× · equipes 4×',
    evidence: 'Re-medido nesta conferência: continua zerado na home.',
  },
  {
    id: 'w3-campeonatos',
    title: 'Rota /campeonatos criada',
    status: 'no-ar',
    wave: 3,
    area: 'Rotas · BLOQUEANTE',
    before: 'HTTP 404',
    after: 'HTTP 200 + presente no sitemap',
    evidence:
      'A rota existe e responde 200. Porém o conteúdo foi esvaziado neste build — ver pendência "regressão".',
  },
  {
    id: 'w3-cfg6-parcial',
    title: 'CFG6 removido do rodapé da home',
    status: 'no-ar',
    wave: 3,
    area: 'Conteúdo',
    before: '"etiqueta **CFG6**" na home',
    after: '0 ocorrências na home',
    evidence: 'Confirmado em todas as conferências seguintes.',
  },

  /* ========== BUILD 2 (6) ========== */
  {
    id: 'sync-wa-2520',
    title: 'Dupla codificação %2520 no WhatsApp',
    status: 'no-ar',
    wave: 2,
    area: 'Conversão',
    before: 'text=Olá,%2520tenho%2520interesse…',
    after: 'text=Olá,%20tenho%20interesse…',
    evidence: 'Re-validado: 5 URLs de WhatsApp com codificação única.',
  },
  {
    id: 'sync-ps-link',
    title: 'Home conectada à página /projetosocial',
    status: 'no-ar',
    wave: 2,
    area: '#projetosocial',
    before: '0 links para /projetosocial',
    after: 'Home com link para a página completa',
    evidence: '/projetosocial cresceu para 24.759 B neste build.',
  },
  {
    id: 'sync-tv-iframe',
    title: 'Player da TV sem corte (16:9)',
    status: 'no-ar',
    wave: 2,
    area: 'TV / Broadcast',
    before: 'iframe h-[140%] w-[140%]',
    after: 'aspect-video + live_stream',
    evidence: 'Mantido na página expandida deste build.',
  },
  {
    id: 'sync-agenda-shell',
    title: 'Página /agenda reestruturada',
    status: 'no-ar',
    wave: 2,
    area: 'Agenda',
    before: '"Agenda em Atualização" estático',
    after: 'Cabeçalho próprio + título exclusivo',
    evidence: 'Estrutura mantida e agora com dados.',
  },
  {
    id: 'sync-sitemap-lastmod',
    title: 'Sitemap com lastmod dinâmico',
    status: 'no-ar',
    wave: 2,
    area: 'SEO',
    before: 'lastmod fixo + rota 404 listada',
    after: '7 URLs, todas respondendo 200',
    evidence: 'Sitemap íntegro — mas não inclui as 5 rotas novas (ver pendência).',
  },
  {
    id: 'sync-cfg6-home',
    title: 'CFG6 removido da Home',
    status: 'no-ar',
    wave: 2,
    area: 'Conteúdo',
    before: 'Rodapé da home com "**CFG6**"',
    after: '0 ocorrências',
    evidence: 'Confirmado novamente nesta conferência.',
  },

  /* ========== EM ABERTO (10) ========== */
  {
    id: 'res-proprietario-publico',
    title: '/proprietario acessível publicamente (HTTP 200)',
    status: 'pendente',
    severity: 'critico',
    area: 'Segurança · CRIADO NESTE BUILD',
    effort: '30min',
    evidence:
      'Detectado nesta conferência: GET /proprietario → HTTP 200 (10.728 B), exibindo a tela "👑 ALTA ADMINISTRAÇÃO · Acesso do Proprietário · Identifique-se para gerir os acessos de coordenadores, moderadores e capitães" com campos "E-mail do Proprietário" e "Palavra-passe Mestra". Qualquer visitante alcança a porta de entrada do cargo mais alto do sistema.',
    verifyLabel: 'A rota do cargo mais alto precisa ser a mais protegida de todas',
    verifyCommand:
      'curl -s -o /dev/null -w "/proprietario %{http_code}\\n" https://SEU-DOMINIO/proprietario',
    expected: 'Esperado: 307/401/404 — nunca 200 para visitante anônimo',
  },
  {
    id: 'res-coordenador-publico',
    title: '/coordenador acessível publicamente (HTTP 200)',
    status: 'pendente',
    severity: 'critico',
    area: 'Segurança · CRIADO NESTE BUILD',
    effort: '30min',
    evidence:
      'GET /coordenador → HTTP 200 (9.315 B) com "🔒 ÁREA PROTEGIDA · ACESSO DO COORDENADOR · Digite a credencial de segurança para liberar o painel de controle". Inversão grave: /moderador e /capitao respondem 307 (protegidos), mas os dois cargos acima deles estão abertos.',
    verifyLabel: 'Proteger com o mesmo middleware já usado em /moderador e /capitao',
    verifyCommand:
      'for p in proprietario coordenador moderador capitao painel; do echo -n "/$p "; curl -s -o /dev/null -w "%{http_code}\\n" https://SEU-DOMINIO/$p; done',
    expected: 'Esperado: 307 nas 5 rotas (hoje: 200, 200, 307, 307, 307)',
  },
  {
    id: 'res-hierarquia-login',
    title: '/login divulga a hierarquia e oferece "Acesso Rápido do Proprietário"',
    status: 'pendente',
    severity: 'alto',
    area: 'Segurança / Conteúdo',
    effort: '20min',
    evidence:
      'A página pública de login exibe "Hierarquia: Proprietário, Coordenador, Moderador e Capitão" e um botão "⭐ Acesso Rápido: Login do Proprietário". Isso entrega a um visitante comum o mapa completo da área administrativa e um atalho direto ao cargo máximo.',
    verifyLabel: 'Login genérico, sem citar cargos nem atalhos; detalhes só depois de autenticar',
    verifyCommand:
      'curl -s https://SEU-DOMINIO/login | grep -oiE "propriet[aá]rio|coordenador|moderador|capit[aã]o|acesso r[aá]pido" | sort | uniq -c',
    expected: 'Esperado: 0 ocorrências',
  },
  {
    id: 'res-campeonatos-regressao',
    title: 'Regressão: /campeonatos foi esvaziada (−51% do conteúdo)',
    status: 'pendente',
    severity: 'alto',
    area: 'Conteúdo · REGRESSÃO',
    effort: '45min',
    evidence:
      'A página caiu de 20.286 B para 9.903 B. No build 4 trazia "Campeonatos & Competições" com Circuito de Futsal e Copa de Futebol 7 descritos e botão "Inscrever Equipe". Agora renderiza apenas o título e "A carregar base de dados...". O que estava pronto deixou de aparecer.',
    verifyLabel: 'Os campeonatos precisam voltar a aparecer no HTML (não em estado de carregamento)',
    verifyCommand:
      'curl -s https://SEU-DOMINIO/campeonatos | grep -oiE "Circuito|Copa|Inscrever|a carregar" | sort | uniq -c',
    expected: 'Esperado: nomes de circuitos/copas presentes e "a carregar" = 0',
  },
  {
    id: 'res-cfg6-voltou',
    title: 'Regressão: CFG6 voltou em /agenda e /login',
    status: 'pendente',
    severity: 'alto',
    area: 'Conteúdo · REGRESSÃO',
    effort: '15min',
    evidence:
      'Tinha sido zerado no build 4. Agora /agenda traz o selo "CALENDÁRIO DE CONFRONTOS · CFG6" e o rodapé "© 2026 Arena Vale · Configuração CFG6"; /login traz "ÁREA RESTRITA · CFG6" e o mesmo rodapé. Indica que essas duas páginas usam um componente de rodapé diferente do restante do site.',
    verifyLabel: 'Unificar o rodapé num único componente compartilhado',
    verifyCommand:
      'for p in "" agenda login tv campeonatos projetosocial; do echo -n "/$p "; curl -s https://SEU-DOMINIO/$p | grep -c "CFG6"; done',
    expected: 'Esperado: 0 em todas',
  },
  {
    id: 'res-rotas-orfas',
    title: '5 rotas novas fora do sitemap e sem link no site (/noticias vazia)',
    status: 'pendente',
    severity: 'medio',
    area: 'Arquitetura / SEO',
    effort: '30min',
    evidence:
      '/proprietario, /coordenador, /moderador, /capitao e /noticias não aparecem no sitemap.xml nem no bundle da home (que só conhece /tv, /agenda, /atletasdestaques, /campeonatos, /patrocinio, /projetosocial, /privacidade, /termos e /login). /noticias responde 200 mas exibe só "A carregar base de dados...".',
    verifyLabel: 'Decidir o destino de cada rota: publicar com conteúdo, proteger ou remover',
    verifyCommand:
      'curl -s https://SEU-DOMINIO/sitemap.xml | grep -c "noticias"; curl -s https://SEU-DOMINIO/noticias | grep -c "carregar"',
    expected: 'Esperado: /noticias no sitemap com conteúdo, ou rota removida',
  },
  {
    id: 'res-dominio-robots',
    title: 'Domínio registrado, mas sem apontamento DNS',
    status: 'pendente',
    severity: 'alto',
    area: 'Migração de domínio · AGUARDANDO DNS',
    effort: '10min de painel',
    evidence:
      'Re-testado nesta conferência, sem mudança: arenavale.com.br está registrado (RDAP 200, NS a.sec.dns.br / b.sec.dns.br, DNSSEC assinado), mas a zona não tem registro A/AAAA e www retorna NXDOMAIN. Enquanto isso o robots.txt declara Sitemap: https://www.arenavale.com.br/sitemap.xml, inalcançável para o Google.',
    verifyLabel: 'Criar A 76.76.21.21 no apex + CNAME cname.vercel-dns.com no www',
    verifyCommand:
      'curl -s -H "accept: application/dns-json" "https://dns.google/resolve?name=www.arenavale.com.br&type=A" | grep -oE \\"Status\\":[0-9]',
    expected: 'Esperado: Status 0 com Answer (hoje: Status 3 = NXDOMAIN)',
  },
  {
    id: 'res-ptbr-internas',
    title: 'PT-PT residual: /patrocinio, "Palavra-passe" e "TRANSMISSAO" sem til',
    status: 'pendente',
    severity: 'alto',
    area: 'Revisão PT-BR',
    effort: '30min',
    evidence:
      'Medido agora: /patrocinio mantém a description "Associe a sua marca ao desporto. Conheça as nossas…" (desporto 3×, "a sua/as nossas" 5×). /login e /proprietario usam "Palavra-passe" em vez de "Senha". A home ainda tem "TRANSMISSAO AO VIVO" e "ASSISTIR A TRANSMISSAO" sem o til (2×). /atletasdestaques e /termos mantêm 2 ocorrências de "desport" cada.',
    verifyLabel: 'Trocar desporto→esporte, Palavra-passe→Senha, TRANSMISSAO→TRANSMISSÃO',
    verifyCommand:
      'for p in "" patrocinio login proprietario atletasdestaques termos; do echo -n "/$p "; curl -s https://SEU-DOMINIO/$p | grep -oiE "desport[a-z]*|palavra-passe|transmissao" | wc -l; done',
    expected: 'Esperado: 0 em todas',
  },
  {
    id: 'res-login-seo',
    title: '/ e /login com título e description genéricos + /login sem noindex',
    status: 'pendente',
    severity: 'medio',
    area: 'SEO',
    effort: '20min',
    evidence:
      'Conferido página a página: 8 de 10 têm título exclusivo, mas / e /login seguem com "Arena Vale Sports" e a description padrão "Plataforma de gestão de campeonatos e transmissões esportivas.". /login, sendo área restrita, deveria ter <meta name="robots" content="noindex, nofollow">.',
    verifyLabel: 'Título de marca na home + noindex no login',
    verifyCommand:
      'for p in "" login; do echo -n "/$p "; curl -s https://SEU-DOMINIO/$p | grep -oE "<title>[^<]*</title>|name=\\"robots\\""; done',
    expected: 'Esperado: home com slogan próprio e /login com noindex',
  },
  {
    id: 'res-og-banner',
    title: 'og:image usa foto genérica e falta canonical',
    status: 'pendente',
    severity: 'medio',
    area: 'SEO / Social',
    effort: '40min',
    evidence:
      'og:image e twitter:image continuam apontando para /fundo-arena.jpg declarado como 1200×630 — funciona, mas não é uma arte com escudo, nome e slogan. Nenhuma página tem <link rel="canonical">, o que é essencial na migração para o domínio próprio.',
    verifyLabel: 'Banner OG dedicado + canonical em todas as páginas',
    verifyCommand:
      'curl -s https://SEU-DOMINIO/ | grep -oE \'<meta property="og:image" content="[^"]*"|rel="canonical"\'',
    expected: 'Esperado: arte og dedicada + canonical presente',
  },
  {
    id: 'res-fotos-atletas',
    title: 'Atletas em Destaque sem retratos individuais',
    status: 'pendente',
    severity: 'medio',
    area: 'Conteúdo / Mídia',
    effort: '1h30',
    evidence:
      '/atletasdestaques está congelado em 15.679 B há dois builds: as repetições de /fundo-arena.jpg foram removidas, mas os cards de Gabriel Mendes, Lucas Silveira e Matheus Becker seguem sem foto individual.',
    verifyLabel: 'Um retrato por atleta (com autorização de uso de imagem)',
    verifyCommand:
      'curl -s https://SEU-DOMINIO/atletasdestaques | grep -oE \'src="[^"]*"\' | sort | uniq -c',
    expected: 'Esperado: 1 imagem distinta por atleta',
  },
];

export const DEPLOY_SEQUENCE = [
  {
    step: '1',
    title: 'Fechar /proprietario e /coordenador no servidor',
    detail:
      'Prioridade absoluta desta conferência: aplicar o mesmo middleware que já protege /moderador e /capitao às duas rotas de cargo mais alto.',
    cmd: 'for p in proprietario coordenador; do curl -s -o /dev/null -w "%{http_code}\\n" https://SEU-DOMINIO/$p; done',
  },
  {
    step: '2',
    title: 'Limpar a tela pública de login',
    detail:
      'Remover a lista de cargos, o "Acesso Rápido do Proprietário" e o selo CFG6. Login não deve revelar a estrutura interna.',
    cmd: 'curl -s https://SEU-DOMINIO/login | grep -oiE "propriet|capit|CFG6"',
  },
  {
    step: '3',
    title: 'Restaurar /campeonatos e decidir /noticias',
    detail:
      'As duas páginas exibem "A carregar base de dados...". Recupere o conteúdo do build 4 (20.286 B) e publique os comunicados ou retire a rota.',
    cmd: 'curl -s https://SEU-DOMINIO/campeonatos | grep -c "Circuito"',
  },
  {
    step: '4',
    title: 'Unificar rodapé e varrer o PT-BR',
    detail:
      'Um único componente de rodapé elimina o CFG6 de vez. Depois: desporto→esporte, Palavra-passe→Senha, TRANSMISSAO→TRANSMISSÃO.',
    cmd: 'grep -rniE "CFG6|desport|palavra-passe|TRANSMISSAO" app/ src/',
  },
  {
    step: '5',
    title: 'Ativar o DNS do domínio próprio',
    detail:
      'Criar A 76.76.21.21 no apex e CNAME cname.vercel-dns.com no www — sem isso o sitemap declarado no robots.txt continua inalcançável.',
    cmd: 'bash verificar-arena.sh https://www.arenavale.com.br',
  },
  {
    step: '6',
    title: 'Publicar e confirmar pelo hash do build',
    detail:
      'Hash atual: page-6d4911af914250ac.js. Se após publicar continuar igual, o código não subiu.',
    cmd: 'curl -s https://SEU-DOMINIO/ | grep -oE "page-[a-z0-9]+\\.js"',
  },
];
