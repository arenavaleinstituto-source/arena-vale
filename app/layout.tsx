import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena Vale Sports',
  description: 'Plataforma de gestão de campeonatos e transmissões esportivas.',
  icons: {
    icon: '/logo 02.png',
    shortcut: '/logo 02.png',
    apple: '/logo 02.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Arena Vale Sports',
    description: 'O palco do esporte é aqui. Acompanhe campeonatos e transmissões.',
    siteName: 'Arena Vale',
    images: [
      {
        url: '/fundo-arena.jpg',
        width: 1200,
        height: 630,
        alt: 'Arena Vale Sports',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arena Vale Sports',
    description: 'O palco do esporte é aqui. Acompanhe campeonatos e transmissões.',
    images: ['/fundo-arena.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#070b13] text-white font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
