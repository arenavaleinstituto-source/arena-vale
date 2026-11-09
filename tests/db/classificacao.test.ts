import { beforeEach, describe, expect, it } from 'vitest';
import { admin, limparCoordenadores } from './fixtures';
import { montarCenario, type Cenario } from './cenario';

let c: Cenario;

async function linha(time: string) {
  const { data, error } = await admin().from('v_classificacao').select('*').eq('campeonato_id', c.campA).eq('time_id', time).single();
  if (error) throw new Error(error.message);
  return data as Record<string, number>;
}

describe('v_classificacao (0010)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
  });

  it('vitória 3-1 como visitante dá 3 pontos, gols pró 3, contra 1', async () => {
    await admin().from('jogos').update({ placar_casa: 1, placar_visitante: 3, status: 'finalizado' }).eq('id', c.jogoA);
    const fora = await linha(c.fora);
    expect(fora).toMatchObject({ jogos: 1, vitorias: 1, empates: 0, derrotas: 0, gols_pro: 3, gols_contra: 1, saldo: 2, pontos: 3 });
    const casa = await linha(c.casa);
    expect(casa).toMatchObject({ jogos: 1, derrotas: 1, gols_pro: 1, gols_contra: 3, saldo: -2, pontos: 0 });
  });

  it('empate dá 1 ponto para cada', async () => {
    await admin().from('jogos').update({ placar_casa: 2, placar_visitante: 2, status: 'finalizado' }).eq('id', c.jogoA);
    expect((await linha(c.casa)).pontos).toBe(1);
    expect((await linha(c.fora)).pontos).toBe(1);
  });

  it('jogo agendado não conta', async () => {
    await admin().from('jogos').update({ placar_casa: 4, placar_visitante: 0 }).eq('id', c.jogoA);
    expect(await linha(c.casa)).toMatchObject({ jogos: 0, pontos: 0, gols_pro: 0 });
  });
});
