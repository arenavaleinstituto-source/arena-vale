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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
};
export default nextConfig;
