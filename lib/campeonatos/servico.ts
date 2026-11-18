/**
 * Serviço dos campeonatos: junta as regras puras (gerar, trava, vagas) com o banco pelas portas.
 * Roda só no servidor, depois de a rota conferir quem está pedindo.
 */
import { gerarJogos, sementesDaChave } from './gerar';
import type { PortasCampeonato } from './portas';
import { validarRegulamento } from './regulamento';
import type { FormaDisputa, JogoGerado } from './tipos';
import { planoDeRegeracao } from './trava';
import { resolverVagas } from './vagas';

export async function recalcular(id: string, p: PortasCampeonato): Promise<{ avisos: string[] }> {
  const d = await p.carregar(id);
  if (!d) return { avisos: [] };
  const r = resolverVagas(d.jogos, d.regulamento, { ...d.grupos, geral: d.times }, d.sorteios);
  if (r.atualizar.length) await p.aplicarVagas(r.atualizar);
  return { avisos: r.avisos };
}

export type OpcoesGerar = {
  forma: FormaDisputa;
  grupos?: Record<string, string[]>;
  sementes?: string[];
  formaMudou: boolean;
  aleatorio: () => number;
  simular: boolean;
};

export async function gerar(
  id: string,
  p: PortasCampeonato,
  o: OpcoesGerar,
): Promise<{ jogos: JogoGerado[]; avisos: string[] } | { erro: string }> {
  const d = await p.carregar(id);
  if (!d) return { erro: 'Campeonato não encontrado.' };

  const regulamento = { ...d.regulamento, formato_antigo: false, forma: o.forma };
  const erroRegulamento = validarRegulamento(regulamento);
  if (erroRegulamento) return { erro: erroRegulamento };

  // Ao gerar de novo, os grupos já sorteados continuam os mesmos, a não ser que venham outros.
  const grupos = o.grupos ?? (Object.keys(d.grupos).length ? d.grupos : undefined);
  // Mata-mata sorteado que já tem jogos: refaz o mesmo sorteio a partir deles (a 1ª fase não muda).
  const sementes =
    o.sementes ??
    (o.forma.tipo === 'mata_mata' && d.regulamento.forma.tipo === 'mata_mata' && d.jogos.length
      ? (sementesDaChave(d.jogos, d.times, d.regulamento.forma.mata) ?? undefined)
      : undefined);
  const gerado = gerarJogos(o.forma, d.times, { grupos, sementes, aleatorio: o.aleatorio });
  if ('erro' in gerado) return gerado;

  const formaMudou = o.formaMudou || (d.jogos.length > 0 && d.regulamento.forma.tipo !== o.forma.tipo);
  const plano = planoDeRegeracao(d.jogos, gerado.jogos, { formaMudou, destravadas: d.destravadas });
  if ('erro' in plano) return plano;
  if (o.simular) return { jogos: gerado.jogos, avisos: plano.avisos };

  await p.substituirJogos(id, plano.apagar, plano.inserir);
  await p.gravarRegulamento(id, regulamento);
  const { avisos } = await recalcular(id, p);
  return { jogos: gerado.jogos, avisos: [...plano.avisos, ...avisos] };
}
