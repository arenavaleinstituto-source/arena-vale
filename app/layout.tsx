import './globals.css';

export const metadata = {
  metadataBase: new URL('https://arena-vale.vercel.app'),
  title: 'Arena Vale Sports | O Palco do Esporte é Aqui',
  description: 'Cobertura oficial de campeonatos, agenda, TV Arena Vale e atletas em destaque no ecossistema desportivo.',
  keywords: ['Arena Vale', 'Esporte', 'Futsal', 'Futebol 7', 'Basquete', 'Vôlei', 'Campeonatos', 'Santa Catarina'],
  openGraph: {
    title: 'Arena Vale Sports | O Palco do Esporte é Aqui',
    description: 'Cobertura oficial de campeonatos, agenda e atletas em destaque.',
    url: 'https://arena-vale.vercel.app',
    siteName: 'Arena Vale Sports',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    'name': 'Arena Vale Sports',
    'url': 'https://arena-vale.vercel.app',
    'logo': 'https://arena-vale.vercel.app/logo%2002.png',
    'description': 'Organização de eventos desportivos, campeonatos e plataforma de transmissão multimédia.',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Vale',
      'addressRegion': 'SC',
      'addressCountry': 'BR'
    },
    'sameAs': [
      'https://www.youtube.com/@TVArenaVale'
    ]
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#07080c] text-white antialiased selection:bg-[#e50914] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
