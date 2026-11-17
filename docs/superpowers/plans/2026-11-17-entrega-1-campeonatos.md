# Entrega 1 — Campeonatos: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para seguir este plano tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`).

**Objetivo:** aba Campeonatos no site, com uma página por campeonato (escudo, classificação, chave, jogos e regulamento). As formas de disputa geram os jogos sozinhas, e a classificação e o avanço de fase são automáticos. Inclui os painéis do moderador e da coordenação, o elenco por campeonato controlado pelo CPF e o escudo do time (enviar e enquadrar, ou montar no site).

**Arquitetura:**
- Todas as regras (gerar jogos, classificar, desempatar, resolver vagas, trava por fase) ficam em funções puras em `lib/campeonatos/`, sem banco, e são testadas sozinhas.
- `lib/campeonatos/portas.ts` liga essas regras ao Supabase. As rotas `app/api/campeonatos/*` e `app/api/times/*` conferem o cargo e chamam o serviço com o cliente admin.
- O banco recebe a migração `0023_campeonatos.sql`, idempotente. As permissões ficam em RLS, triggers e funções `security definer`.

**Tecnologia:** Next.js 16.4.6 (App Router), React 19, Supabase (RLS + Storage), sharp, Tailwind, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-17-campeonatos-design.md`. Ler as seções 4.1 a 4.7 antes de cada tarefa; as regras de cálculo da 4.2 e da 4.3 são a fonte dos testes.

## Regras gerais

- A marca é sempre **ARENA VALE**. Nunca escrever "Sports" ou "Sport" em nenhum texto.
- O código e os textos de tela são em português do Brasil, com o vocabulário do projeto. Para qualquer tela, carregar o `DESIGN.md` (vermelho, branco e grafite; classes `av-*`, `btn-forte`, `btn-leve`, `panel`).
- Next.js 16: antes de escrever código específico do Next (rotas, `params`, `revalidate`), ler o guia em `node_modules/next/dist/docs/`. O padrão `params: Promise<{ slug: string }>` já é usado em `app/modalidades/[slug]/page.tsx`.
- PC com pouca memória: rodar os testes com `npx vitest run --maxWorkers=2 <arquivos>` e conferir o código de saída (`echo $?` deve dar `0`).
- Testes de banco só no projeto TESTES: `npm run test:db`. Nunca no banco oficial.
- A migração é idempotente: `if not exists`, `drop ... if exists` antes de `create policy` e `create trigger`, e `create or replace`. A 0010 apaga todas as políticas e o teste `política antiga apagada ao reaplicar a 0010` reaplica as migrações seguintes, então a 0023 precisa recriar as próprias políticas. O dono aplica a migração à mão no SQL Editor do banco oficial.
- Publicação: tudo é feito na branch `campeonatos`, com um commit por tarefa. Só no fim (Tarefa 23), depois de o dono aplicar a 0023 no banco oficial, faz-se o merge na `main`.
- Toda busca pública usa try/catch e devolve vazio se falhar. Uma fonte fora do ar nunca derruba a página.
- Sorteios recebem a função `aleatorio: () => number` como parâmetro (em produção, `Math.random`), para os testes serem determinísticos.

## Pontos de atenção da revisão

1. **Gerar jogos com menos de 2 times, ou com mais grupos do que times:** o site recusa com a mensagem "São necessários pelo menos 2 times." ou "Há mais grupos do que times." e não grava nada. O teste fica na Tarefa 4.
2. **Resultado apagado ou corrigido de "finalizado" para "agendado":** a vaga que ele preencheu no jogo seguinte volta a ficar vazia, se esse jogo ainda não tiver resultado. O teste fica na Tarefa 6.
3. **Delegado finaliza o jogo e, no mesmo instante, perde o cargo** (o trigger `bloquear_delegado_ao_finalizar` o rebaixa para `autenticado`): o pedido de recálculo que vem logo depois não pode ser recusado. Por isso a rota de recálculo aceita qualquer usuário logado (ela só recalcula a partir dos dados do banco, sem receber nada além do id). O teste fica na Tarefa 11.
4. **Abrir pelo endereço direto um campeonato ainda escondido:** o visitante recebe 404 e não lê os jogos dele. O moderador do campeonato vê a pré-visualização. Os testes ficam nas Tarefas 10 e 15.
5. **CPF digitado com pontos e traço ("529.982.247-25") e, em outro time, só com números:** é a mesma pessoa, e o segundo time é recusado. O teste de banco fica na Tarefa 10.

---

### Tarefa 1: Tipos e regulamento padrão

**Arquivos:**
- Criar: `lib/campeonatos/tipos.ts`, `lib/campeonatos/regulamento.ts`
- Teste: `lib/campeonatos/regulamento.test.ts`

**Interfaces:**
- Produz (`tipos.ts`, usado por todas as tarefas seguintes):
```ts
export type TipoPlacar = 'gols' | 'sets' | 'cestas';
export type Criterio = 'vitorias' | 'saldo' | 'pro' | 'contra' | 'confronto_direto' | 'media_sets' | 'media_pontos_sets' | 'sorteio';
export type Pontuacao =
  | { tipo: 'gols'; vitoria: number; empate: number; derrota: number }
  | { tipo: 'sets'; vitoria_direta: number; vitoria_decisivo: number; derrota_decisivo: number; derrota: number }
  | { tipo: 'cestas'; vitoria: number; derrota: number };
export type DesempateMataMata = { prorrogacao: boolean; gol_fora: boolean; final: 'penaltis' | 'melhor_campanha' };
export type OpcoesMataMata = {
  ida_volta: boolean; final_ida_volta: boolean; terceiro_lugar: boolean;
  chave: 'sorteio' | 'manual'; desempate: DesempateMataMata; sets_melhor_de: 3 | 5;
};
export type FormaDisputa =
  | { tipo: 'pontos_corridos'; ida_volta: boolean; final_entre: number | null; mata: OpcoesMataMata | null }
  | { tipo: 'mata_mata'; mata: OpcoesMataMata }
  | { tipo: 'grupos_mata_mata'; grupos: number; passam_por_grupo: number; melhores_extras: number;
      montagem: 'sorteio' | 'sorteio_cabecas' | 'manual'; ida_volta_grupos: boolean; mata: OpcoesMataMata };
export type Regulamento = {
  versao: 1; formato_antigo: boolean; tipo_placar: TipoPlacar; forma: FormaDisputa; pontuacao: Pontuacao;
  criterios: Criterio[]; wo_placar: { vencedor: number; perdedor: number }; regras_adicionais: string;
  suspensao: { amarelos: number; jogos_por_vermelho: number; zera_no_mata_mata: boolean };
  secoes: { artilharia: boolean; goleiro: boolean; destaques: boolean; goleiro_minimo_pct: number };
};
export type Vaga =
  | { tipo: 'grupo'; grupo: string; posicao: number }      // "1º do Grupo A"; grupo 'geral' nos pontos corridos com final
  | { tipo: 'extra'; posicao: number; indice: number }      // "2º melhor 3º colocado" → { posicao: 3, indice: 2 }
  | { tipo: 'vencedor'; jogo: number }                      // jogo = `ordem` do jogo de origem
  | { tipo: 'perdedor'; jogo: number }
  | { tipo: 'semente'; indice: number };                    // cabeça de chave nº N (mata-mata direto)
