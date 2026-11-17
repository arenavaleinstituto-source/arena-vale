import { beforeEach, describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, limparCoordenadores, type UsuarioTeste } from './fixtures';
import { jogo, montarCenario, type Cenario } from './cenario';

let c: Cenario;
let delegado: UsuarioTeste;

async function criarDelegado(): Promise<UsuarioTeste> {
  const u = await criarUsuario('autenticado');
  const { error } = await admin().from('profiles').update({ role: 'delegado' }).eq('id', u.id);
  if (error) throw new Error(`criarDelegado: ${error.message}`);
  return u;
}

async function atribuirDelegado(jogoId: string, delegadoId: string) {
  const { error } = await admin().from('jogos').update({ delegado_id: delegadoId }).eq('id', jogoId);
  if (error) throw new Error(`atribuirDelegado: ${error.message}`);
}

describe('delegado (0021)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
    delegado = await criarDelegado();
    await atribuirDelegado(c.jogoA, delegado.id);
  });

  it('delegado lê jogos normalmente', async () => {
    const d = await clienteComo(delegado);
    const { data, error } = await d.from('jogos').select('id').eq('id', c.jogoA);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('delegado atualiza placar e status do próprio jogo', async () => {
    const d = await clienteComo(delegado);
    const { error } = await d.from('jogos').update({ placar_casa: 2, placar_visitante: 1, status: 'ao_vivo' }).eq('id', c.jogoA);
    expect(error).toBeNull();
    const j = await jogo(c.jogoA);
    expect(j.placar_casa).toBe(2);
    expect(j.status).toBe('ao_vivo');
  });

  it('delegado não atualiza jogo de outro delegado', async () => {
    const d = await clienteComo(delegado);
    await d.from('jogos').update({ placar_casa: 9 }).eq('id', c.jogoB);
    expect((await jogo(c.jogoB)).placar_casa).toBe(0);
  });

  it('delegado não muda delegado_id', async () => {
    const outro = await criarDelegado();
    const d = await clienteComo(delegado);
    const { error } = await d.from('jogos').update({ delegado_id: outro.id }).eq('id', c.jogoA);
    expect(error?.message).toMatch(/coordenação altera dados estruturais/);
    expect((await jogo(c.jogoA)).delegado_id).toBe(delegado.id);
  });

  it('ao finalizar, role do delegado vira autenticado', async () => {
    await admin().from('jogos').update({ status: 'finalizado' }).eq('id', c.jogoA);
    const { data } = await admin().from('profiles').select('role').eq('id', delegado.id).single();
    expect(data?.role).toBe('autenticado');
  });

  it('coordenador continua podendo atualizar tudo', async () => {
    const coord = await criarUsuario('coordenador');
    const cl = await clienteComo(coord);
    const novaData = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const { error } = await cl.from('jogos').update({ placar_casa: 3, data: novaData }).eq('id', c.jogoA);
    expect(error).toBeNull();
    const j = await jogo(c.jogoA);
    expect(j.placar_casa).toBe(3);
    expect(j.data).not.toBeNull();
  });
});
