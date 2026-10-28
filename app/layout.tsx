import './globals.css';

export const metadata = {
  title: 'Arena Vale | Official Portal',
  description: 'Ecosystem of competitions, championships, and sports in the Vale region.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#07080c] text-white font-sans antialiased selection:bg-[#e50914] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
