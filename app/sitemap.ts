import { MetadataRoute } from 'next';
import { buscarAlbuns } from '@/lib/midia/galeria-busca';

/**
 * SITEMAP
 *
 * O sitemap anterior omitia as páginas de conteúdo editorial — inclusive
 * /noticias, o mural oficial de comunicados, que é a página mais
 * rastreável do site depois da Home.
 *
 * O domínio vem de NEXT_PUBLIC_BASE_URL (https://www.arenavale.com.br desde 11/11/2026),
 * o mesmo usado no robots.txt.
 */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const paginas: { path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    // Conteúdo editorial — era o que faltava.
    { path: '/noticias', changeFrequency: 'daily', priority: 0.95 },
    { path: '/atletasdestaques', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/ao-vivo', changeFrequency: 'daily', priority: 0.9 },
    { path: '/videos', changeFrequency: 'daily', priority: 0.8 },
    { path: '/agenda', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/galeria', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/modalidades', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/modalidades/futsal', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/modalidades/futebol7', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/modalidades/basquete', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/modalidades/volei', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/sobre', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/projetosocial', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/patrocinio', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/inscricao', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/privacidade', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/termos', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/links', changeFrequency: 'monthly', priority: 0.3 },
  ];

  const albuns = await buscarAlbuns(200).catch(() => []);
  return [
    ...paginas.map((pagina) => ({
      url: `${baseUrl}${pagina.path}`,
      lastModified: agora,
      changeFrequency: pagina.changeFrequency,
      priority: pagina.priority,
    })),
    ...albuns.map((a) => ({
      url: `${baseUrl}/galeria/${a.id}`,
      lastModified: new Date(`${a.data}T12:00:00-03:00`),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
