import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patrocínios e Cotas Comerciais | Arena Vale Sports',
  description: 'Associe a sua marca ao desporto. Conheça as nossas cotas de patrocínio.',
};

export default function PatrocinioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
