import { MetadataRoute } from 'next';

/**
 * ROBOTS.TXT
 *
 * Duas correções em relação à versão anterior:
 *
 * 1. O domínio. A constante usava `https://www.arenavale.com.br`, mas o
 *    domínio ainda não tem registro A (o DNS responde sem endereço). Como
 *    os buscadores seguem o robots.txt, declarar ali um sitemap que não
 *    resolve é pior do que nada. Agora o sitemap usa o MESMO domínio do
 *    `app/sitemap.ts` — e ambos vêm de `NEXT_PUBLIC_BASE_URL`, com o
 *    fallback no domínio que está no ar.
 *
 * 2. As áreas administrativas. Antes só /login e /painel eram bloqueados.
 *    /coordenador, /capitao e /moderador também são áreas restritas e não
 *    devem ser indexadas. A área do proprietário fica de FORA desta lista de
 *    propósito: listá-la revelaria que ela existe (ela responde 404).
 *
 * Observação: robots.txt NÃO é controle de acesso — é apenas uma dica
 * para os buscadores. A proteção real é o `proxy.ts` (cargo lido do banco)
 * e o RLS do Supabase.
 */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/painel',
        '/coordenador',
        '/capitao',
        '/moderador',
        '/acesso-negado',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
