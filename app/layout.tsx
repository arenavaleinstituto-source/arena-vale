import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena Vale Sports | O Palco do Esporte é Aqui',
  description: 'Transmissões ao vivo, coberturas, agenda e os atletas em destaque das principais competições esportivas do Vale.',
  keywords: ['Arena Vale', 'Futsal', 'Basquete', 'Futebol 7', 'Esportes', 'Transmissão ao vivo', 'Campeonatos'],
  icons: {
    icon: '/logo 02.png',
    shortcut: '/logo 02.png',
    apple: '/logo 02.png',
  },
  openGraph: {
    title: 'Arena Vale Sports | O Palco do Esporte é Aqui',
    description: 'Acompanhe as transmissões, tabelas e os grandes protagonistas do esporte regional.',
    siteName: 'Arena Vale Sports',
    images: [
      {
        url: '/logo 02.png',
        width: 800,
        height: 600,
        alt: 'Arena Vale Sports',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0b0d12] text-white antialiased selection:bg-[#e50914] selection:text-white">
        {children}
      </body>
    </html>
  );
}
