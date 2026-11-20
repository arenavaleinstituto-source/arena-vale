import { redirect } from 'next/navigation';

/** A gestão de atletas destaque fica na aba do painel da coordenação. */
export default function AtletasDestaquesPage() {
  redirect('/coordenador?aba=destaques');
}
