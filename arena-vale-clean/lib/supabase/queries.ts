// Helpers de query — todas usam o client SSR
import { createClient } from './server';
import type { Campeonato, Time, Jogo, Sumula, Patrocinador, Inscricao } from './types';

// Dashboard do coordenador
export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'coordenador') throw new Error('Sem permissão');

  const [insc, times, jogos, patrocinadores] = await Promise.all([
    supabase.from('inscricoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('times').select('id', { count: 'exact', head: true }),
    supabase.from('jogos').select('id', { count: 'exact', head: true }),
    supabase.from('patrocinadores').select('valor_mensal').eq('ativo', true),
  ]);

  return {
    inscricoes_pendentes: insc.count ?? 0,
    total_times: times.count ?? 0,
    total_jogos: jogos.count ?? 0,
    receita_mensal: (patrocinadores.data ?? []).reduce((acc, p) => acc + Number(p.valor_mensal || 0), 0),
  };
}

export async function getCampeonatos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('campeonatos')
    .select('*')
    .order('ano', { ascending: false })
    .order('nome');
  if (error) throw error;
  return data as Campeonato[];
}

export async function getTimes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('times').select('*').order('nome');
  if (error) throw error;
  return data as Time[];
}

export async function getJogos({ status, campeonatoId }: { status?: string; campeonatoId?: string } = {}) {
  const supabase = await createClient();
  let q = supabase
    .from('jogos')
    .select(`
      *,
      time_casa:times!time_casa_id(id, nome, sigla, escudo_cor),
      time_visitante:times!time_visitante_id(id, nome, sigla, escudo_cor),
      campeonato:campeonatos(id, nome)
    `)
    .order('data', { ascending: false });
  if (status) q = q.eq('status', status);
  if (campeonatoId) q = q.eq('campeonato_id', campeonatoId);
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return data;
}

export async function getClassificacao(campeonatoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_classificacao')
    .select('*')
    .eq('campeonato_id', campeonatoId)
    .order('pontos', { ascending: false })
    .order('gols_pro', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPatrocinadores(onlyActive = true) {
  const supabase = await createClient();
  let q = supabase.from('patrocinadores').select('*').order('valor_mensal', { ascending: false });
  if (onlyActive) q = q.eq('ativo', true);
  const { data, error } = await q;
  if (error) throw error;
  return data as Patrocinador[];
}

export async function createPatrocinador(input: Omit<Patrocinador, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patrocinadores')
    .insert({ ...input, created_by: (await supabase.auth.getUser()).data.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatrocinador(id: string, patch: Partial<Patrocinador>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('patrocinadores').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePatrocinador(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('patrocinadores').delete().eq('id', id);
  if (error) throw error;
}

export async function getInscricoes(status?: Inscricao['status']) {
  const supabase = await createClient();
  let q = supabase
    .from('inscricoes')
    .select(`
      *,
      time:times(id, nome, sigla),
      campeonato:campeonatos(id, nome, ano)
    `)
    .order('submitted_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function approveInscricao(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inscricoes')
    .update({
      status: 'aprovada',
      approved_at: new Date().toISOString(),
      approved_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSumula(jogoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sumulas')
    .select(`
      *,
      jogo:jogos(
        *,
        time_casa:times!time_casa_id(nome, sigla, escudo_cor),
        time_visitante:times!time_visitante_id(nome, sigla, escudo_cor)
      )
    `)
    .eq('jogo_id', jogoId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSumula(jogoId: string, content: Omit<Sumula, 'id' | 'jogo_id' | 'created_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sumulas')
    .upsert(
      { jogo_id: jogoId, ...content },
      { onConflict: 'jogo_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Receita mensal (últimos 6 meses)
export async function getReceitaMensal() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_receita_mensal'); // criar a function se quiser
  if (error) throw error;
  return data;
}
