import { createPublicClient } from '@/lib/supabase/server';
import { COLUNAS_ATLETA_PUBLICO, type AtletaPublico } from './colunas';

export type EquipePublica = { id: string; nome: string; sigla: string | null; escudo_cor: string | null; cidade: string | null };

/** Elenco público da equipe. Sem a coluna cpf_mascarado (banco antes da 0013), mostra sem CPF. */
export async function buscarElenco(timeId: string): Promise<AtletaPublico[]> {
  try {
    const sb = createPublicClient();
    const r = await sb.from('jogadores').select(COLUNAS_ATLETA_PUBLICO).eq('time_id', timeId).order('numero_camisa', { nullsFirst: false }).order('nome');
    if (!r.error) return (r.data ?? []) as unknown as AtletaPublico[];
    const semCpf = await sb.from('jogadores').select('id, nome, posicao, numero_camisa, foto_url').eq('time_id', timeId).order('nome');
    return ((semCpf.data ?? []) as Omit<AtletaPublico, 'cpf_mascarado'>[]).map((a) => ({ ...a, cpf_mascarado: null }));
  } catch {
    return [];
  }
}

export async function buscarEquipe(id: string): Promise<EquipePublica | null> {
  try {
    const { data } = await createPublicClient().from('times').select('id, nome, sigla, escudo_cor, cidade').eq('id', id).maybeSingle();
    return (data as EquipePublica | null) ?? null;
  } catch {
    return null;
  }
}
