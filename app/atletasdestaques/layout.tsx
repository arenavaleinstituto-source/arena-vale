import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atletas em Destaque | ARENA VALE',
  description: 'Conheça os protagonistas e os talentos que marcam o esporte na região.',
};

export default function AtletasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
