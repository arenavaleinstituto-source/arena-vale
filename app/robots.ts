import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/painel'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
