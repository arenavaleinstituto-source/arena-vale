export const MSG = {
  credencial: 'E-mail ou senha inválidos',
  naoConfirmado: 'Confirme seu e-mail antes de entrar.',
  conexao: 'Não foi possível entrar. Verifique sua conexão e tente de novo.',
  semCargo: 'Sua conta ainda não tem acesso à área da equipe. Fale com a coordenação.',
  linkEnviado: 'Link enviado — confira seu e-mail',
  resetEnviado: 'Enviamos um e-mail para redefinir a senha.',
  informeEmail: 'Informe seu e-mail.',
} as const;

type ErroAuth = { code?: string; status?: number; message?: string } | null | undefined;

/** Traduz o erro do Supabase Auth na mensagem que a pessoa vê. */
export function mensagemDeErroLogin(erro: ErroAuth): string {
  if (!erro) return MSG.conexao;
  if (erro.code === 'invalid_credentials' || /invalid login credentials/i.test(erro.message ?? '')) return MSG.credencial;
  if (erro.code === 'email_not_confirmed' || /email not confirmed/i.test(erro.message ?? '')) return MSG.naoConfirmado;
  return MSG.conexao;
}

export const ROTULO_CARGO: Record<string, string> = {
  coordenador: 'Coordenador',
  moderador: 'Moderador',
  capitao: 'Capitão',
};

export function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'AV';
  const primeira = partes[0][0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? '' : '';
  return (primeira + ultima).toUpperCase();
}
