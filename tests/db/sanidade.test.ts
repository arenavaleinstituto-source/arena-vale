import { describe, expect, it } from 'vitest';
import { carregarEnvTeste } from '../../scripts/db/teste-env';
import { admin, criarUsuario } from './fixtures';

describe('banco de testes', () => {
  it('recusa a URL de produção', () => {
    expect(() =>
      carregarEnvTeste({
        TEST_SUPABASE_URL: 'https://cpvmfpxxrdpvfbonwynr.supabase.co',
        TEST_SUPABASE_ANON_KEY: 'a',
        TEST_SUPABASE_SERVICE_ROLE_KEY: 'b',
        TEST_DATABASE_URL: 'postgresql://x',
      }),
    ).toThrow(/produção/);
  });

  it('recusa campos faltando', () => {
    expect(() => carregarEnvTeste({ TEST_SUPABASE_URL: 'https://x.supabase.co' })).toThrow(/TEST_SUPABASE_ANON_KEY/);
  });

  it('banco de teste tem as tabelas base', async () => {
    const { error } = await admin().from('campeonatos').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('criarUsuario cria perfil com o cargo pedido', async () => {
    const u = await criarUsuario('moderador');
    const { data } = await admin().from('profiles').select('role').eq('id', u.id).single();
    expect(data?.role).toBe('moderador');
  });
});