export type JogoGerado = {
  ordem: number; fase: string; rodada: number | null; grupo: string | null;
  casa: string | null; visitante: string | null;            // time_id, ou null enquanto a vaga não é decidida
  vaga_casa: Vaga | null; vaga_visitante: Vaga | null; volta_de: number | null; // ordem do jogo de ida
};
export type JogoCalc = {
  id: string; ordem: number | null; fase: string | null; grupo: string | null; rodada: number | null;
  casa: string | null; visitante: string | null; status: string;
  placar_casa: number | null; placar_visitante: number | null;
  penaltis_casa: number | null; penaltis_visitante: number | null; wo: 'casa' | 'visitante' | null;
  parciais: { casa: number; visitante: number }[] | null;
  vaga_casa: Vaga | null; vaga_visitante: Vaga | null; vaga_manual: boolean; jogo_volta_de: string | null;
};
export type Sorteios = Record<string, string[]>;            // chave 'geral' | 'grupo:A' | 'extra:3' → time_ids na ordem sorteada
```
- Produz (`regulamento.ts`):
  - `tipoPlacarDaModalidade(slug: string | null): TipoPlacar` — `volei` e `volei-de-praia` → `'sets'`; `basquete` → `'cestas'`; qualquer outra → `'gols'`.
  - `pontuacaoPadrao(t: TipoPlacar): Pontuacao` — gols 3/1/0; sets 3/2/1/0; cestas 2/1.
  - `criteriosDisponiveis(t: TipoPlacar): Criterio[]` — conforme a tabela da spec 4.2 (sem fair play nesta entrega).
  - `regulamentoPadrao(t: TipoPlacar, forma?: FormaDisputa): Regulamento` — critérios padrão de gols: `['vitorias','saldo','pro','confronto_direto','sorteio']`; de sets: `['vitorias','media_sets','saldo','confronto_direto','sorteio']`; de cestas: `['vitorias','saldo','pro','confronto_direto','sorteio']`. `wo_placar`: gols 3x0, sets 2x0 (3x0 se `sets_melhor_de` = 5), cestas 20x0. Suspensão: 3 amarelos, 1 jogo por vermelho, zera no mata-mata. Seções desligadas e `goleiro_minimo_pct` 50. Forma padrão: pontos corridos em turno único.
  - `lerRegulamento(bruto: unknown, ctx: { formatoAntigo: string | null; modalidade: string | null }): Regulamento` — `null` com `formatoAntigo` `'pontos_corridos'` (ou vazio) devolve o padrão; `null` com outro formato devolve o padrão com `formato_antigo: true`; um objeto é validado campo a campo, e o que faltar ou for inválido volta ao padrão.
  - `validarRegulamento(r: Regulamento): string | null` — devolve a mensagem de erro ou `null`. Erros: "Escolha pelo menos um critério de desempate."; "O sorteio precisa ser o último critério."; "Cada grupo precisa classificar pelo menos 1 time."; e critério fora de `criteriosDisponiveis`.

- [ ] **Passo 1: Escrever os testes que falham** em `regulamento.test.ts`:
  - `tipoPlacarDaModalidade('volei-de-praia')` → `'sets'`; `('basquete')` → `'cestas'`; `('handebol')` → `'gols'`.
  - `regulamentoPadrao('gols').criterios` igual a `['vitorias','saldo','pro','confronto_direto','sorteio']`, e `.pontuacao` igual a `{ tipo:'gols', vitoria:3, empate:1, derrota:0 }`.
  - `regulamentoPadrao('cestas').wo_placar` igual a `{ vencedor: 20, perdedor: 0 }`.
  - `lerRegulamento(null, { formatoAntigo: 'mata_mata', modalidade: 'futsal' }).formato_antigo` → `true`; com `'pontos_corridos'` → `false`.
  - `lerRegulamento({ versao: 1, criterios: ['inventado'] }, …).criterios` volta ao padrão.
  - `validarRegulamento` com `criterios: ['sorteio','saldo']` → `'O sorteio precisa ser o último critério.'`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/regulamento.test.ts`. Esperado: FALHA (módulo não existe).
- [ ] **Passo 3: Implementar** `tipos.ts` e as funções de `regulamento.ts` com as assinaturas acima.
- [ ] **Passo 4: Rodar e ver passar** (mesmo comando). Esperado: tudo PASSA, saída `0`.
- [ ] **Passo 5: Commit** — `git add lib/campeonatos && git commit -m "feat(campeonatos): tipos e regulamento padrão"`

### Tarefa 2: Rodízio (pontos corridos e grupos)

**Arquivos:**
- Criar: `lib/campeonatos/rodizio.ts`
- Teste: `lib/campeonatos/rodizio.test.ts`

**Interfaces:**
- Produz: `gerarRodizio(times: string[], idaVolta: boolean): { rodada: number; casa: string; visitante: string }[]`

- [ ] **Passo 1: Escrever os testes que falham**, rodando em laço de 3 a 20 times, com `idaVolta` ligado e desligado:
  - em cada turno, cada par aparece exatamente uma vez (`n*(n-1)/2` jogos por turno);
  - nenhum time joga duas vezes na mesma rodada;
  - número de rodadas por turno: `n-1` se `n` é par e `n` se é ímpar; com `n` ímpar, cada time folga exatamente uma vez por turno;
  - no returno, o jogo `A x B` da rodada `r` vira `B x A` na rodada `r + rodadasDoTurno`;
  - mando equilibrado: para cada time, `|jogos em casa − jogos fora| ≤ 1` no turno único.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/rodizio.test.ts`.
- [ ] **Passo 3: Implementar** pelo método do círculo: fixar o 1º time e girar os outros; com `n` ímpar, acrescentar um "folga" (`null`) e descartar os jogos contra ele. Alternar o mando trocando casa e visitante nas rodadas ímpares para o time fixo e invertendo os pares espelhados.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): rodízio round-robin`

### Tarefa 3: Chave do mata-mata e cruzamento olímpico

**Arquivos:**
- Criar: `lib/campeonatos/chave.ts`
- Teste: `lib/campeonatos/chave.test.ts`

**Interfaces:**
- Consome: `Vaga`, `JogoGerado`, `OpcoesMataMata` (Tarefa 1).
- Produz:
  - `type Entrada = { time: string } | { vaga: Vaga }`
  - `nomeDaFase(timesNaFase: number): string` — 2 → `'Final'`, 4 → `'Semifinal'`, 8 → `'Quartas de final'`, 16 → `'Oitavas de final'`, 32 → `'16 avos de final'`.
  - `cruzamentoOlimpico(grupos: string[], passam: number, extras: { posicao: number; quantos: number } | null): Entrada[]` — devolve as entradas já na ordem da chave: com 2 grupos e 2 por grupo, `[1ºA, 2ºB, 1ºB, 2ºA]`; com 4 grupos, `[1ºA,2ºB, 1ºC,2ºD, 1ºB,2ºA, 1ºD,2ºC]`. Os extras entram no fim, contra os 1º colocados mais bem colocados, e nunca contra o próprio grupo quando houver outra opção.
  - `gerarChave(entradas: Entrada[], o: OpcoesMataMata, ordemInicial: number): JogoGerado[]` — se o número de entradas não é potência de 2, cria a `'Fase preliminar'` só com `2 × (n − maiorPotênciaMenor)` entradas, as últimas da lista; as primeiras passam direto. Cada confronto vira 1 jogo, ou 2 com `ida_volta`; na final, vale `final_ida_volta`. O jogo de volta tem `volta_de` igual à ordem do de ida e o mando invertido. As fases seguintes usam `{ tipo:'vencedor', jogo }` apontando para a ordem do jogo de ida do confronto. Com `terceiro_lugar`, cria `'Disputa de 3º lugar'` com `{ tipo:'perdedor' }` das semifinais, antes da final. `rodada` é `null` e `grupo` é `null`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - `nomeDaFase(8)` → `'Quartas de final'`.
  - `cruzamentoOlimpico(['A','B'], 2, null)` → vagas na ordem `1ºA, 2ºB, 1ºB, 2ºA`.
  - Com 2, 4 e 8 grupos: o 1º e o 2º do mesmo grupo nunca se cruzam na 1ª fase.
  - `gerarChave` com 2 a 32 entradas, em jogo único: o total de jogos é `n − 1` (mais 1 com `terceiro_lugar`); toda ordem citada em uma vaga existe e é menor que a do jogo que a cita; nenhuma entrada aparece duas vezes.
  - 6 entradas: a `'Fase preliminar'` tem 2 jogos com as 4 últimas entradas, e as 2 primeiras aparecem direto na `'Semifinal'`.
  - `ida_volta: true` e `final_ida_volta: false` com 4 entradas: a semifinal tem 4 jogos (2 com `volta_de`), e a final tem 1.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/chave.test.ts`.
- [ ] **Passo 3: Implementar** `cruzamentoOlimpico` e `gerarChave`.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): chave do mata-mata e cruzamento olímpico`

### Tarefa 4: Geração completa por forma de disputa

**Arquivos:**
- Criar: `lib/campeonatos/gerar.ts`
- Teste: `lib/campeonatos/gerar.test.ts`

**Interfaces:**
- Consome: `gerarRodizio` (Tarefa 2), `gerarChave`, `cruzamentoOlimpico` (Tarefa 3).
- Produz:
  - `embaralhar<T>(lista: T[], aleatorio: () => number): T[]` (Fisher-Yates, sem mexer na lista original).
  - `sortearGrupos(times: string[], grupos: number, cabecas: string[], aleatorio: () => number): Record<string, string[]>` — grupos `'A'`, `'B'`…; uma cabeça de chave por grupo, se houver; os tamanhos diferem em no máximo 1.
  - `gerarJogos(forma: FormaDisputa, times: string[], o: { grupos?: Record<string, string[]>; sementes?: string[]; aleatorio: () => number }): { jogos: JogoGerado[] } | { erro: string }` — ordens a partir de 1, sem buracos. Pontos corridos: fase `'Pontos corridos'`; com `final_entre`, o mata-mata vem com `{ tipo:'grupo', grupo:'geral', posicao }`. Grupos: fase `'Fase de grupos'`, `grupo` = letra e rodadas por grupo; depois o mata-mata do `cruzamentoOlimpico`. Mata-mata direto: as entradas são `sementes`, na ordem dada, ou o sorteio dos times. Erros: menos de 2 times → `'São necessários pelo menos 2 times.'`; `grupos > times.length` → `'Há mais grupos do que times.'`; `passam_por_grupo` maior que o menor grupo → `'Um grupo tem menos times do que as vagas para passar.'`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - pontos corridos com 5 times em ida e volta → 20 jogos, todos com fase `'Pontos corridos'` e ordens de 1 a 20;
  - grupos (2 grupos, passam 2) com 8 times → 12 jogos de grupo + 3 de mata-mata, e o 1º jogo de mata-mata com `vaga_casa` `{ tipo:'grupo', grupo:'A', posicao:1 }`;
  - `sortearGrupos` com `aleatorio` fixo devolve sempre o mesmo resultado, e cada cabeça fica num grupo diferente;
  - **ponto de atenção 1:** `gerarJogos(…, ['t1'], …)` → `{ erro: 'São necessários pelo menos 2 times.' }`; 3 grupos com 2 times → `{ erro: 'Há mais grupos do que times.' }`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/gerar.test.ts`.
- [ ] **Passo 3: Implementar** `gerar.ts`.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): geração dos jogos por forma de disputa`

