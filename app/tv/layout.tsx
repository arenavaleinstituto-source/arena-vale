import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TV Arena Vale | Transmissões ao Vivo',
  description: 'Acompanhe as transmissões desportivas ao vivo e coberturas exclusivas.',
};

export default function TVLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
