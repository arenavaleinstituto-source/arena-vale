import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena Vale Sports',
  description: 'Plataforma de gestão de campeonatos e transmissões desportivas.',
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
