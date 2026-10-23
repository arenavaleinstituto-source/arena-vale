import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda de Jogos | Arena Vale Sports',
  description: 'Consulte o calendário oficial e os próximos confrontos da temporada.',
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
