import type { SupabaseClient } from '@supabase/supabase-js';
import type { Cargo } from './rotas';
import { ROTULO_CARGO } from './mensagens';

export type CargoConvite = 'coordenador' | 'moderador' | 'capitao';
export type EntradaConvite = { email: string; cargo: CargoConvite; campeonatoId?: string | null; senha?: string | null; nome?: string | null };
export type ResultadoConvite =
  | { ok: true; jaTinhaConta: boolean }
  | { ok: false; status: 400 | 403; erro: string };

/** Operações de banco usadas pelo convite (injetadas para poder testar sem banco). */
export type PortasConvite = {
  buscarPerfilPorEmail(email: string): Promise<{ id: string; role: string } | null>;
  convidarPorEmail(email: string, redirectTo: string, nome?: string | null): Promise<string>;
  /** Cria a conta já confirmada, com a senha definida pela coordenação. */
  criarComSenha(email: string, senha: string, nome: string): Promise<string>;
  /** Retorna a mensagem de erro do banco, ou null se deu certo. */
  definirCargo(id: string, cargo: CargoConvite): Promise<string | null>;
  vincular(cargo: 'moderador' | 'capitao', id: string, campeonatoId: string): Promise<string | null>;
};

type Deps = PortasConvite & { quemChama: { cargo: Cargo; ehDono: boolean }; origem: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Convite por e-mail (spec 5.3). Só a coordenação convida; coordenadores só o
 * dono. Moderador e capitão sempre ligados a um campeonato. Quem já tem conta
 * não recebe convite novo — só ganha o cargo e o vínculo.
 */
export async function convidar(entrada: EntradaConvite, deps: Deps): Promise<ResultadoConvite> {
  if (deps.quemChama.cargo !== 'coordenador') return { ok: false, status: 403, erro: 'Só a coordenação envia convites.' };
  if (entrada.cargo === 'coordenador' && !deps.quemChama.ehDono) {
    return { ok: false, status: 403, erro: 'Só a coordenação principal convida coordenadores.' };
  }
  const email = entrada.email.trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, status: 400, erro: 'E-mail inválido.' };
  const campeonatoId = entrada.campeonatoId ?? null;
  if (entrada.cargo !== 'coordenador' && !campeonatoId) return { ok: false, status: 400, erro: 'Escolha o campeonato.' };
  const senha = entrada.senha ?? null;
  if (senha !== null && senha.length < 8) return { ok: false, status: 400, erro: 'A senha precisa ter pelo menos 8 caracteres.' };
  const nome = (entrada.nome ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);

  const existente = await deps.buscarPerfilPorEmail(email);
  if (existente?.role === 'coordenador' || existente?.role === 'proprietario') {
    if (entrada.cargo !== 'coordenador') return { ok: false, status: 400, erro: 'Essa pessoa já faz parte da coordenação.' };
    return { ok: true, jaTinhaConta: true };
  }
  if (existente && (existente.role === 'moderador' || existente.role === 'capitao') && existente.role !== entrada.cargo) {
    return { ok: false, status: 400, erro: `Essa pessoa já é ${ROTULO_CARGO[existente.role].toLowerCase()}. Use outro e-mail.` };
  }

  // Quem já tem conta mantém a própria senha: a coordenação nunca troca a senha de uma conta existente.
  if (!existente && senha && !nome) return { ok: false, status: 400, erro: 'Informe o nome da pessoa.' };
  const id = existente?.id ?? (senha ? await deps.criarComSenha(email, senha, nome) : await deps.convidarPorEmail(email, `${deps.origem}/criar-senha`, nome || null));

  if (existente?.role !== entrada.cargo) {
    const erroCargo = await deps.definirCargo(id, entrada.cargo);
    if (erroCargo) return { ok: false, status: 400, erro: erroCargo };
  }
  if (entrada.cargo !== 'coordenador') {
    const erroVinculo = await deps.vincular(entrada.cargo, id, campeonatoId!);
    if (erroVinculo) return { ok: false, status: 400, erro: erroVinculo };
  }
  return { ok: true, jaTinhaConta: Boolean(existente) };
}

/** Liga as portas ao cliente administrador do Supabase (só no servidor). */
export function portasSupabase(admin: SupabaseClient): PortasConvite {
  return {
    async buscarPerfilPorEmail(email) {
      // E-mail exato do Auth (o do perfil pode não ser confiável; ilike trataria _ e % como curinga).
      const { data, error } = await admin.rpc('perfil_por_email', { e: email });
      if (error) throw new Error(error.message);
      return (data as { id: string; role: string }[] | null)?.[0] ?? null;
    },
    async convidarPorEmail(email, redirectTo, nome) {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo, data: nome ? { full_name: nome } : undefined });
      if (error || !data.user) throw new Error(error?.message ?? 'Não foi possível enviar o convite.');
      return data.user.id;
    },
    async criarComSenha(email, senha, nome) {
      // O nome vai nos metadados: o gatilho handle_new_user (0001) grava em profiles.full_name.
      const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true, user_metadata: { full_name: nome } });
      if (error || !data.user) throw new Error(error?.message ?? 'Não foi possível criar a conta.');
      return data.user.id;
    },
    async definirCargo(id, cargo) {
      const { error } = await admin.from('profiles').update({ role: cargo }).eq('id', id);
      return error?.message ?? null;
    },
    async vincular(cargo, id, campeonatoId) {
      if (cargo === 'moderador') {
        const { error } = await admin
          .from('campeonato_moderadores')
          .upsert({ profile_id: id, campeonato_id: campeonatoId }, { onConflict: 'profile_id,campeonato_id', ignoreDuplicates: true });
        return error?.message ?? null;
      }
      const { data: jaTem } = await admin.from('time_capitaes').select('id').eq('profile_id', id).eq('campeonato_id', campeonatoId).maybeSingle();
      if (jaTem) return null;
      const { error } = await admin.from('time_capitaes').insert({ profile_id: id, campeonato_id: campeonatoId, time_id: null });
      return error?.message ?? null;
    },
  };
}
