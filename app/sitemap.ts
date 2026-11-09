import { MetadataRoute } from 'next';

/**
 * SITEMAP
 *
 * O sitemap anterior omitia as páginas de conteúdo editorial — inclusive
 * /noticias, o mural oficial de comunicados, que é a página mais
 * rastreável do site depois da Home.
 *
 * `baseUrl` segue apontando para o domínio Vercel porque o domínio
 * próprio (arenavale.com.br) ainda não tem registro A configurado
 * (ver `domainData.ts`). Quando o A apontar, troque a constante abaixo
 * e o `robots.txt` junto.
 */
const baseUrl = 'https://arena-vale.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const paginas: { path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    // Conteúdo editorial — era o que faltava.
    { path: '/noticias', changeFrequency: 'daily', priority: 0.95 },
    { path: '/atletasdestaques', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/tv', changeFrequency: 'daily', priority: 0.9 },
    { path: '/agenda', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/campeonatos', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/projetosocial', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/patrocinio', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/inscricao', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/privacidade', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/termos', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/links', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return paginas.map((pagina) => ({
    url: `${baseUrl}${pagina.path}`,
    lastModified: agora,
    changeFrequency: pagina.changeFrequency,
    priority: pagina.priority,
  }));
}