### Tarefa 5: Pontuação e classificação

**Arquivos:**
- Criar: `lib/campeonatos/classificacao.ts`
- Teste: `lib/campeonatos/classificacao.test.ts`

**Interfaces:**
- Consome: `JogoCalc`, `Regulamento`, `Sorteios` (Tarefa 1).
- Produz:
```ts
export type LinhaTabela = {
  time_id: string; posicao: number; pontos: number; jogos: number; vitorias: number; empates: number; derrotas: number;
  pro: number; contra: number; saldo: number; sets_pro: number; sets_contra: number; pontos_sets_pro: number; pontos_sets_contra: number;
  aproveitamento: number;            // pontos ÷ pontos possíveis (0..1)
  aguardando_sorteio: boolean;       // empate que só o sorteio decide e que ainda não foi registrado
};
export function pontosDoJogo(j: JogoCalc, r: Regulamento): { casa: number; visitante: number } | null; // null se não finalizado
export function classificar(times: string[], jogos: JogoCalc[], r: Regulamento, sorteio: string[] | undefined): LinhaTabela[];
```
- Regras (spec 4.2): só contam jogos com `status === 'finalizado'`. Na pontuação por sets, a vitória por 2x0 (ou 3x0 e 3x1 na melhor de 5) é `vitoria_direta`, e por 2x1 ou 3x2 é `vitoria_decisivo`. W.O.: quem faltou fica com 0 ponto e o placar é `wo_placar`, mesmo que a derrota normal valha 1. Os pontos vêm primeiro; os critérios desempatam na ordem do regulamento. Confronto direto com 3 ou mais empatados monta uma mini-tabela só com os jogos entre eles (pontos, depois a mesma lista); quem continua empatado recomeça a lista desde o início, só entre eles. `'sorteio'` usa a ordem de `sorteio`; sem registro, todos os que continuam empatados ficam com `aguardando_sorteio: true` e a posição de quem está empatado é a menor do grupo. `media_sets` = sets pró ÷ sets contra (sem sets contra, conta como infinito); `media_pontos_sets` só usa `parciais`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - cada critério do catálogo decide sozinho um empate de 2 times (um teste por critério);
  - confronto direto entre 2 times;
  - confronto direto entre 3 times em que a mini-tabela separa só o 1º, e os outros 2 são decididos pelo confronto direto entre eles;
  - sorteio pendente: os 2 empatados ficam `aguardando_sorteio: true`, e com `sorteio = ['t2','t1']` o `t2` fica à frente;
  - sets: 2x1 dá 2 e 1 ponto; 2x0 dá 3 e 0;
  - cestas: a derrota vale 1, mas a derrota por W.O. vale 0, e o placar contado é 20x0;
  - jogo `agendado` não conta.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/classificacao.test.ts`.
- [ ] **Passo 3: Implementar** `classificacao.ts`. A ordenação é uma função recursiva `desempatar(grupo, criterios)` que reaplica a lista inteira aos subgrupos ainda empatados.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): classificação com critérios do regulamento`

### Tarefa 6: Resolução de confrontos e vagas

**Arquivos:**
- Criar: `lib/campeonatos/vagas.ts`
- Teste: `lib/campeonatos/vagas.test.ts`

**Interfaces:**
- Consome: `classificar` (Tarefa 5), `JogoCalc`, `Vaga`, `Regulamento`, `Sorteios`.
- Produz:
```ts
export function decidirConfronto(jogos: JogoCalc[], r: Regulamento, campanha?: (time: string) => LinhaTabela): { vencedor: string; perdedor: string } | null;
export type ResultadoVagas = {
  atualizar: { id: string; casa: string | null; visitante: string | null }[];
  avisos: string[];
  provaveis: Record<string, { casa?: string; visitante?: string }>; // jogo id → time provável (grupo ainda incompleto)
};
export function resolverVagas(jogos: JogoCalc[], r: Regulamento, timesPorGrupo: Record<string, string[]>, sorteios: Sorteios): ResultadoVagas;
export function rotuloDaVaga(v: Vaga, jogosPorOrdem: Map<number, { fase: string }>): string; // "1º do Grupo A", "Vencedor do Jogo 3", "Perdedor da Semifinal 1", "2º melhor 3º colocado"
```
- Regras (spec 4.3):
  - **Vaga de grupo:** preenchida só quando todos os jogos do grupo estão finalizados; antes disso, vai para `provaveis`.
  - **Extras:** comparados por `aproveitamento` e depois pelos critérios, com o sorteio em `sorteios['extra:<posicao>']`.
  - **Confronto:** em jogo único, o placar decide e, se empatar, os pênaltis; em ida e volta, a soma, depois o gol fora (se ligado) e depois os pênaltis do jogo de volta. Com `final: 'melhor_campanha'`, decide a `campanha` (aproveitamento e depois critérios). Em sets, conta quem venceu mais jogos e, se cada um vencer um, vale o set de ouro (gravado em `penaltis_*`). Em cestas, vale a soma. W.O. decide a favor de quem compareceu.
  - Jogo com `vaga_manual` nunca é mexido.
  - Se o time calculado for diferente do gravado e o jogo-alvo já estiver `finalizado`, não muda nada e acrescenta o aviso `'Este ajuste mudaria o classificado de um jogo já disputado (Jogo N).'`.
  - Se a origem deixa de estar decidida, a vaga volta a `null` (desde que o alvo não tenha resultado).

- [ ] **Passo 1: Escrever os testes que falham:**
  - grupo incompleto: a vaga não é preenchida e o 1º atual aparece em `provaveis`;
  - grupo completo: a vaga é preenchida;
  - ida e volta 1x0 e 0x1 com gol fora desligado → decide nos pênaltis do jogo de volta; 2x1 e 1x0 com gol fora ligado → decide pelo gol fora;
  - correção de resultado antes do jogo seguinte → o seguinte muda; depois de o seguinte ter resultado → não muda e gera o aviso;
  - vaga manual preservada;
  - **ponto de atenção 2:** semifinal finalizada preenche a final; ao voltar a semifinal para `agendado`, `atualizar` traz a final com aquela vaga `null`;
  - `rotuloDaVaga({ tipo:'extra', posicao:3, indice:2 }, …)` → `'2º melhor 3º colocado'`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/vagas.test.ts`.
- [ ] **Passo 3: Implementar** `vagas.ts`, percorrendo os jogos por `ordem` crescente, para que uma vaga resolvida alimente a seguinte na mesma passada.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): avanço automático das vagas`

### Tarefa 7: Trava por fase e geração de novo

**Arquivos:**
- Criar: `lib/campeonatos/trava.ts`
- Teste: `lib/campeonatos/trava.test.ts`

**Interfaces:**
- Consome: `JogoCalc`, `JogoGerado`, `FormaDisputa`.
- Produz:
  - `fasesComResultado(jogos: JogoCalc[]): Set<string>` — fases com pelo menos um jogo `finalizado`.
  - `planoDeRegeracao(existentes: JogoCalc[], novos: JogoGerado[], o: { formaMudou: boolean; destravadas: string[] }): { apagar: string[]; inserir: JogoGerado[]; avisos: string[] } | { erro: string }`
- Regras (spec 4.3):
  - sem nenhum resultado: apaga todos e insere todos;
  - com resultado e `formaMudou` → `{ erro: 'A forma de disputa não pode mudar depois do primeiro resultado. Peça à ARENA VALE para destravar.' }`, a não ser que todas as fases com resultado estejam em `destravadas`;
  - os jogos com resultado nunca entram em `apagar`;
  - nas fases sem resultado, ou destravadas, os jogos sem resultado são apagados e recriados pelos `novos` dessa fase;
  - um jogo novo cuja `ordem` coincide com a de um jogo com resultado não é inserido, e entra em `avisos` (`'O Jogo N já foi disputado e foi mantido.'`);
  - se mudar a estrutura (casa, visitante e vagas por `ordem`) de uma fase com resultado não destravada → `{ erro: 'A fase X já começou. Peça à ARENA VALE para destravar.' }`.

- [ ] **Passo 1: Escrever os testes que falham:** um para cada regra acima, incluindo a troca da final de jogo único para ida e volta com a fase de grupos encerrada (insere só a final nova e apaga só a final antiga sem resultado).
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/trava.test.ts`.
- [ ] **Passo 3: Implementar** `trava.ts`.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): trava por fase`

### Tarefa 8: Regulamento em texto, endereço (slug) e escudo desenhado

