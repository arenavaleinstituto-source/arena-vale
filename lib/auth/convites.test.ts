import { describe, expect, it, vi } from 'vitest';
import { convidar, type PortasConvite } from './convites';

function portas(over: Partial<PortasConvite> = {}, existente: { id: string; role: string } | null = null) {
  const p: PortasConvite = {
    buscarPerfilPorEmail: vi.fn().mockResolvedValue(existente),
    convidarPorEmail: vi.fn().mockResolvedValue('novo-id'),
    definirCargo: vi.fn().mockResolvedValue(null),
    vincular: vi.fn().mockResolvedValue(null),
    ...over,
  };
  return p;
}

const coord = { cargo: 'coordenador' as const, ehDono: false };
const dono = { cargo: 'coordenador' as const, ehDono: true };
const ORIGEM = 'https://arena-vale.vercel.app';

describe('convidar', () => {
  it('coordenador convida moderador com campeonato', async () => {
    const p = portas();
    const r = await convidar({ email: 'Mod@Exemplo.com ', cargo: 'moderador', campeonatoId: 'c1' }, { quemChama: coord, origem: ORIGEM, ...p });
    expect(r).toEqual({ ok: true, jaTinhaConta: false });
    expect(p.convidarPorEmail).toHaveBeenCalledWith('mod@exemplo.com', `${ORIGEM}/criar-senha`);
    expect(p.definirCargo).toHaveBeenCalledWith('novo-id', 'moderador');
    expect(p.vincular).toHaveBeenCalledWith('moderador', 'novo-id', 'c1');
  });

  it('coordenador não convida coordenador (403)', async () => {
    const r = await convidar({ email: 'a@b.com', cargo: 'coordenador' }, { quemChama: coord, origem: ORIGEM, ...portas() });
    expect(r).toEqual({ ok: false, status: 403, erro: 'Só o proprietário convida coordenadores.' });
  });

  it('dono convida coordenador (sem campeonato)', async () => {
    const p = portas();
    const r = await convidar({ email: 'a@b.com', cargo: 'coordenador' }, { quemChama: dono, origem: ORIGEM, ...p });
    expect(r.ok).toBe(true);
    expect(p.definirCargo).toHaveBeenCalledWith('novo-id', 'coordenador');
    expect(p.vincular).not.toHaveBeenCalled();
  });

  it('moderador sem campeonato → 400', async () => {
    const r = await convidar({ email: 'a@b.com', cargo: 'moderador' }, { quemChama: coord, origem: ORIGEM, ...portas() });
    expect(r).toEqual({ ok: false, status: 400, erro: 'Escolha o campeonato.' });
  });

  it('e-mail inválido → 400', async () => {
    const r = await convidar({ email: 'sem-arroba', cargo: 'capitao', campeonatoId: 'c1' }, { quemChama: coord, origem: ORIGEM, ...portas() });
    expect(r).toEqual({ ok: false, status: 400, erro: 'E-mail inválido.' });
  });

  it('e-mail existente não chama inviteUserByEmail e retorna jaTinhaConta true', async () => {
    const p = portas({}, { id: 'ja-existe', role: 'autenticado' });
    const r = await convidar({ email: 'a@b.com', cargo: 'capitao', campeonatoId: 'c1' }, { quemChama: coord, origem: ORIGEM, ...p });
    expect(r).toEqual({ ok: true, jaTinhaConta: true });
    expect(p.convidarPorEmail).not.toHaveBeenCalled();
    expect(p.vincular).toHaveBeenCalledWith('capitao', 'ja-existe', 'c1');
  });

  it('mesma pessoa já moderadora ganha só o vínculo novo', async () => {
    const p = portas({}, { id: 'm1', role: 'moderador' });
    const r = await convidar({ email: 'a@b.com', cargo: 'moderador', campeonatoId: 'c2' }, { quemChama: coord, origem: ORIGEM, ...p });
    expect(r.ok).toBe(true);
    expect(p.definirCargo).not.toHaveBeenCalled();
    expect(p.vincular).toHaveBeenCalledWith('moderador', 'm1', 'c2');
  });

  it('não muda o cargo de quem é da coordenação', async () => {
    const p = portas({}, { id: 'c9', role: 'coordenador' });
    const r = await convidar({ email: 'a@b.com', cargo: 'capitao', campeonatoId: 'c1' }, { quemChama: coord, origem: ORIGEM, ...p });
    expect(r).toEqual({ ok: false, status: 400, erro: 'Essa pessoa já faz parte da coordenação.' });
    expect(p.definirCargo).not.toHaveBeenCalled();
  });

  it('não troca moderador por capitão (cargo único)', async () => {
    const p = portas({}, { id: 'm1', role: 'moderador' });
    const r = await convidar({ email: 'a@b.com', cargo: 'capitao', campeonatoId: 'c1' }, { quemChama: coord, origem: ORIGEM, ...p });
    expect(r).toEqual({ ok: false, status: 400, erro: 'Essa pessoa já é moderador. Use outro e-mail.' });
  });

  it('limite de coordenadores devolve 400 com a mensagem do banco', async () => {
    const p = portas({ definirCargo: vi.fn().mockResolvedValue('Limite de 3 coordenadores atingido.') });
    const r = await convidar({ email: 'a@b.com', cargo: 'coordenador' }, { quemChama: dono, origem: ORIGEM, ...p });
    expect(r).toEqual({ ok: false, status: 400, erro: 'Limite de 3 coordenadores atingido.' });
  });

  it.each(['moderador', 'capitao', 'autenticado', 'visitante'] as const)('%s não convida ninguém (403)', async (cargo) => {
    const r = await convidar({ email: 'a@b.com', cargo: 'capitao', campeonatoId: 'c1' }, { quemChama: { cargo, ehDono: false }, origem: ORIGEM, ...portas() });
    expect(r).toEqual({ ok: false, status: 403, erro: 'Só a coordenação envia convites.' });
  });
});
