export interface DnsProbe {
  label: string;
  query: string;
  result: string;
  status: 'ok' | 'falha' | 'ausente';
  detail: string;
}

export const DOMAIN = {
  apex: 'arenavale.com.br',
  www: 'www.arenavale.com.br',
  registradoEm: 'Registro.br (RDAP público)',
  dsRegistrado: '23/10/2026 · 08:07:57 UTC',
  delegacaoChecada: '24/10/2026 · 08:12:30 UTC · status "ns aa" / "ds ok"',
  nameservers: ['a.sec.dns.br', 'b.sec.dns.br'],
  dnssec: 'Delegação assinada (DNSSEC ativo, algoritmo 13, keyTag 62856)',
  titularDocumento: '64.092.049/0001-02',
  cnpjNoSite: '40.694.741/0001-34',
  sitemapDeclarado: 'https://www.arenavale.com.br/sitemap.xml',
  sitemapReal: 'https://arena-vale.vercel.app/sitemap.xml',
  medidoEm: '25/10/2026 · 01:52 UTC',
};

export const DNS_PROBES: DnsProbe[] = [
  {
    label: 'Domínio registrado no .br',
    query: 'RDAP rdap.registro.br/domain/arenavale.com.br',
    result: 'HTTP 200 · objeto "domain" completo',
    status: 'ok',
    detail:
      'O registro existe e está ativo no Registro.br, com entidade titular e histórico de eventos. Não é um domínio inexistente.',
  },
  {
    label: 'Delegação de nameservers',
    query: 'DNS type=NS arenavale.com.br',
    result: 'a.sec.dns.br + b.sec.dns.br (TTL 3600)',
    status: 'ok',
    detail:
      'A zona está delegada para os servidores DNS gratuitos do Registro.br (SecureDNS). Última checagem de delegação retornou "ns aa" = nameservers autoritativos respondendo.',
  },
  {
    label: 'DNSSEC',
    query: 'RDAP secureDNS.dsData',
    result: 'delegationSigned: true · DS ok',
    status: 'ok',
    detail:
      'Assinatura DNSSEC válida — proteção extra contra spoofing de DNS. Nada a fazer aqui.',
  },
  {
    label: 'Registro A (apex)',
    query: 'DNS type=A arenavale.com.br',
    result: 'NOERROR sem resposta · apenas SOA na autoridade',
    status: 'ausente',
    detail:
      'Este é o motivo exato do erro: a zona existe, mas não tem nenhum registro A apontando para um IP. Por isso o curl retorna HTTP 000 e o navegador diz "servidor não encontrado".',
  },
  {
    label: 'Registro AAAA (IPv6)',
    query: 'DNS type=AAAA arenavale.com.br',
    result: 'NOERROR sem resposta',
    status: 'ausente',
    detail: 'Também ausente — esperado, já que nenhum apontamento foi criado ainda.',
  },
  {
    label: 'Subdomínio www',
    query: 'DNS type=CNAME www.arenavale.com.br',
    result: 'NXDOMAIN (Status 3)',
    status: 'falha',
    detail:
      'O www nem existe na zona DNS. Como o robots.txt declara o sitemap em https://www.arenavale.com.br/sitemap.xml, é justamente esse nome que precisa ser criado.',
  },
];

export interface DnsRecord {
  name: string;
  type: string;
  value: string;
  ttl: string;
  why: string;
}

export const PATH_A_RECORDS: DnsRecord[] = [
  {
    name: 'arenavale.com.br  (apex / @)',
    type: 'A',
    value: '76.76.21.21',
    ttl: '3600',
    why: 'Aponta a raiz do domínio para a Vercel. O apex não aceita CNAME por regra do DNS, por isso usa registro A.',
  },
  {
    name: 'www.arenavale.com.br',
    type: 'CNAME',
    value: 'cname.vercel-dns.com',
    ttl: '3600',
    why: 'É exatamente o nome declarado no seu robots.txt. Sem ele, o Google não alcança o sitemap.',
  },
];

export const PATH_B_RECORDS: DnsRecord[] = [
  {
    name: 'Servidores DNS no Registro.br',
    type: 'NS',
    value: 'ns1.vercel-dns.com  /  ns2.vercel-dns.com',
    ttl: '—',
    why: 'A Vercel passa a gerir a zona inteira e cria os registros A/CNAME sozinha, com SSL automático.',
  },
  {
    name: 'Alternativa: Cloudflare',
    type: 'NS',
    value: 'os dois NS indicados pelo Cloudflare ao adicionar o site',
    ttl: '—',
    why: 'Banda ilimitada grátis, CDN no Brasil e proteção DDoS. Útil se houver pico de audiência em dia de final transmitida ao vivo.',
  },
];

