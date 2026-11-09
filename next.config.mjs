/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Rotas antigas: /tv e /campeonatos viraram Ao Vivo e Modalidades; o painel virou abas de /coordenador (spec Fase 3).
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
