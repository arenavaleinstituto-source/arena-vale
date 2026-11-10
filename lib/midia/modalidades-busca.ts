import { createPublicClient } from '@/lib/supabase/server';
import { MODALIDADES_SITE, fraseDaModalidade, type Modalidade } from './modalidades';

/** Modalidades visíveis no site, na ordem da coordenação. Se o banco falhar (ou ainda não tiver a 0015), usa as 4 de sempre. */
export async function buscarModalidades(): Promise<Modalidade[]> {
  try {
    const { data, error } = await createPublicClient().from('modalidades').select('slug,nome,frase').eq('ativo', true).order('ordem');
    if (error || !data?.length) return MODALIDADES_SITE;
    return data.map((m) => ({ slug: m.slug as string, nome: m.nome as string, frase: (m.frase as string | null) || fraseDaModalidade(m.nome as string) }));
  } catch {
    return MODALIDADES_SITE;
  }
}
