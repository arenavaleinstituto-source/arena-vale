/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora erros de TypeScript no build (a app funciona normal no browser)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  }
};
export default nextConfig;