export const CUTOVER_STEPS = [
  {
    id: 'cut-1',
    title: 'Criar os registros na zona DNS',
    detail:
      'Acesse registro.br → seu domínio → DNS → "Editar zona" e cadastre o A do apex (76.76.21.21) e o CNAME do www (cname.vercel-dns.com). Como seus NS são a.sec.dns.br / b.sec.dns.br, é ali mesmo que se edita.',
    command: null,
    minutes: '10 min',
  },
  {
    id: 'cut-2',
    title: 'Adicionar os dois domínios na Vercel',
    detail:
      'Project → Settings → Domains → adicione arenavale.com.br e www.arenavale.com.br. Escolha um como principal e configure o outro como "Redirect to" (308) para não duplicar conteúdo.',
    command: null,
    minutes: '5 min',
  },
  {
    id: 'cut-3',
    title: 'Aguardar propagação e validar o SSL',
    detail:
      'A Vercel emite o certificado automaticamente. O status deve mudar de "Invalid Configuration" para "Valid Configuration" com cadeado verde. Propagação .br costuma levar de minutos a poucas horas.',
    command:
      'curl -sI https://www.arenavale.com.br | grep -iE "^HTTP|^server|^location"',
    minutes: '15 min – 4 h',
  },
  {
    id: 'cut-4',
    title: 'Trocar a URL base no código (sitemap, robots, OG e canonical)',
    detail:
      'Defina a variável de ambiente com o domínio novo. Assim sitemap.xml, robots.txt, og:url e canonical passam a usar o endereço certo sem editar arquivo por arquivo — e o robots.txt deixa de apontar para um lugar que ainda não existe.',
    command:
      'NEXT_PUBLIC_SITE_URL="https://www.arenavale.com.br"\n\n// layout.tsx\nexport const metadata = {\n  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),\n  alternates: { canonical: "/" },\n};',
    minutes: '20 min',
  },
  {
    id: 'cut-5',
    title: 'Redirecionar o endereço .vercel.app para o domínio novo',
    detail:
      'Evita conteúdo duplicado e preserva a autoridade já acumulada. Configure o redirect 301 do subdomínio antigo para o domínio próprio.',
    command:
      '// next.config.mjs\nasync redirects() {\n  return [{\n    source: "/:path*",\n    has: [{ type: "host", value: "arena-vale.vercel.app" }],\n    destination: "https://www.arenavale.com.br/:path*",\n    permanent: true,\n  }];\n}',
    minutes: '10 min',
  },
  {
    id: 'cut-6',
    title: 'Google Search Console: nova propriedade + mudança de endereço',
    detail:
      'Adicione o domínio novo como propriedade, use a ferramenta "Mudança de endereço" partindo do .vercel.app e reenvie o sitemap. Sem isso o Google pode demorar semanas para transferir a indexação.',
    command: 'https://www.arenavale.com.br/sitemap.xml',
    minutes: '15 min',
  },
  {
    id: 'cut-7',
    title: 'Atualizar os pontos de entrada públicos',
    detail:
      'Bio do Instagram @arenavaleoficial, link do WhatsApp Business, descrição do canal @TVArenaVale, materiais de patrocínio e o QR code usado em quadra/ginásio.',
    command: null,
    minutes: '20 min',
  },
];

export const DOMAIN_ALERTS = [
  {
    tone: 'info' as const,
    title: 'Enquanto o DNS não for criado, o sitemap fica inalcançável',
    text: 'O robots.txt já declara https://www.arenavale.com.br/sitemap.xml, mas esse nome retorna NXDOMAIN. O Google tenta ler o sitemap, não consegue e desconsidera o arquivo. Duas saídas: ativar o DNS (caminho natural, já que o domínio está registrado) ou, temporariamente, gerar o robots.txt a partir da variável de ambiente para apontar ao endereço que está respondendo hoje.',
  },
  {
    tone: 'warn' as const,
    title: 'Titular do domínio difere do CNPJ exibido no rodapé',
    text: 'No RDAP, o documento do titular de arenavale.com.br é 64.092.049/0001-02, enquanto o rodapé do site exibe CNPJ 40.694.741/0001-34. Vale confirmar se é o CNPJ de um sócio/holding ou se o rodapé precisa ser ajustado — inconsistência de razão social costuma travar cadastro em programas de patrocínio e notas fiscais de mídia.',
  },
  {
    tone: 'ok' as const,
    title: 'O que já está pronto e não precisa mexer',
    text: 'Registro ativo, delegação de NS válida (a.sec.dns.br / b.sec.dns.br) e DNSSEC assinado. Falta apenas criar os dois registros de endereço na zona — é uma etapa de painel, não de código.',
  },
];
