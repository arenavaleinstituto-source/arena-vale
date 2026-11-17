/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  typescript: {
    // ⚠️ Antes: `ignoreBuildErrors: true`.
    // Essa flag escondia erros REAIS de compilação — foi o que permitiu que
    // 8 arquivos importassem de um diretório inexistente (`../data/*`) e que
    // o `package.json` continuasse sendo o de um projeto Vite. O build
    // "passava" enquanto o site não tinha como ser compilado de verdade.
    //
    // Agora o build falha de verdade quando há erro de tipo — e
    // `npm run typecheck` roda a checagem completa.
    ignoreBuildErrors: false,
  },
  // O robô do Telegram lê a logo do disco para carimbar as fotos.
  outputFileTracingIncludes: { '/api/telegram': ['./public/logo.png'] },
  // Rotas antigas: /tv e /campeonatos viraram Ao Vivo e Modalidades; o painel virou abas de /coordenador (spec Fase 3).
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://i.ytimg.com https://*.supabase.co https://images.pexels.com",
      "frame-src https://www.youtube-nocookie.com",
      "connect-src 'self' https://*.supabase.co",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/tv', destination: '/ao-vivo', permanent: true },
      { source: '/campeonatos', destination: '/modalidades', permanent: true },
      { source: '/atletas', destination: '/atletasdestaques', permanent: true },
      { source: '/painel/noticias', destination: '/coordenador?aba=noticias', permanent: true },
      { source: '/painel/tv', destination: '/coordenador?aba=aovivo', permanent: true },
      { source: '/painel/campeonatos', destination: '/coordenador?aba=campeonatos', permanent: true },
      { source: '/painel/atletasdestaques', destination: '/coordenador?aba=destaques', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
};
export default nextConfig;
