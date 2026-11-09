import { resetarBancoTeste } from '../../scripts/db/resetar-banco-teste';

/**
 * O PostgREST recarrega o esquema de forma assíncrona depois do `notify pgrst`.
 * Sem esperar, os primeiros testes às vezes viam tabelas novas sem as permissões
 * (erro 42501). Espera até a API enxergar a tabela mais nova e as políticas dela.
 */
async function esperarApiEnxergarEsquema(): Promise<void> {
  const { visitante } = await import('./fixtures');
  for (let tentativa = 0; tentativa < 30; tentativa += 1) {
    const { error } = await visitante().from('videos_externos').select('id').limit(1);
    if (!error) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('A API do banco de TESTES não recarregou o esquema em 30 s.');
}

/** Antes da rodada: apaga usuários de teste antigos e recria o banco de TESTES do zero. */
export default async function setup() {
  const { apagarUsuariosDeTeste } = await import('./fixtures');
  await apagarUsuariosDeTeste().catch(() => undefined);
  await resetarBancoTeste();
  await esperarApiEnxergarEsquema();
  return async () => {
    await apagarUsuariosDeTeste();
  };
}
