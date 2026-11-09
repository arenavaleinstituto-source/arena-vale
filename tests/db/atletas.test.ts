import { beforeEach, describe, expect, it } from 'vitest';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';
import { montarCenario, type Cenario } from './cenario';

let c: Cenario;
let n = 0;
/** CPF único por teste (o banco exige CPF único entre todos os jogadores). */
const cpfUnico = () => `${Date.now()}`.slice(-9) + String((n += 1) % 100).padStart(2, '0');

describe('atletas: CPF protegido e fotos por equipe (0012)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    c = await montarCenario();
    // o capitão já criou a equipe "casa"
    await admin().from('time_capitaes').update({ time_id: c.casa }).eq('profile_id', c.capitao.id);
  });

  it('visitante vê o nome do atleta, mas nunca o CPF', async () => {
    await admin().from('jogadores').insert({ nome: 'Atleta Público', cpf: cpfUnico(), time_id: c.casa });
    const comCpf = await visitante().from('jogadores').select('nome, cpf').eq('time_id', c.casa);
    expect(comCpf.error?.code).toBe('42501');
    const semCpf = await visitante().from('jogadores').select('id, nome, posicao, numero_camisa, foto_url, time_id').eq('time_id', c.casa);
    expect(semCpf.data?.map((j) => j.nome)).toEqual(['Atleta Público']);
  });

  it('outro usuário logado (moderador) também não lê o CPF', async () => {
    const mod = await clienteComo(c.moderador);
    expect((await mod.from('jogadores').select('cpf').limit(1)).error?.code).toBe('42501');
  });

  it('capitão cadastra atleta com CPF na própria equipe e vê o CPF só dela', async () => {
    const cap = await clienteComo(c.capitao);
    const cpf = cpfUnico();
    const { data, error } = await cap.from('jogadores').insert({ nome: 'Craque', cpf, time_id: c.casa }).select('id, nome').single();
    expect(error).toBeNull();
    const { data: cpfs, error: e2 } = await cap.rpc('cpfs_do_time', { t: c.casa });
    expect(e2).toBeNull();
    expect(cpfs).toEqual([{ id: data!.id, cpf }]);
    const outro = await cap.rpc('cpfs_do_time', { t: c.fora });
    expect(outro.error?.message).toContain('Sem permissão.');
  });

  it('capitão não cadastra atleta em equipe de outro', async () => {
    const cap = await clienteComo(c.capitao);
    const { error } = await cap.from('jogadores').insert({ nome: 'Intruso', cpf: cpfUnico(), time_id: c.fora });
    expect(error).not.toBeNull();
  });

  it('coordenação vê os CPFs de qualquer equipe', async () => {
    await admin().from('jogadores').insert({ nome: 'Da Fora', cpf: cpfUnico(), time_id: c.fora });
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const { data, error } = await coord.rpc('cpfs_do_time', { t: c.fora });
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('fotos: capitão envia na pasta da própria equipe, não na de outra', async () => {
    const cap = await clienteComo(c.capitao);
    const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });
    const ok = await cap.storage.from('atletas-fotos').upload(`${c.casa}/teste-${Date.now()}.png`, png, { contentType: 'image/png' });
    expect(ok.error).toBeNull();
    const ruim = await cap.storage.from('atletas-fotos').upload(`${c.fora}/teste-${Date.now()}.png`, png, { contentType: 'image/png' });
    expect(ruim.error).not.toBeNull();
  });
});
