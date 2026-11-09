import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campeonatos e Competições | Arena Vale',
  description: 'Explore as modalidades e circuitos oficiais geridos pela Arena Vale.',
};

export default function CampeonatosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
