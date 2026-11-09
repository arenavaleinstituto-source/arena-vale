import { admin, criarUsuario, type UsuarioTeste } from './fixtures';

export type Cenario = {
  campA: string;
  campB: string;
  casa: string;
  fora: string;
  jogoA: string;
  jogoB: string;
  moderador: UsuarioTeste;
  capitao: UsuarioTeste;
};

let n = 0;
async function inserir<T>(tabela: string, linha: Record<string, unknown>): Promise<T> {
  const { data, error } = await admin().from(tabela).insert(linha).select().single();
  if (error) throw new Error(`cenario ${tabela}: ${error.message}`);
  return data as T;
}

/**
 * Dois campeonatos (A e B), dois times inscritos em A, um jogo agendado em
 * cada campeonato, um moderador ligado só a A e um capitão convidado para A
 * (ainda sem equipe). Tudo criado pela service role.
 */
export async function montarCenario(): Promise<Cenario> {
  n += 1;
  const sufixo = `${Date.now()}-${n}`;
  const campA = (await inserir<{ id: string }>('campeonatos', { nome: `Camp A ${sufixo}`, ano: 2026 })).id;
  const campB = (await inserir<{ id: string }>('campeonatos', { nome: `Camp B ${sufixo}`, ano: 2026 })).id;
  const casa = (await inserir<{ id: string }>('times', { nome: `Casa ${sufixo}`, sigla: 'CAS' })).id;
  const fora = (await inserir<{ id: string }>('times', { nome: `Fora ${sufixo}`, sigla: 'FOR' })).id;
  await inserir('inscricoes', { campeonato_id: campA, time_id: casa, status: 'aprovada' });
  await inserir('inscricoes', { campeonato_id: campA, time_id: fora, status: 'aprovada' });
  const quando = new Date(Date.now() + 86_400_000).toISOString();
  const jogoA = (await inserir<{ id: string }>('jogos', { campeonato_id: campA, data: quando, time_casa_id: casa, time_visitante_id: fora, local: 'Ginásio A' })).id;
  const jogoB = (await inserir<{ id: string }>('jogos', { campeonato_id: campB, data: quando, time_casa_id: casa, time_visitante_id: fora, local: 'Ginásio B' })).id;

  const moderador = await criarUsuario('moderador');
  await inserir('campeonato_moderadores', { profile_id: moderador.id, campeonato_id: campA });
  const capitao = await criarUsuario('capitao');
  await inserir('time_capitaes', { profile_id: capitao.id, campeonato_id: campA, time_id: null });

  return { campA, campB, casa, fora, jogoA, jogoB, moderador, capitao };
}

export async function jogo(id: string) {
  const { data } = await admin().from('jogos').select('*').eq('id', id).single();
  return data as Record<string, unknown>;
}