**Arquivos:**
- Criar: `lib/campeonatos/texto.ts`, `lib/campeonatos/escudo-svg.ts`, `lib/ui/recorte.ts`
- Teste: `lib/campeonatos/texto.test.ts`, `lib/campeonatos/escudo-svg.test.ts`, `lib/ui/recorte.test.ts`

**Interfaces:**
- Produz:
  - `slugCampeonato(nome: string, ano: number): string` — usa `slugDoNome` de `lib/midia/modalidades.ts`; `('Copa X', 2026)` → `'copa-x-2026'`; não repete o ano se o nome já terminar nele.
  - `regulamentoEmTexto(r: Regulamento, nomeModalidade: string): { titulo: string; paragrafos: string[] }[]` — seções na ordem "Forma de disputa", "Pontuação", "Critérios de desempate", "Mata-mata" (só se houver), "W.O." e "Regras adicionais" (só se houver texto). A frase dos critérios é numerada: `'1º mais vitórias; 2º melhor saldo de gols; …'`.
  - `type OpcoesEscudo = { formato: 'classico' | 'redondo' | 'losango' | 'moderno'; cor1: string; cor2: string; texto: string; detalhe: 'nenhum' | 'faixa' | 'listras' | 'estrela' }`
  - `desenharEscudo(o: OpcoesEscudo): string` — SVG 512×512 com `viewBox="0 0 512 512"`. O texto fica em maiúsculas, com até 4 caracteres, e o caractere especial é escapado. A cor do texto é a que tem mais contraste com `cor1` (branco ou `#0b0b0d`).
  - `escudoPadrao(sigla: string, cor: string | null): string` — `desenharEscudo({ formato:'classico', cor1: cor ?? '#c9a338', cor2:'#ffffff', texto: sigla, detalhe:'nenhum' })`.
  - `areaDeRecorte(largura: number, altura: number, zoom: number, x: number, y: number): { sx: number; sy: number; lado: number }` — `zoom` ≥ 1 (1 = maior quadrado que cabe), `x` e `y` de −1 a 1 (deslocamento do centro). O resultado nunca sai da imagem.

- [ ] **Passo 1: Escrever os testes que falham:**
  - `slugCampeonato('Copa São José', 2026)` → `'copa-sao-jose-2026'`; `('Taça 2026', 2026)` → `'taca-2026'`;
  - `regulamentoEmTexto(regulamentoPadrao('gols'), 'Futsal')` tem a seção "Critérios de desempate" com o texto `'1º mais vitórias; 2º melhor saldo de gols; 3º mais gols pró; 4º confronto direto; 5º sorteio.'`;
  - `desenharEscudo({ …, texto: 'a&b<' })` contém `A&amp;B&lt;` e começa com `<svg`;
  - `areaDeRecorte(1000, 500, 1, 0, 0)` → `{ sx: 250, sy: 0, lado: 500 }`; com `x = 1` → `sx: 500`; com `zoom = 2` → `lado: 250`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/texto.test.ts lib/campeonatos/escudo-svg.test.ts lib/ui/recorte.test.ts`.
- [ ] **Passo 3: Implementar** os três arquivos.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): regulamento em texto, slug e escudo desenhado`

### Tarefa 9: Tratamento do escudo no servidor

**Arquivos:**
- Criar: `lib/imagem/escudo.ts`
- Teste: `lib/imagem/escudo.test.ts`

**Interfaces:**
- Produz: `prepararEscudo(bytes: Uint8Array): Promise<Uint8Array>` — gira pelo EXIF; `resize(512, 512, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })`; PNG.

- [ ] **Passo 1: Escrever os testes que falham:** uma imagem gerada com sharp, de 800×400 e fundo transparente, sai com 512×512, formato `png` e `hasAlpha: true`, e o canto (0,0) fica com alpha 0.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/imagem/escudo.test.ts`.
- [ ] **Passo 3: Implementar** no estilo de `lib/imagem/galeria.ts`.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(imagem): escudo padronizado 512 px`

### Tarefa 10: Migração 0023 e testes de permissão

**Arquivos:**
- Criar: `supabase/migrations/0023_campeonatos.sql`, `tests/db/campeonatos.test.ts`
- Modificar: `tests/db/politicas.test.ts` (o teste `moderador muda placar + data…` passa a exigir sucesso, porque agora o moderador do campeonato pode mudar a data); `tests/db/cenario.ts` (os campeonatos do cenário são criados com `visivel: true`)

**Conteúdo da migração** (começar com `set lock_timeout = '5s';`):
1. **`campeonatos`:** `slug text`, `regulamento jsonb`, `visivel boolean not null default false`, `ordem_sorteio jsonb not null default '{}'` e `fases_destravadas text[] not null default '{}'`. Os campeonatos que já existem ficam com `visivel = true` e recebem o `slug` (só na primeira aplicação: `where slug is null`). O slug segue a mesma regra do `slugCampeonato`: minúsculas, sem acento por `translate()`, hífens, `-<ano>` no fim e `-2`, `-3`… se repetir. Depois, índice único `campeonatos_slug_key`. O `regulamento` fica `null` nos antigos (o código lê pelo `formato`, Tarefa 1).
2. **`jogos`:** `time_casa_id`, `time_visitante_id` e `data` passam a aceitar vazio (`drop not null`). Colunas novas: `grupo text`, `ordem int`, `vaga_casa jsonb`, `vaga_visitante jsonb`, `vaga_manual boolean not null default false`, `jogo_volta_de uuid references public.jogos(id) on delete set null`, `penaltis_casa int`, `penaltis_visitante int`, `wo text check (wo in ('casa','visitante'))`, `parciais jsonb`, `corrigido_por uuid references public.profiles(id)` e `corrigido_em timestamptz`. Índice único `(campeonato_id, ordem) where ordem is not null`.
3. **`times`:** `cadastrado_por uuid references public.profiles(id) default auth.uid()`.
4. **`inscricao_atletas`:** `id uuid pk`, `inscricao_id uuid not null references inscricoes on delete cascade`, `campeonato_id uuid not null references campeonatos on delete cascade`, `jogador_id uuid not null references jogadores on delete cascade`, `numero_camisa int`, `posicao text`, `created_at timestamptz default now()` e `unique (campeonato_id, jogador_id)`. Um trigger `before insert or update` preenche `campeonato_id` a partir da inscrição. RLS: leitura pública. A inclusão é só pelas funções abaixo. Apagar e editar o número e a posição: staff, moderador do campeonato ou capitão do time da inscrição.
5. **Funções `security definer`** (com `revoke all … from public, anon` e `grant execute … to authenticated`):
   - `campeonato_publico(c uuid) returns boolean`;
   - `pode_editar_campeonato(c uuid) returns boolean` = `is_staff() or is_moderador_do_campeonato(c)`;
   - `criar_campeonato(p_nome text, p_ano int, p_modalidade text, p_categoria text) returns uuid` — só moderador ou coordenação. Grava com `visivel = false`, `created_by = auth.uid()` e o slug calculado. Se quem cria é moderador, insere em `campeonato_moderadores`;
   - `inscrever_atleta(p_inscricao uuid, p_cpf text, p_nome text, p_posicao text, p_numero int, p_foto_url text) returns uuid` — permissão: `is_staff()`, ou moderador do campeonato da inscrição, ou `is_capitao_do_time(time da inscrição)`. Normaliza o CPF para só dígitos e valida 11 dígitos. Procura em `jogadores` por `cpf`: se não achar, cria com `time_id` igual ao time da inscrição; se achar, mantém os dados do atleta. Antes de inserir, se já houver uma linha naquele campeonato, dá erro `'Este atleta já está inscrito neste campeonato pelo time ' || nome_do_time || '.'` (a regra única também protege inserções ao mesmo tempo: capturar `unique_violation` e devolver a mesma mensagem);
   - `copiar_elenco(p_destino uuid, p_origem uuid) returns int` — mesma permissão no destino e mesmo time nas duas inscrições. Copia ignorando quem já está inscrito em outro time do campeonato e devolve quantos copiou;
   - `pode_trocar_escudo(t uuid) returns boolean` = `is_capitao_do_time(t)`.
6. **Políticas** (sempre `drop policy if exists` antes):
   - `campeonatos` select: `visivel or pode_editar_campeonato(id) or exists (time_capitaes do usuário nesse campeonato)`;
   - update do moderador: `using/with check (is_moderador_do_campeonato(id))`;
   - insert e delete continuam só staff (o moderador cria pela função);
   - `jogos` select: `campeonato_publico(campeonato_id) or pode_editar_campeonato(campeonato_id) or delegado_id = auth.uid()`;
   - insert e delete de `jogos`: staff ou moderador do campeonato;
   - `inscricoes` insert, update e delete: staff ou moderador do campeonato;
   - `times` insert: staff ou `cargo_atual() = 'moderador'`; `times` update: staff, ou capitão do time, ou `cadastrado_por = auth.uid()`.
