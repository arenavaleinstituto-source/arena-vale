import { resetarBancoTeste } from '../../scripts/db/resetar-banco-teste';

/** Antes da rodada: apaga usuários de teste antigos e recria o banco de TESTES do zero. */
export default async function setup() {
  const { apagarUsuariosDeTeste } = await import('./fixtures');
  await apagarUsuariosDeTeste().catch(() => undefined);
  await resetarBancoTeste();
  return async () => {
    await apagarUsuariosDeTeste();
  };
}
