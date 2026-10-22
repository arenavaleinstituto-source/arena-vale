import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/painel'],
    },
    sitemap: 'https://arena-vale.vercel.app/sitemap.xml',
  };
}