7. **Triggers:**
   - `proteger_campeonato` (before update): quem não é staff nem service role não muda `visivel`, `slug`, `fases_destravadas` nem `created_by`. Mensagem: `'Só a ARENA VALE muda isso.'`;
   - `moderador_so_resultado` (substitui a da 0021): o moderador do campeonato do jogo muda tudo, menos `delegado_id` e `campeonato_id`. O delegado continua só com o placar e o status, com a mesma mensagem de hoje (`'Apenas a coordenação altera dados estruturais do jogo.'`);
   - `marcar_correcao` (before update em `jogos`): se `old.status = 'finalizado'` e mudou `placar_casa`, `placar_visitante`, `penaltis_*`, `wo` ou `parciais`, grava `corrigido_por = auth.uid()` e `corrigido_em = now()`. O delegado não corrige, porque já perdeu o acesso ao finalizar;
   - `proteger_escudo_time` (before insert or update em `times`): no update, quem não é service role nem capitão do time não muda `escudo_url` nem `escudo_cor` (`'Só o capitão do time troca o escudo.'`); no insert, quem não é service role nem capitão grava `escudo_url = null`.
8. **`v_classificacao`:** `alter view public.v_classificacao set (security_invoker = true)`, para não mostrar os jogos de campeonato escondido.
9. **Bucket `campeonatos`:** público, até 5 MB, `image/png`, `image/jpeg` e `image/webp`, e sem política de escrita (só a service role grava).
10. **Elenco dos que já existem:** inserir em `inscricao_atletas` os jogadores de `jogadores.time_id` de cada inscrição, em ordem de `inscricoes.submitted_at`, com `on conflict (campeonato_id, jogador_id) do nothing`. No fim, um `select` lista os casos em que o mesmo atleta estava em dois times do mesmo campeonato (campeonato, atleta, time mantido e time que ficou sem ele), para a coordenação conferir.
11. Terminar com `notify pgrst, 'reload schema';`.

**Testes (`tests/db/campeonatos.test.ts`, usando `montarCenario` e `criarUsuario`):**
- moderador cria campeonato por `criar_campeonato` → nasce `visivel = false` e ligado a ele;
- moderador A não lê o campeonato escondido de B nem o edita (update sem efeito);
- moderador não muda `visivel` (erro `Só a ARENA VALE muda isso.`) nem o `delegado_id` de um jogo;
- moderador muda `data` e `local` de um jogo do seu campeonato;
- coordenação muda o placar de um jogo `finalizado` → `corrigido_por` fica com o id dela e `corrigido_em` preenchido, e o status continua `finalizado`; o delegado do jogo, já rebaixado, não consegue mudar o placar;
- visitante não lê o campeonato escondido nem os jogos dele (**ponto de atenção 4**);
- `inscrever_atleta` com o CPF `'529.982.247-25'` no time A e depois `'52998224725'` no time B do mesmo campeonato → o segundo dá erro com `'pelo time '` e o nome do time A, e o atleta continua no A (**ponto de atenção 5**);
- o mesmo CPF entra normalmente em outro campeonato;
- o capitão do time A tira o atleta do elenco (delete em `inscricao_atletas`), e aí o time B consegue inscrevê-lo; o capitão de B não consegue apagar a linha do A;
- capitão troca `escudo_cor` do próprio time; capitão de outro time, moderador e coordenação recebem `Só o capitão do time troca o escudo.`;
- reaplicar a 0023 duas vezes seguidas não dá erro (lendo o arquivo com `pg`, como no teste da 0010).

- [ ] **Passo 1: Escrever os testes** em `tests/db/campeonatos.test.ts` e ajustar `politicas.test.ts` e `cenario.ts`.
- [ ] **Passo 2: Rodar e ver falhar:** `npm run test:db`. Esperado: FALHA (colunas e funções não existem).
- [ ] **Passo 3: Escrever** `0023_campeonatos.sql`.
- [ ] **Passo 4: Rodar e ver passar:** `npm run test:db`. Esperado: todos PASSAM, incluindo `delegado.test.ts` e o reaplicar da 0010.
- [ ] **Passo 5: Commit** — `feat(db): 0023 campeonatos, elenco por campeonato e escudo do time`

### Tarefa 11: Serviço, portas e rotas de gerar e recalcular

**Arquivos:**
- Criar: `lib/campeonatos/portas.ts`, `lib/campeonatos/servico.ts`, `app/api/campeonatos/[id]/gerar/route.ts`, `app/api/campeonatos/[id]/recalcular/route.ts`
- Teste: `lib/campeonatos/servico.test.ts`, `app/api/campeonatos/[id]/recalcular/route.test.ts`

**Interfaces:**
- Consome: Tarefas 1, 4, 6 e 7.
- Produz:
```ts
// portas.ts
export type DadosCampeonato = {
  id: string; modalidade: string | null; formato: string | null; regulamento: Regulamento;
  times: string[];                              // inscrições aprovadas
  grupos: Record<string, string[]>;             // de jogos com grupo; vazio antes de gerar
  jogos: JogoCalc[]; sorteios: Sorteios; destravadas: string[];
};
export type PortasCampeonato = {
  carregar(id: string): Promise<DadosCampeonato | null>;
  aplicarVagas(atualizar: ResultadoVagas['atualizar']): Promise<void>;
  substituirJogos(campeonatoId: string, apagar: string[], inserir: JogoGerado[]): Promise<void>; // liga jogo_volta_de pela ordem
  gravarRegulamento(id: string, r: Regulamento): Promise<void>;
};
export function portasCampeonato(admin: SupabaseClient): PortasCampeonato;
// servico.ts
export async function recalcular(id: string, p: PortasCampeonato): Promise<{ avisos: string[] }>;
export async function gerar(id: string, p: PortasCampeonato, o: { forma: FormaDisputa; grupos?: Record<string, string[]>; sementes?: string[]; formaMudou: boolean; aleatorio: () => number; simular: boolean }): Promise<{ jogos: JogoGerado[]; avisos: string[] } | { erro: string }>;
```
- `gerar` com `simular: true` não grava nada: serve para a tela "revisar e gerar" mostrar a lista antes de confirmar. Depois de gravar, chama `recalcular`.
- **Rota `POST /api/campeonatos/[id]/gerar`** — corpo `{ forma, grupos?, sementes?, simular }`. Exige usuário logado com `pode_editar_campeonato(id)` (chamado pelo cliente do usuário, por `rpc`). Valida o regulamento com `validarRegulamento`. Responde `{ ok: true, jogos, avisos }` ou `{ ok: false, erro }`, com status 400, 401 ou 403.
- **Rota `POST /api/campeonatos/[id]/recalcular`** — exige só usuário logado (**ponto de atenção 3**). Não recebe corpo. Responde `{ ok: true, avisos }`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - `servico.test.ts` com portas falsas: `recalcular` aplica as vagas que `resolverVagas` devolve; `gerar` com `simular: true` não chama `substituirJogos`; `gerar` devolve o `erro` do `planoDeRegeracao`;
  - `route.test.ts` (no estilo de `app/api/galeria/foto/route.test.ts`, com `vi.mock('@/lib/supabase/server')`): sem usuário → 401; usuário com cargo `autenticado` → 200, chamando `recalcular`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/campeonatos/servico.test.ts "app/api/campeonatos"`.
- [ ] **Passo 3: Implementar** as portas, o serviço e as duas rotas (`export const dynamic = 'force-dynamic'`; `params: Promise<{ id: string }>`).
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): gerar jogos e recalcular vagas no servidor`

### Tarefa 12: Rotas de envio de escudo

**Arquivos:**
- Criar: `app/api/campeonatos/[id]/escudo/route.ts`, `app/api/times/[id]/escudo/route.ts`
- Teste: `app/api/times/[id]/escudo/route.test.ts`

**Interfaces:**
- Consome: `prepararEscudo` (Tarefa 9); RPCs `pode_editar_campeonato` e `pode_trocar_escudo` (Tarefa 10).
- Produz:
  - `POST /api/campeonatos/[id]/escudo` (multipart `arquivo`) → grava `campeonatos/campeonatos/<id>-<Date.now()>.png` e atualiza `campeonatos.logo_url`. Responde `{ ok, url }`.
  - `POST /api/times/[id]/escudo` (multipart `arquivo` e `cor` opcional no formato `#rrggbb`) → grava `campeonatos/times/<id>-<Date.now()>.png` e atualiza `times.escudo_url` (e `escudo_cor`, se veio). Responde `{ ok, url }`.
  - As duas usam o cliente admin para gravar e conferem a permissão antes, com o cliente do usuário. Limite de 5 MB e só `image/*`; mensagens `'A imagem passa de 5 MB.'` e `'O arquivo precisa ser uma imagem.'`. O nome com `Date.now()` evita o cache do navegador mostrar o escudo antigo.

- [ ] **Passo 1: Escrever os testes que falham** para a rota do time: sem usuário → 401; `pode_trocar_escudo` falso → 403 `'Só o capitão do time troca o escudo.'`; 6 MB → 400; caso válido → chama `prepararEscudo` e devolve a URL.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 "app/api/times"`.
- [ ] **Passo 3: Implementar** as duas rotas, no padrão de `app/api/galeria/foto/route.ts`.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): envio do escudo do campeonato e do time`

