import { createPublicClient } from '@/lib/supabase/server';

/** Patrocinador como aparece no site (tabela `patrocinadores`, só os ativos). */
export type PatrocinadorSite = {
  id: string;
  nome: string;
  cota: string;
  logo_url: string | null;
  logo_initials: string | null;
  logo_cor: string | null;
  site_url: string | null;
};

const ORDEM_COTA = ['master', 'ouro', 'prata', 'bronze', 'apoio'];

function pesoCota(cota: string): number {
  const i = ORDEM_COTA.indexOf(cota.trim().toLowerCase());
  return i === -1 ? ORDEM_COTA.length : i;
}

/** Cotas maiores primeiro; dentro da mesma cota, a ordem do banco. */
export function ordenarPorCota<T extends { cota: string }>(lista: T[]): T[] {
  return lista
    .map((p, i) => ({ p, i }))
    .sort((a, b) => pesoCota(a.p.cota) - pesoCota(b.p.cota) || a.i - b.i)
    .map((x) => x.p);
}

export async function buscarPatrocinadores(): Promise<PatrocinadorSite[]> {
  try {
    const { data, error } = await createPublicClient()
      .from('patrocinadores')
      .select('id,nome,cota,logo_url,logo_initials,logo_cor,site_url')
      .eq('ativo', true)
      .order('created_at');
    if (error || !data) return [];
    return ordenarPorCota(data as PatrocinadorSite[]);
  } catch {
    return [];
  }
}
