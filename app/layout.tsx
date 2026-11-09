import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

/**
 * METADADOS GLOBAIS
 *
 * ⚠️ O commit 41ec830 ("Update layout.tsx") tinha substituído este bloco
 * por uma versão mínima em INGLÊS: trocava `lang="pt-BR"` por `lang="en"`
 * e apagava as tags OpenGraph, Twitter Card, manifest e ícones. Como o
 * site é 100% em português, isso quebrava:
 *   • o idioma declarado para buscadores e leitores de tela;
 *   • a prévia de compartilhamento no WhatsApp/Instagram/X;
 *   • a instalação como PWA.
 *
 * A versão completa em pt-BR está restaurada abaixo.
 */
export const metadata: Metadata = {
  title: 'Arena Vale Sports',
  description: 'Plataforma de gestão de campeonatos e transmissões esportivas.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
      <body className="bg-[#070b13] text-white font-sans antialiased selection:bg-[#e50914] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