### Tarefa 13: Jogos "a definir" em todas as telas que já existem

**Arquivos:**
- Modificar: `lib/midia/agenda.ts` (`buscarItens`, `buscarItemAgenda`, `deJogos`), `lib/supabase/queries.ts` (`getJogos`), `app/(public)/sumula/page.tsx`, `app/(public)/sumula/[id]/page.tsx`, `app/(coord)/delegado/page.tsx`, `components/delegado/MesaDoJogo.tsx`, `components/coord-jogos.tsx`, `components/coord-sumulas.tsx`
- Teste: `lib/midia/agenda.test.ts`, `components/delegado/` (novo `MesaDoJogo.test.tsx`)

**Regras:**
- Agenda, Hoje na Arena, home e Jogos recentes ignoram os jogos com `data` nula ou sem um dos dois times: filtro na consulta (`.not('data','is',null).not('time_casa_id','is',null).not('time_visitante_id','is',null)`) e, por segurança, uma função pura nova `jogoCompleto(row: LinhaJogo): boolean` em `agenda.ts`, aplicada antes do `.map(deJogos)` em `buscarItens` e em `buscarItemAgenda` (que devolve `null`).
- As listas da equipe (coordenação, súmulas e delegado) mostram `'A definir'` no lugar do time ou da data vazios, nunca `null` ou "Invalid Date".
- Ao finalizar um jogo, a Mesa do Jogo chama `fetch('/api/campeonatos/<campeonato_id>/recalcular', { method: 'POST' })`; a falha é ignorada sem travar a tela. O select da página do delegado passa a trazer `campeonato_id`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - `jogoCompleto` com `casa: null` → `false`; com `data: null` → `false`; com tudo preenchido → `true`;
  - `MesaDoJogo`: depois de clicar em finalizar, o `fetch` é chamado com `/api/campeonatos/c1/recalcular`;
  - `MesaDoJogo` com `fora: null` mostra `'A definir'`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 lib/midia/agenda.test.ts components/delegado`.
- [ ] **Passo 3: Implementar** os filtros e os textos `'A definir'` em todos os arquivos listados.
- [ ] **Passo 4: Rodar tudo:** `npx vitest run --maxWorkers=2` e `npm run typecheck`. Esperado: saída `0` nos dois.
- [ ] **Passo 5: Commit** — `fix: jogos a definir não aparecem como null nas telas`

### Tarefa 14: Escudos na tela, busca pública e lista /campeonatos

**Arquivos:**
- Criar: `components/campeonatos/EscudoTime.tsx`, `components/campeonatos/EscudoCampeonato.tsx`, `components/campeonatos/CartaoCampeonato.tsx`, `lib/campeonatos/busca.ts`, `app/campeonatos/page.tsx`
- Teste: `components/campeonatos/campeonatos.test.tsx`

**Interfaces:**
- Produz:
  - `<EscudoTime time={{ nome, sigla, escudo_url, escudo_cor }} tamanho={24|40|96} />` — com `escudo_url`, mostra `<img alt={nome}>`; sem ele, mostra o `escudoPadrao` em data-URL (`<img alt={nome}>`).
  - `<EscudoCampeonato campeonato={{ nome, logo_url }} tamanho />` — sem foto, mostra o escudo padrão com as iniciais do nome (até 3 letras) e as cores da ARENA VALE (`#e30613` e branco).
  - `<CartaoCampeonato c={ResumoCampeonato} />` → link para `/campeonatos/<slug>`, com o nome, a modalidade e o ano, e a fase atual.
  - `type ResumoCampeonato = { id; slug; nome; ano; categoria; modalidade; logo_url; status; fase_atual: string | null; encerrado: boolean }`
  - `buscarCampeonatosPublicos(): Promise<ResumoCampeonato[]>` — com o cliente público (o RLS já esconde os ocultos). `fase_atual` é a fase do primeiro jogo não finalizado, por `ordem`, ou `'Rodada N'` nos pontos corridos. `encerrado` é `status in ('finalizado','cancelado')`.
  - `app/campeonatos/page.tsx` — `revalidate = 60`. Abas por `?situacao=andamento|encerrados` (padrão `andamento`) e um `<select>` de modalidade (`?modalidade=`). Grade de cartões e, no fim, `<SeuCampeonato whatsapp={…} />`, com o número lido como na home.

- [ ] **Passo 1: Escrever os testes que falham:**
  - `EscudoTime` sem `escudo_url` tem `img` com `src` começando por `data:image/svg+xml`;
  - `CartaoCampeonato` aponta para `/campeonatos/copa-x-2026`;
  - a página com dois campeonatos (um encerrado) mostra só o em andamento por padrão.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos`.
- [ ] **Passo 3: Implementar** os componentes, a busca e a página (carregar o `DESIGN.md`; cartões com o escudo grande no topo).
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): lista pública de campeonatos`

### Tarefa 15: Página do campeonato

**Arquivos:**
- Criar: `app/campeonatos/[slug]/page.tsx`, `components/campeonatos/TabelaGrupo.tsx`, `components/campeonatos/Chave.tsx`, `components/campeonatos/ListaJogos.tsx`, `components/campeonatos/TextoRegulamento.tsx`
- Modificar: `lib/campeonatos/busca.ts` (acrescentar `buscarCampeonatoPorSlug`)
- Teste: `components/campeonatos/pagina.test.tsx`

**Interfaces:**
- Consome: `classificar`, `resolverVagas` (para os `provaveis`), `rotuloDaVaga`, `regulamentoEmTexto` e `lerRegulamento`.
- Produz:
  - `buscarCampeonatoPorSlug(slug: string, sb?: SupabaseClient): Promise<PaginaCampeonato | null>` — `PaginaCampeonato = { campeonato: ResumoCampeonato & { regulamento: Regulamento; visivel: boolean }; times: Record<string, { nome; sigla; escudo_url; escudo_cor }>; jogos: (JogoCalc & { data: string | null; local: string | null })[]; grupos: Record<string, string[]>; sorteios: Sorteios }`
  - a página usa primeiro o cliente público; se não achar, tenta com o cliente da sessão (`createClient()`), para o moderador e a coordenação verem a pré-visualização com a faixa `'Pré-visualização — ainda não está no site'`. Se nenhum achar, `notFound()`.
  - abas por `?aba=classificacao|chave|jogos|regulamento`. A aba Classificação some no mata-mata direto; a aba Chave some nos pontos corridos sem final. Com `formato_antigo`, só existem as abas Jogos (lista por data, com a `fase` em texto) e Regulamento.
  - `<TabelaGrupo>`: colunas P, J, V, E, D, pró, contra e saldo (sem E nos sets e nas cestas; nos sets, sets pró/contra e média). Faixa colorida nas posições que classificam, e a observação `'Empate — aguardando sorteio'`.
  - `<Chave>`: no computador, colunas por fase; no celular (menos de 768 px), uma fase por vez com setas `‹ ›` e `aria-label` `'Fase anterior'` / `'Próxima fase'`. Mostra as vagas abertas pelo `rotuloDaVaga` e o "provável" em cinza.
  - `<ListaJogos>`: agrupa por rodada ou por fase, mostra a data e hora ou `'A definir'` e o placar com os pênaltis entre parênteses. Cada jogo leva a `/sumula/<id>`.
  - `generateMetadata`: `'<nome> | ARENA VALE'`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - mata-mata direto não mostra a aba "Classificação";
  - `formato_antigo` mostra só "Jogos" e "Regulamento";
  - a chave mostra `'1º do Grupo A'` numa vaga ainda aberta;
  - **ponto de atenção 4:** a página com `buscarCampeonatoPorSlug` devolvendo `null` nos dois clientes chama `notFound`;
  - a busca pelo cliente da sessão mostra a faixa de pré-visualização.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/pagina.test.tsx`.
- [ ] **Passo 3: Implementar** a busca, os componentes e a página.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(campeonatos): página do campeonato com classificação, chave, jogos e regulamento`

### Tarefa 16: Menu, modalidades e faixa "Seu campeonato"

**Arquivos:**
- Modificar: `lib/midia/menu.ts`, `components/SiteHeader.test.tsx`, `app/modalidades/[slug]/page.tsx`, `lib/midia/campeonatos.ts` (`buscarCampeonatosDaModalidade` passa a devolver `ResumoCampeonato[]`), `components/home/SeuCampeonato.tsx`, `app/sitemap.ts` (incluir `/campeonatos` e cada `/campeonatos/<slug>` visível)
- Teste: `components/SiteHeader.test.tsx`, `components/home/home.test.tsx`, `components/midia/paginas.test.tsx`

**Regras:**
- `MENU_PRINCIPAL` ganha `{ rotulo: 'Campeonatos', href: '/campeonatos' }` logo depois de `'Início'`.
- Na página da modalidade, as tabelas embutidas dão lugar a uma grade de `<CartaoCampeonato>`.
- O "Ver como fica" da faixa aponta para `/campeonatos`.

