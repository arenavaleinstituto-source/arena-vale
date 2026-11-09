import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patrocínios e Cotas Comerciais | ARENA VALE',
  description: 'Coloque sua marca no palco do esporte. Conheça as cotas de patrocínio.',
};

export default function PatrocinioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
