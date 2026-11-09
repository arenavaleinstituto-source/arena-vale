import { redirect } from 'next/navigation';

/** O antigo painel de demonstração virou o painel real da coordenação. */
export default function PainelPage() {
  redirect('/coordenador');
}