- [ ] **Passo 1: Atualizar os testes:** a lista esperada no `SiteHeader.test.tsx` passa a ser `['Início', 'Campeonatos', 'Ao Vivo', …]`; o link "Ver como fica" tem `href` `/campeonatos`; a página da modalidade mostra o cartão com o link `/campeonatos/<slug>`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/SiteHeader.test.tsx components/home components/midia/paginas.test.tsx`.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Conferir a largura do menu:** subir o site (`npm run dev`) e abrir a home com 1024 px de largura (Playwright `browser_resize` 1024×800 e `browser_take_screenshot`). Se o menu quebrar em duas linhas ou cortar algum item, **parar e perguntar ao dono qual item vai para o ☰** (como foi feito com a Galeria), antes de fazer o commit.
- [ ] **Passo 6: Commit** — `feat(menu): aba Campeonatos no cabeçalho; modalidades levam aos campeonatos`

### Tarefa 17: Editores de forma de disputa e de regulamento

**Arquivos:**
- Criar: `components/campeonatos/painel/EditorFormaDisputa.tsx`, `components/campeonatos/painel/EditorRegulamento.tsx`
- Teste: `components/campeonatos/painel/editores.test.tsx`

**Interfaces:**
- Produz:
  - `<EditorFormaDisputa valor={FormaDisputa} tipoPlacar={TipoPlacar} travada={boolean} temCampanha={boolean} onChange={(f: FormaDisputa) => void} />`:
    - três botões de escolha: "Pontos corridos", "Mata-mata" e "Grupos + mata-mata";
    - as opções de cada forma conforme a spec 4.1;
    - "Melhor campanha" só aparece quando `temCampanha` (não aparece no mata-mata direto);
    - "Gol fora de casa" e "Prorrogação" só aparecem em `gols`; "Melhor de 3 ou 5 sets" só em `sets`;
    - com `travada`, o tipo fica desabilitado e aparece `'Já há resultados: só as fases que ainda não começaram podem mudar.'`.
  - `<EditorRegulamento valor={Regulamento} onChange={(r: Regulamento) => void} />`:
    - mostra o tipo de placar, a pontuação editável, os critérios em lista com setas (`aria-label` `'Subir <critério>'` e `'Descer <critério>'`) e caixa para ligar e desligar, o placar do W.O. e as "Regras adicionais" (até 3000 caracteres);
    - mostra embaixo o erro do `validarRegulamento`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - clicar em `'Subir mais gols pró'` troca a ordem com `'melhor saldo de gols'` no `onChange`;
  - `tipoPlacar: 'sets'` mostra "Melhor de" e esconde "Gol fora de casa";
  - mata-mata direto não mostra "Melhor campanha";
  - pôr o sorteio no meio mostra `'O sorteio precisa ser o último critério.'`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/painel/editores.test.tsx`.
- [ ] **Passo 3: Implementar** os dois editores.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(painel): editores de forma de disputa e regulamento`

### Tarefa 18: Meus campeonatos e assistente "Novo campeonato" (moderador)

**Arquivos:**
- Criar: `components/campeonatos/painel/MeusCampeonatos.tsx`, `components/campeonatos/painel/NovoCampeonato.tsx`, `components/campeonatos/painel/EnquadrarImagem.tsx`
- Modificar: `app/(coord)/moderador/page.tsx` (título `'Meus campeonatos'`; lista com `?campeonato=<id>` para abrir o gerenciador da Tarefa 19)
- Teste: `components/campeonatos/painel/novo.test.tsx`

**Interfaces:**
- Consome: `criar_campeonato` (RPC), `POST /api/campeonatos/[id]/escudo`, `POST /api/campeonatos/[id]/gerar` (com `simular` e depois para valer), os editores da Tarefa 17 e `areaDeRecorte`.
- Produz:
  - `<EnquadrarImagem arquivo={File} onPronto={(png: Blob) => void} />` — área quadrada com a imagem, controle de zoom (`<input type="range" aria-label="Aproximar">`), arrastar com ponteiro (pointer events, para funcionar no toque) e prévia ao vivo nos tamanhos 24 px (tabela) e 96 px (cartão). Gera um PNG de 512 px pelo `canvas`, usando `areaDeRecorte`. Também é usado pelo capitão (Tarefa 22).
  - `<MeusCampeonatos campeonatos={…} ehCoordenacao={boolean} />` — lista com o selo `'Aguardando liberação da ARENA VALE'` nos que têm `visivel = false`, o botão "Novo campeonato" e o link "Pré-visualizar" para `/campeonatos/<slug>`.
  - `<NovoCampeonato onCriado={(id) => void} />` — 5 passos com "Voltar" e "Continuar":
    - **1.** Nome, modalidade, ano, categoria e escudo (opcional, pelo `EnquadrarImagem`).
    - **2.** Times: buscar os que já existem pelo nome, ou cadastrar com nome e sigla. Mostra `'O escudo do time é colocado pelo capitão.'`. Cria as inscrições já `aprovada`.
    - **3.** Forma de disputa. Com grupos "montados à mão", aparece uma grade para pôr cada time num grupo (vira o `grupos` do `gerar`). Com o mata-mata "montado à mão", aparece a lista dos times para ordenar com setas (vira as `sementes`). Com "sorteio com cabeças de chave", marcam-se as cabeças.
    - **4.** Regulamento, que já vem com o `regulamentoPadrao(tipoPlacarDaModalidade(modalidade), forma)`.
    - **5.** Revisar: chama `gerar` com `simular: true`, mostra a lista de jogos (fase, rodada e "Time A x Time B" ou o rótulo da vaga) e o botão "Gerar os jogos". O campeonato é criado no fim do passo 1, para os passos seguintes já gravarem nele.

- [ ] **Passo 1: Escrever os testes que falham** (com o `fake-supabase` e `fetch` mockados):
  - o passo 1 sem nome mostra `'Informe o nome do campeonato.'`;
  - no fim do passo 1, chama `rpc('criar_campeonato', …)`;
  - no passo 5, chama `fetch('/api/campeonatos/c1/gerar', …)` com `simular: true` e mostra os jogos devolvidos;
  - "Gerar os jogos" chama de novo com `simular: false`;
  - `EnquadrarImagem`: mudar o zoom atualiza a prévia (o `style` da imagem prévia muda).
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/painel/novo.test.tsx`.
- [ ] **Passo 3: Implementar** os componentes e a página do moderador.
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(painel): meus campeonatos e assistente de novo campeonato`

### Tarefa 19: Gerenciar campeonato — aba Jogos

**Arquivos:**
- Criar: `components/campeonatos/painel/GerenciarCampeonato.tsx`, `components/campeonatos/painel/AbaJogosCampeonato.tsx`
- Modificar: `components/moderador/ResultadosCampeonato.tsx` (extrair o formulário de resultado de um jogo para `FormResultado`, exportado e reaproveitado aqui)
- Teste: `components/campeonatos/painel/jogos.test.tsx`

**Interfaces:**
- Consome: `FormResultado`, `/api/campeonatos/[id]/recalcular`, `rotuloDaVaga` e `classificar` (para achar os empates `aguardando_sorteio`).
- Produz:
  - `<GerenciarCampeonato id={string} ehCoordenacao={boolean} />` — abas Jogos, Times, Forma de disputa, Regulamento e Dados e escudo (as Tarefas 20 e 21 preenchem as outras).
  - `<AbaJogosCampeonato …>`:
    - **jogos por rodada ou fase:** em cada um, data e hora, local, resultado (pelo `FormResultado`), W.O. (botão "W.O." → escolher quem faltou; preenche o placar do `wo_placar`) e pênaltis ou "set de ouro" (só em mata-mata e só quando o placar do confronto empata);
    - **aplicar à rodada inteira:** botão "Aplicar esta data à rodada inteira";
    - **troca manual de vaga:** escolher o time e salvar com `vaga_manual = true`, com o aviso `'Troca manual: o recálculo automático não mexe mais nesta vaga.'`;
    - **registrar sorteio:** para cada empate pendente, ordenar os times e salvar em `campeonatos.ordem_sorteio[chave]`;
    - **recálculo:** depois de cada gravação, chama o recálculo e mostra os `avisos` devolvidos;
    - **delegado:** só a coordenação vê e escolhe o delegado de cada jogo (reaproveitar a lista de `coord-jogos.tsx`);
    - **corrigir súmula** (só com `ehCoordenacao`, só em jogo `finalizado`):
      - o botão "Corrigir súmula" abre o `FormResultado` com placar, pênaltis/set de ouro e W.O. já preenchidos, e o aviso `'Correção de jogo encerrado: o delegado não volta a ter acesso.'`;
      - salvar não mexe no `status` e chama o recálculo, mostrando os avisos;
      - o jogo corrigido mostra `'Corrigido em dd/mm às hh:mm'` a partir de `corrigido_em`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - salvar um resultado chama `/api/campeonatos/c1/recalcular` e mostra o aviso devolvido;
  - "Aplicar esta data à rodada inteira" faz o `update` com `.eq('campeonato_id', 'c1').eq('rodada', 2)`;
  - marcar W.O. do visitante num jogo de gols grava `wo: 'visitante'`, `placar_casa: 3`, `placar_visitante: 0` e `status: 'finalizado'`;
  - o moderador (`ehCoordenacao` falso) não vê o seletor de delegado;
  - a coordenação, num jogo finalizado, clica em "Corrigir súmula", muda o placar para 2x2 e salva: o `update` não traz `status` e o recálculo é chamado; o moderador não vê o botão.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/painel/jogos.test.tsx components/moderador`.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar e ver passar** (incluindo o `ResultadosCampeonato.test.tsx`, que já existe).
