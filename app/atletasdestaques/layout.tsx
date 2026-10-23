import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atletas em Destaque | Arena Vale Sports',
  description: 'Conheça os protagonistas e os talentos que marcam o desporto na região.',
};

export default function AtletasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
