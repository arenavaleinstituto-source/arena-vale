import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { carregarEnvTeste } from '../../scripts/db/teste-env';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante, type UsuarioTeste } from './fixtures';
import { jogo, montarCenario, type Cenario } from './cenario';

let c: Cenario;
let n = 0;

/** CPF de 11 dígitos diferente a cada chamada (o banco não deixa repetir CPF entre testes). */
function cpfNovo(): string {
  return '9' + String(Date.now()).slice(-7) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}
const comPontos = (cpf: string) => `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;

async function inserir<T = { id: string }>(tabela: string, linha: Record<string, unknown>): Promise<T> {
  const { data, error } = await admin().from(tabela).insert(linha).select().single();
  if (error) throw new Error(`${tabela}: ${error.message}`);
  return data as T;
}

async function campeonatoNovo(extra: Record<string, unknown> = {}): Promise<string> {
  n += 1;
  return (await inserir('campeonatos', { nome: `Camp T ${Date.now()}-${n}`, ano: 2026, ...extra })).id;
}

async function ligarModerador(m: UsuarioTeste, campeonato: string) {
  await inserir('campeonato_moderadores', { profile_id: m.id, campeonato_id: campeonato });
}

async function campeonatoDoBanco(id: string) {
  const { data } = await admin().from('campeonatos').select('*').eq('id', id).single();
  return data as Record<string, unknown>;
}

async function criarDelegado(): Promise<UsuarioTeste> {
  const u = await criarUsuario('autenticado');
  await admin().from('profiles').update({ role: 'delegado' }).eq('id', u.id);
  return u;
}

async function capitaoDoTime(time: string, campeonato: string): Promise<UsuarioTeste> {
  const u = await criarUsuario('capitao');
  await inserir('time_capitaes', { profile_id: u.id, campeonato_id: campeonato, time_id: time });
  return u;
}

async function inscricao(campeonato: string, time: string): Promise<string> {
  const { data } = await admin().from('inscricoes').select('id').eq('campeonato_id', campeonato).eq('time_id', time).maybeSingle();
  if (data) return (data as { id: string }).id;
  return (await inserir('inscricoes', { campeonato_id: campeonato, time_id: time, status: 'aprovada' })).id;
}

describe('campeonatos (0023)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
  });

  describe('criação e visibilidade', () => {
    it('moderador cria campeonato escondido e fica ligado a ele', async () => {
      const m = await clienteComo(c.moderador);
      const { data: id, error } = await m.rpc('criar_campeonato', { p_nome: 'Copa Nova', p_ano: 2026, p_modalidade: 'futsal', p_categoria: null });
      expect(error).toBeNull();
      const camp = await campeonatoDoBanco(id as string);
      expect(camp.visivel).toBe(false);
      expect(camp.slug).toMatch(/^copa-nova-2026/);
      const { data: vinc } = await admin().from('campeonato_moderadores').select('profile_id').eq('campeonato_id', id);
      expect(vinc).toEqual([{ profile_id: c.moderador.id }]);
    });

    it('usuário comum não cria campeonato', async () => {
      const u = await clienteComo(await criarUsuario('autenticado'));
      const { error } = await u.rpc('criar_campeonato', { p_nome: 'Pirata', p_ano: 2026, p_modalidade: null, p_categoria: null });
      expect(error).not.toBeNull();
    });

    it('visitante não lê o campeonato escondido nem os jogos dele', async () => {
      const oculto = await campeonatoNovo();
      const j = await inserir('jogos', { campeonato_id: oculto, data: null, time_casa_id: null, time_visitante_id: null });
      const v = visitante();
      expect((await v.from('campeonatos').select('id').eq('id', oculto)).data).toEqual([]);
      expect((await v.from('jogos').select('id').eq('id', j.id)).data).toEqual([]);
    });

    it('moderador A não lê o campeonato escondido de B nem o edita', async () => {
      const outro = await criarUsuario('moderador');
      const deB = await campeonatoNovo();
      await ligarModerador(outro, deB);
      const m = await clienteComo(c.moderador);
      expect((await m.from('campeonatos').select('id').eq('id', deB)).data).toEqual([]);
      await m.from('campeonatos').update({ nome: 'Invadido' }).eq('id', deB);
      expect((await campeonatoDoBanco(deB)).nome).not.toBe('Invadido');
    });

    it('moderador não muda visivel', async () => {
      const m = await clienteComo(c.moderador);
      const { error } = await m.from('campeonatos').update({ visivel: false }).eq('id', c.campA);
      expect(error?.message).toMatch(/Só a ARENA VALE muda isso\./);
      expect((await campeonatoDoBanco(c.campA)).visivel).toBe(true);
    });
  });

  describe('poder só no campeonato cadastrado', () => {
    it('moderador ligado a A e C mexe nos dois e não em B', async () => {
      const campC = await campeonatoNovo({ visivel: true });
      await ligarModerador(c.moderador, campC);
      const jogoC = (await inserir('jogos', { campeonato_id: campC, data: null, time_casa_id: c.casa, time_visitante_id: c.fora })).id;
      const m = await clienteComo(c.moderador);

      await m.from('jogos').update({ local: 'Ginásio novo A' }).eq('id', c.jogoA);
      await m.from('jogos').update({ local: 'Ginásio novo C' }).eq('id', jogoC);
      await m.from('jogos').update({ local: 'Ginásio novo B' }).eq('id', c.jogoB);
      expect((await jogo(c.jogoA)).local).toBe('Ginásio novo A');
      expect((await jogo(jogoC)).local).toBe('Ginásio novo C');
      expect((await jogo(c.jogoB)).local).toBe('Ginásio B');

      expect((await m.from('inscricoes').insert({ campeonato_id: campC, time_id: c.casa, status: 'aprovada' })).error).toBeNull();
      expect((await m.from('inscricoes').insert({ campeonato_id: c.campB, time_id: c.casa, status: 'aprovada' })).error).not.toBeNull();

      expect((await m.from('jogos').insert({ campeonato_id: campC, time_casa_id: c.casa, time_visitante_id: c.fora })).error).toBeNull();
      expect((await m.from('jogos').insert({ campeonato_id: c.campB, time_casa_id: c.casa, time_visitante_id: c.fora })).error).not.toBeNull();
      await m.from('jogos').delete().eq('id', c.jogoB);
      expect(await jogo(c.jogoB)).toBeTruthy();
    });

    it('moderador muda data e local de um jogo do seu campeonato', async () => {
      const m = await clienteComo(c.moderador);
      const { error } = await m.from('jogos').update({ data: '2031-05-05T15:00:00', local: 'Quadra 2' }).eq('id', c.jogoA);
      expect(error).toBeNull();
      expect((await jogo(c.jogoA)).local).toBe('Quadra 2');
    });

    it('moderador não muda o delegado do jogo', async () => {
      const d = await criarDelegado();
      const m = await clienteComo(c.moderador);
      const { error } = await m.from('jogos').update({ delegado_id: d.id }).eq('id', c.jogoA);
      expect(error?.message).toMatch(/coordenação altera dados estruturais/);
      expect((await jogo(c.jogoA)).delegado_id).toBeNull();
    });

    it('time cadastrado pelo moderador: edita só enquanto joga apenas nos campeonatos dele', async () => {
      const m = await clienteComo(c.moderador);
      const { data: t, error } = await m.from('times').insert({ nome: 'Meu Time', sigla: 'MEU', cadastrado_por: c.moderador.id }).select('id').single();
      expect(error).toBeNull();
      const timeId = (t as { id: string }).id;
      await inscricao(c.campA, timeId);
      await m.from('times').update({ nome: 'Meu Time FC' }).eq('id', timeId);
      expect((await admin().from('times').select('nome').eq('id', timeId).single()).data?.nome).toBe('Meu Time FC');

      await inscricao(c.campB, timeId);
      await m.from('times').update({ nome: 'Mudou de novo' }).eq('id', timeId);
      expect((await admin().from('times').select('nome').eq('id', timeId).single()).data?.nome).toBe('Meu Time FC');
    });
  });

  describe('limite de 3 moderadores', () => {
    it('o 4º vínculo é recusado, mesmo pela coordenação', async () => {
      const coord = await criarUsuario('coordenador');
      await ligarModerador(await criarUsuario('moderador'), c.campA);
      await ligarModerador(await criarUsuario('moderador'), c.campA);
      const quarto = await criarUsuario('moderador');
      const cl = await clienteComo(coord);
      const { error } = await cl.from('campeonato_moderadores').insert({ profile_id: quarto.id, campeonato_id: c.campA });
      expect(error?.message).toMatch(/Este campeonato já tem 3 moderadores\./);
    });

    it('o limite é por campeonato: moderador com 2 colegas cria outro normalmente', async () => {
      await ligarModerador(await criarUsuario('moderador'), c.campA);
      await ligarModerador(await criarUsuario('moderador'), c.campA);
      const m = await clienteComo(c.moderador);
      const { error } = await m.rpc('criar_campeonato', { p_nome: 'Outra Copa', p_ano: 2027, p_modalidade: null, p_categoria: null });
      expect(error).toBeNull();
    });
  });

  describe('correção de jogo encerrado', () => {
    async function finalizar(id: string) {
      await admin().from('jogos').update({ placar_casa: 1, placar_visitante: 0, status: 'finalizado' }).eq('id', id);
    }

    it('coordenação corrige 1x0 para 2x2 e a correção é registrada', async () => {
      const coord = await criarUsuario('coordenador');
      await finalizar(c.jogoA);
      const cl = await clienteComo(coord);
      const { error } = await cl.from('jogos').update({ placar_casa: 2, placar_visitante: 2 }).eq('id', c.jogoA);
      expect(error).toBeNull();
      expect((await jogo(c.jogoA)).status).toBe('finalizado');
      const { data } = await admin().from('correcoes_jogo').select('*').eq('jogo_id', c.jogoA);
      expect(data).toHaveLength(1);
      const linha = (data as { corrigido_por: string; antes: { placar_casa: number }; depois: { placar_casa: number } }[])[0];
      expect(linha.corrigido_por).toBe(coord.id);
      expect(linha.antes.placar_casa).toBe(1);
      expect(linha.depois.placar_casa).toBe(2);
    });

    it('moderador corrige o jogo encerrado do seu campeonato, e não o de outro', async () => {
      await finalizar(c.jogoA);
      await finalizar(c.jogoB);
      const m = await clienteComo(c.moderador);
      await m.from('jogos').update({ placar_casa: 3 }).eq('id', c.jogoA);
      await m.from('jogos').update({ placar_casa: 3 }).eq('id', c.jogoB);
      expect((await jogo(c.jogoA)).placar_casa).toBe(3);
      expect((await jogo(c.jogoB)).placar_casa).toBe(1);
      const { data } = await admin().from('correcoes_jogo').select('corrigido_por').eq('jogo_id', c.jogoA);
      expect(data).toEqual([{ corrigido_por: c.moderador.id }]);
    });

    it('só a coordenação lê as correções', async () => {
      const d = await criarDelegado();
      await admin().from('jogos').update({ delegado_id: d.id }).eq('id', c.jogoA);
      await finalizar(c.jogoA);
      await admin().from('jogos').update({ placar_casa: 4 }).eq('id', c.jogoA);
      for (const cl of [visitante(), await clienteComo(c.moderador), await clienteComo(d)]) {
        const { data } = await cl.from('correcoes_jogo').select('id').eq('jogo_id', c.jogoA);
        expect(data ?? []).toEqual([]);
      }
      const coord = await clienteComo(await criarUsuario('coordenador'));
      expect((await coord.from('correcoes_jogo').select('id').eq('jogo_id', c.jogoA)).data).toHaveLength(1);
    });

    it('o delegado, rebaixado ao finalizar, não muda mais o placar', async () => {
      const d = await criarDelegado();
      await admin().from('jogos').update({ delegado_id: d.id }).eq('id', c.jogoA);
      const cl = await clienteComo(d);
      await cl.from('jogos').update({ placar_casa: 1, status: 'finalizado' }).eq('id', c.jogoA);
      await cl.from('jogos').update({ placar_casa: 9 }).eq('id', c.jogoA);
      expect((await jogo(c.jogoA)).placar_casa).toBe(1);
    });
  });

  describe('elenco por campeonato (CPF)', () => {
    it('mesmo CPF com e sem pontos: o segundo time é recusado e o primeiro mantém o atleta', async () => {
      const iCasa = await inscricao(c.campA, c.casa);
      const iFora = await inscricao(c.campA, c.fora);
      const capCasa = await clienteComo(await capitaoDoTime(c.casa, c.campA));
      const capFora = await clienteComo(await capitaoDoTime(c.fora, c.campB));
      const cpf = cpfNovo();
      const um = await capCasa.rpc('inscrever_atleta', { p_inscricao: iCasa, p_cpf: comPontos(cpf), p_nome: 'Fulano', p_posicao: null, p_numero: 10, p_foto_url: null });
      expect(um.error).toBeNull();
      const dois = await capFora.rpc('inscrever_atleta', { p_inscricao: iFora, p_cpf: cpf, p_nome: 'Fulano', p_posicao: null, p_numero: 9, p_foto_url: null });
      const { data: casa } = await admin().from('times').select('nome').eq('id', c.casa).single();
      expect(dois.error?.message).toBe(`Este atleta já está inscrito neste campeonato pelo time ${casa!.nome}.`);
      const { data } = await admin().from('inscricao_atletas').select('inscricao_id').eq('campeonato_id', c.campA);
      expect(data).toEqual([{ inscricao_id: iCasa }]);
    });

    it('o mesmo CPF entra normalmente em outro campeonato', async () => {
      const iA = await inscricao(c.campA, c.casa);
      const iB = await inscricao(c.campB, c.fora);
      const coord = await clienteComo(await criarUsuario('coordenador'));
      const cpf = cpfNovo();
      expect((await coord.rpc('inscrever_atleta', { p_inscricao: iA, p_cpf: cpf, p_nome: 'Ciclano', p_posicao: null, p_numero: null, p_foto_url: null })).error).toBeNull();
      expect((await coord.rpc('inscrever_atleta', { p_inscricao: iB, p_cpf: cpf, p_nome: 'Ciclano', p_posicao: null, p_numero: null, p_foto_url: null })).error).toBeNull();
    });

    it('capitão do A tira o atleta e aí o B consegue; o capitão do B não apaga a linha do A', async () => {
      const iCasa = await inscricao(c.campA, c.casa);
      const iFora = await inscricao(c.campA, c.fora);
      const capCasa = await clienteComo(await capitaoDoTime(c.casa, c.campA));
      const capFora = await clienteComo(await capitaoDoTime(c.fora, c.campB));
      const cpf = cpfNovo();
      const { data: linhaId } = await capCasa.rpc('inscrever_atleta', { p_inscricao: iCasa, p_cpf: cpf, p_nome: 'Beltrano', p_posicao: null, p_numero: null, p_foto_url: null });
      await capFora.from('inscricao_atletas').delete().eq('id', linhaId);
      expect((await admin().from('inscricao_atletas').select('id').eq('id', linhaId)).data).toHaveLength(1);
      await capCasa.from('inscricao_atletas').delete().eq('id', linhaId);
      expect((await admin().from('inscricao_atletas').select('id').eq('id', linhaId)).data).toEqual([]);
      const r = await capFora.rpc('inscrever_atleta', { p_inscricao: iFora, p_cpf: comPontos(cpf), p_nome: 'Beltrano', p_posicao: null, p_numero: null, p_foto_url: null });
      expect(r.error).toBeNull();
    });
  });

  describe('escudo do time', () => {
    it('só o capitão do time troca o escudo', async () => {
      const cap = await clienteComo(await capitaoDoTime(c.casa, c.campA));
      expect((await cap.from('times').update({ escudo_cor: '#112233' }).eq('id', c.casa)).error).toBeNull();
      expect((await admin().from('times').select('escudo_cor').eq('id', c.casa).single()).data?.escudo_cor).toBe('#112233');

      const outroCap = await clienteComo(await capitaoDoTime(c.fora, c.campB));
      await outroCap.from('times').update({ escudo_cor: '#445566' }).eq('id', c.casa);

      const coord = await clienteComo(await criarUsuario('coordenador'));
      const rCoord = await coord.from('times').update({ escudo_cor: '#778899' }).eq('id', c.casa);
      expect(rCoord.error?.message).toMatch(/Só o capitão do time troca o escudo\./);

      const m = await clienteComo(c.moderador);
      const { data: t } = await m.from('times').insert({ nome: 'Do Moderador', sigla: 'MOD', cadastrado_por: c.moderador.id }).select('id').single();
      const rMod = await m.from('times').update({ escudo_cor: '#000000' }).eq('id', (t as { id: string }).id);
      expect(rMod.error?.message).toMatch(/Só o capitão do time troca o escudo\./);

      expect((await admin().from('times').select('escudo_cor').eq('id', c.casa).single()).data?.escudo_cor).toBe('#112233');
    });
  });

  describe('revisão final', () => {
    it('moderador não cria jogo com delegado escolhido por ele', async () => {
      const coord = await criarUsuario('coordenador');
      const m = await clienteComo(c.moderador);
      const r = await m.from('jogos').insert({ campeonato_id: c.campA, delegado_id: coord.id, status: 'agendado' });
      expect(r.error?.message).toMatch(/Apenas a coordenação escolhe o delegado\./);
      const semDelegado = await m.from('jogos').insert({ campeonato_id: c.campA, status: 'agendado' });
      expect(semDelegado.error).toBeNull();
    });

    it('finalizar um jogo só rebaixa quem ainda é delegado', async () => {
      const coord = await criarUsuario('coordenador');
      const j = await inserir('jogos', { campeonato_id: c.campA, delegado_id: coord.id, status: 'agendado' });
      await admin().from('jogos').update({ status: 'finalizado', placar_casa: 1, placar_visitante: 0 }).eq('id', j.id);
      expect((await admin().from('profiles').select('role').eq('id', coord.id).single()).data?.role).toBe('coordenador');
    });

    it('capitão não troca o atleta de uma linha do elenco', async () => {
      const ins = await inscricao(c.campA, c.casa);
      const a = await inserir('jogadores', { nome: 'Atleta A', cpf: cpfNovo(), time_id: c.casa });
      const b = await inserir('jogadores', { nome: 'Craque B', cpf: cpfNovo(), time_id: c.fora });
      const linha = await inserir('inscricao_atletas', { inscricao_id: ins, jogador_id: a.id });
      const cap = await clienteComo(await capitaoDoTime(c.casa, c.campA));
      const r = await cap.from('inscricao_atletas').update({ jogador_id: b.id }).eq('id', linha.id);
      expect(r.error?.message).toMatch(/Só a coordenação troca o atleta do elenco\./);
      const numero = await cap.from('inscricao_atletas').update({ numero_camisa: 9 }).eq('id', linha.id);
      expect(numero.error).toBeNull();
    });

    it('capitão não apaga nem muda atleta que está no elenco de outro time', async () => {
      const p = await inserir('jogadores', { nome: 'Atleta P', cpf: cpfNovo(), time_id: c.casa });
      await inserir('inscricao_atletas', { inscricao_id: await inscricao(c.campA, c.fora), jogador_id: p.id });
      const cap = await clienteComo(await capitaoDoTime(c.casa, c.campA));
      const apagar = await cap.from('jogadores').delete().eq('id', p.id);
      expect(apagar.error?.message).toMatch(/Este atleta está no elenco de outro time/);
      const mudar = await cap.from('jogadores').update({ nome: 'Outro Nome' }).eq('id', p.id);
      expect(mudar.error?.message).toMatch(/Este atleta está no elenco de outro time/);
      expect((await admin().from('jogadores').select('nome').eq('id', p.id).single()).data?.nome).toBe('Atleta P');

      const so = await inserir('jogadores', { nome: 'Só Daqui', cpf: cpfNovo(), time_id: c.casa });
      expect((await cap.from('jogadores').update({ nome: 'Só Daqui Jr' }).eq('id', so.id)).error).toBeNull();
    });
  });

  it('reaplicar a 0023 duas vezes não dá erro', async () => {
    const env = carregarEnvTeste();
    const cli = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
    await cli.connect();
    try {
      const sql = readFileSync('supabase/migrations/0023_campeonatos.sql', 'utf8');
      await cli.query(sql);
      await cli.query(sql);
    } finally {
      await cli.end();
    }
  });
});