- [ ] **Passo 5: Commit** — `feat(painel): jogos do campeonato com W.O., pênaltis, vagas e sorteio`

### Tarefa 20: Gerenciar campeonato — Times, Forma de disputa, Regulamento e Dados e escudo

**Arquivos:**
- Criar: `components/campeonatos/painel/AbaTimesCampeonato.tsx`, `components/campeonatos/painel/AbaDadosCampeonato.tsx`
- Modificar: `components/campeonatos/painel/GerenciarCampeonato.tsx`
- Teste: `components/campeonatos/painel/abas.test.tsx`

**Regras:**
- **Times:** inscrever (existente ou novo, com nome e sigla), tirar a inscrição e editar o nome e a sigla só dos times com `cadastrado_por` igual ao usuário. O escudo aparece, mas não é editável.
- **Mudanças que mexem nos jogos:** uma mudança de times, forma de disputa ou regulamento, com os jogos já gerados, pede a confirmação `'Recriar os jogos que ainda não foram disputados?'`. Depois chama `gerar` com `formaMudou` conforme o tipo mudou, e mostra o `erro` (trava) ou os `avisos`.
- **Forma de disputa e Regulamento:** reaproveitam os editores da Tarefa 17. `travada` = há algum resultado. "Salvar regulamento" grava `campeonatos.regulamento`.
- **Dados e escudo:** nome, ano, categoria, modalidade, status e o escudo do campeonato (pelo `EnquadrarImagem` e pela rota da Tarefa 12).

- [ ] **Passo 1: Escrever os testes que falham:**
  - um time de outro `cadastrado_por` não tem o botão "Editar";
  - salvar a forma de disputa com jogos já gerados pergunta e, ao confirmar, chama `/gerar` com `formaMudou: true`;
  - um `erro` de trava devolvido pela rota aparece na tela.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/painel/abas.test.tsx`.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(painel): times, forma de disputa, regulamento e dados do campeonato`

### Tarefa 21: Coordenação — aba Campeonatos

**Arquivos:**
- Modificar: `components/coord-campeonatos.tsx` (vira o `MeusCampeonatos` com `ehCoordenacao`, a lista `'Aguardando liberação'` no topo e o `GerenciarCampeonato` ao abrir um campeonato)
- Criar: `components/campeonatos/painel/ControlesCoordenacao.tsx`
- Teste: `components/campeonatos/painel/coordenacao.test.tsx`

**Interfaces:**
- Produz: `<ControlesCoordenacao campeonato={{ id; slug; visivel; fases_destravadas }} fasesComResultado={string[]} />`. Fica dentro de `GerenciarCampeonato` quando `ehCoordenacao`. Tem:
  - a chave "Visível no site" (`update visivel`);
  - o campo do endereço (`slug`), validado pela mesma regra do `slugDoNome`, com o erro `'Este endereço já é de outro campeonato.'` no `23505`;
  - "Destravar fase", uma caixa por fase com resultado, gravando em `fases_destravadas`;
  - "Moderadores do campeonato": ligar e desligar, reaproveitando a lógica de `coord-moderadores.tsx` (insert e delete em `campeonato_moderadores`);
  - "Apagar campeonato", com confirmação digitando o nome.

- [ ] **Passo 1: Escrever os testes que falham:**
  - a lista `'Aguardando liberação'` mostra só os escondidos;
  - ligar "Visível no site" faz `update({ visivel: true })`;
  - o slug repetido (`23505`) mostra a mensagem;
  - "Apagar campeonato" só fica habilitado com o nome digitado igual.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/campeonatos/painel/coordenacao.test.tsx`.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(painel): liberação, endereço, trava e moderadores pela coordenação`

### Tarefa 22: Capitão — elenco por campeonato e escudo do time

**Arquivos:**
- Modificar: `components/capitao/MinhaEquipe.tsx`, `components/capitao-elenco.tsx`, `app/(coord)/capitao/page.tsx` (carregar a inscrição do campeonato do convite e o elenco de `inscricao_atletas` com os jogadores)
- Criar: `components/campeonatos/painel/MontadorEscudo.tsx`, `components/campeonatos/painel/EscudoDoTime.tsx`, `lib/ui/svg-para-png.ts`
- Teste: `components/capitao/MinhaEquipe.test.tsx`, `components/capitao-elenco.test.tsx`, `components/campeonatos/painel/escudo.test.tsx`

**Interfaces:**
- Consome: `inscrever_atleta` e `copiar_elenco` (RPCs), `POST /api/times/[id]/escudo`, `desenharEscudo`, `EnquadrarImagem`.
- Produz:
  - `svgParaPng(svg: string, lado = 512): Promise<Blob>` — desenha o SVG numa `Image` e num `canvas` e gera um PNG.
  - `<MontadorEscudo sigla={string} onPronto={(png: Blob, cor: string) => void} />` — formato, as duas cores (`<input type="color">`), o texto (até 4 letras, que já vem com a sigla), o detalhe e a prévia ao vivo. O botão "Usar este escudo" gera o PNG e devolve a cor principal.
  - `<EscudoDoTime time={{ id; nome; sigla; escudo_url; escudo_cor }} />` — mostra o escudo atual e dois botões, "Enviar o escudo que já temos" (`EnquadrarImagem`) e "Montar um escudo". As duas formas acabam em `POST /api/times/<id>/escudo`, com a `cor` quando vem do montador.

**Regras:**
- **Elenco:** o capitão adiciona o atleta pelo `inscrever_atleta` (no lugar do `insert` direto em `jogadores`) e mostra a mensagem de erro da função como está. A lista é o elenco daquele campeonato. O botão "Copiar elenco de outro campeonato" aparece quando o mesmo time tem outra inscrição, e mostra `'<n> atletas copiados.'`.
- **Remoção:** tirar um atleta do elenco apaga só a linha de `inscricao_atletas` (política da Tarefa 10); o atleta continua em `jogadores`.

- [ ] **Passo 1: Escrever os testes que falham:**
  - adicionar atleta chama `rpc('inscrever_atleta', { p_inscricao: 'i1', p_cpf: '52998224725', … })`;
  - o erro `'Este atleta já está inscrito neste campeonato pelo time Leões.'` aparece na tela;
  - "Copiar elenco" chama `copiar_elenco` e mostra `'3 atletas copiados.'`;
  - no `MontadorEscudo`, trocar o formato para "Redondo" muda a prévia (o SVG contém `<circle`);
  - "Usar este escudo" chama `fetch('/api/times/t1/escudo', …)` com um `FormData` que tem `cor`.
- [ ] **Passo 2: Rodar e ver falhar:** `npx vitest run --maxWorkers=2 components/capitao components/capitao-elenco.test.tsx components/campeonatos/painel/escudo.test.tsx`.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar e ver passar.**
- [ ] **Passo 5: Commit** — `feat(capitao): elenco por campeonato e escudo do time`

### Tarefa 23: Conferência final e publicação

- [ ] **Passo 1: Rodar tudo:** `npx vitest run --maxWorkers=2`, `npm run typecheck`, `npm run lint` e `npm run test:db`. Esperado: saída `0` em todos.
- [ ] **Passo 2: Build:** `npm run build`. Se cair por cache, `rm -rf .next` e repetir.
- [ ] **Passo 3: Percorrer no navegador** (`npm run dev` + Playwright, com o `.env.local` apontando para o banco TESTES):
  - criar um campeonato como moderador, com 6 times em grupos + mata-mata;
  - gerar os jogos e lançar todos os resultados dos grupos;
  - conferir que a chave se preenche sozinha;
  - liberar o campeonato como coordenação e abrir `/campeonatos/<slug>` em 375 px e em 1280 px, com prints;
  - como capitão, montar um escudo e ver que ele aparece na tabela.
- [ ] **Passo 4: Atualizar a documentação:** no `CLAUDE.md`, acrescentar `campeonatos/` em `lib/` e as rotas `campeonatos/` e `times/` na API. No `README.md`, a migração mais recente passa a ser a `0023`.
- [ ] **Passo 5: Entregar ao dono** o arquivo `supabase/migrations/0023_campeonatos.sql` para rodar no SQL Editor do banco oficial (ARENA VALE). **Esperar a confirmação "Success"** e o resultado do `select` dos atletas em dois times.
- [ ] **Passo 6: Publicar:** `git checkout main && git merge --no-ff campeonatos && git push origin main`. Conferir em https://www.arenavale.com.br/campeonatos que os campeonatos antigos continuam aparecendo e que a home e a agenda não mostram "null x null".
