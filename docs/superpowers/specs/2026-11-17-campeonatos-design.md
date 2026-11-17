# Campeonatos: aba própria, formas de disputa, súmula e estatísticas

**Data:** 2026-11-17 · **Situação:** aguardando o ok do dono
**Contexto:** produto que a ARENA VALE vende para organizadores (moderadores) de campeonatos da região. A faixa "Seu campeonato com cara de liga profissional" da home já oferece o serviço. Hoje não existe página pública de campeonatos: as tabelas aparecem só dentro de cada modalidade, o formato do campeonato não faz nada e quem monta os jogos é a coordenação.

São **três entregas**, cada uma com plano e publicação próprios, nesta ordem:

1. **Campeonatos:** aba no cabeçalho, página de cada campeonato com escudo, formas de disputa, regulamento, jogos criados automaticamente, classificação e avanço de fase automáticos, e painéis do moderador e da coordenação. **Esta é a entrega detalhada neste documento.**
2. **Súmula do delegado:** quem fez cada gol, cartões, goleiro titular e trocas de goleiro, e o botão "Súmula do jogo" no site.
3. **Estatísticas:** artilharia, goleiro menos vazado, suspensões automáticas por cartão e atletas destaques ligados ao campeonato.

As entregas 2 e 3 estão descritas aqui no nível de produto, com as regras que o dono já decidiu. Cada uma terá o seu detalhamento antes do plano.

## 1. Por que, e o que é sucesso

**Por quê:** a ARENA VALE quer vender a estrutura do site para quem organiza campeonatos. O moderador paga e ganha uma página do campeonato "com cara de liga profissional", sem precisar montar tabela, chave e classificação à mão.

**Sucesso:**
- um moderador cria o campeonato, sobe o escudo, cadastra os times, escolhe a forma de disputa, monta o regulamento e o site **cria todos os jogos sozinho**;
- a cada resultado lançado, a classificação se atualiza seguindo **o regulamento daquele campeonato**, e quando uma fase termina o site **coloca sozinho os classificados na fase seguinte**;
- o público acha os campeonatos pelo cabeçalho e cada campeonato tem a sua página, com o escudo em destaque.

**O que seria fracasso, mesmo funcionando** (anti-objetivos):
- jogos gerados com confrontos errados ou repetidos sem ninguém perceber;
- um moderador ver ou mexer no campeonato de outro;
- perder resultados já lançados ao mudar a forma de disputa;
- a home, a agenda ou a página de modalidade mostrarem "null x null" ou jogo sem data por causa dos jogos ainda "a definir";
- os campeonatos antigos pararem de aparecer.

## 2. O que o dono decidiu

- **Aba CAMPEONATOS no cabeçalho**, em destaque. Cada campeonato abre uma página própria, com **foto do campeonato como escudo**.
- **Formas de disputa prontas** para o moderador escolher. O site **cria os jogos automaticamente**: quem joga contra quem, quem se classifica e quem enfrenta quem na fase seguinte.
- **Regulamento por campeonato**, montado pelo moderador, incluindo a **ordem dos critérios de desempate** (ex.: 1º vitórias, 2º saldo de gols…).
- **Moderador e coordenação têm autonomia:** os dois criam e organizam campeonatos. O moderador só os dele, a coordenação todos.
- **Só a coordenação escolhe o delegado** de cada jogo (como hoje).
- **Súmula pelo delegado** (entrega 2): gols com o autor, cartões amarelos e vermelhos com o jogador, goleiro que jogou, troca de goleiro e gols sofridos por cada goleiro. No site, ao clicar num jogo, aparece "Súmula do jogo".
- **Estatísticas** (entrega 3): artilharia e goleiro menos vazado automáticos; **suspensão automática** por cartões, com o jogador **bloqueado na súmula seguinte**; atletas destaques como opção em cada campeonato.
- **Construção em três entregas**, cada uma publicada e funcionando (caminho 2).
- **Elenco por campeonato:** cada time monta um elenco para cada campeonato (§4.6). O mesmo CPF não entra em dois times do mesmo campeonato; vale quem inscreveu primeiro.
- **Escudo do time:** o site ajuda a enviar e enquadrar o escudo que o time já tem, ou a montar um escudo novo. **Só o capitão troca** (§4.6a).
- **Campeonato novo nasce escondido** e só aparece no site quando a coordenação liberar.

## 3. Caminhos considerados

| Caminho | Como | Prós | Contras |
|---|---|---|---|
| 1. Tudo de uma vez | Uma publicação com as três partes | Uma única revisão | Muito tempo sem nada no ar; erros misturados |
| **2. Três entregas (escolhido)** | Campeonatos → Súmula → Estatísticas | A entrega 1 já pode ser vendida; erros aparecem cedo; cada uma vai ao ar testada | Algumas telas mudam de novo nas entregas seguintes |

O dono escolheu o caminho 2.

**Escolhas técnicas minhas** (não mudam o que o dono vê):
- As regras (gerar jogos, classificar, desempatar, resolver o mata-mata, suspender) ficam em **funções puras** em `lib/campeonatos/`, sem banco, testadas sozinhas, como o resto do projeto (`lib/` puro + `portas.ts`).
- O regulamento fica guardado no próprio campeonato (`campeonatos.regulamento`, JSON validado pelo código). O catálogo de formas de disputa e de critérios de desempate fica **no código**, não no banco: são regras do produto, mudam com o código e precisam de teste.
- A classificação é **calculada pelo código** a partir dos jogos e do regulamento. A `v_classificacao` (que só sabe 3/1/0 e um único desempate) deixa de ser usada pelas páginas novas.

## 4. Entrega 1: Campeonatos

### 4.1 Catálogo de formas de disputa

Todas ficam disponíveis para qualquer campeonato. O moderador escolhe uma e preenche as opções.

**A. Pontos corridos**
- Turno único ou ida e volta (no ida e volta, o returno espelha o turno com mando invertido).
- Campeão: o 1º da classificação. Opcional: "final entre os N primeiros" (vira o formato C com 1 grupo).

**B. Mata-mata direto**
- Cada confronto em **jogo único** ou **ida e volta** (pode ser diferente na final: ex. ida e volta até a semi, final em jogo único).
- Chave **sorteada** pelo site ou **montada à mão** pelo moderador.
- Número de times que não é potência de 2 (ex.: 6, 10, 12): o site cria uma **fase preliminar** só com os times necessários; os outros passam direto (cabeças de chave, na ordem que o moderador definir ou sorteada).
- Disputa de **3º lugar**: liga ou desliga.

**C. Grupos + mata-mata**
- Quantidade de grupos e **quantos passam de cada grupo**.
- Opcional: **melhores colocados extras** (ex.: "os 2 melhores 3º colocados também passam"), comparados pelos mesmos critérios de desempate.
- Grupos **sorteados** (com ou sem cabeças de chave) ou **montados à mão**.
- Jogos dos grupos: turno único ou ida e volta dentro do grupo.
- Cruzamento do mata-mata: padrão **olímpico** (1º A x 2º B, 1º B x 2º A…), gerado sozinho. O moderador pode trocar à mão antes de a fase começar.
- O mata-mata segue as mesmas opções do formato B.

**Como o empate é decidido no mata-mata** (escolha do moderador, em ordem):
- jogo único: prorrogação (sim/não) e depois pênaltis;
- ida e volta: soma dos placares, depois (opcional) gol fora de casa, depois pênaltis;
- alternativa a pênaltis: "passa quem teve melhor campanha".

*Minha decisão:* "melhor campanha" é a campanha do time no campeonato inteiro até ali (grupos e mata-mata), comparada por aproveitamento e depois pelos critérios de desempate do regulamento. No mata-mata direto, sem jogos anteriores, a opção não aparece.

**Sets e cestas no mata-mata** (*minha decisão*, porque prorrogação, gol fora e pênaltis são regras do futebol):
- **vôlei:** jogo único não empata. Na ida e volta, conta quem venceu mais jogos. Se cada time vencer um, vale o **set de ouro** (lançado num campo próprio). O moderador escolhe **melhor de 3 ou de 5 sets**.
- **basquete:** jogo único não empata, porque a prorrogação já entra no placar. Na ida e volta, conta a soma dos pontos. Se a soma empatar, a prorrogação do 2º jogo decide e entra no placar dele.

### 4.2 Regulamento

Montado numa tela do painel, com valores padrão pelo esporte, e mostrado na página pública numa aba "Regulamento", em texto corrido e fácil de ler.

**Tipo de placar** (vem da modalidade, o moderador pode trocar):
- **gols** (futsal, futebol 7 e qualquer modalidade nova, por padrão);
- **sets** (vôlei e vôlei de praia): placar em sets ganhos, com os pontos de cada set opcionais;
- **cestas** (basquete): sem empate.

**Pontuação** (padrões, todos editáveis):
- gols: vitória 3, empate 1, derrota 0;
- sets: vitória sem precisar do set decisivo (2x0; ou 3x0 e 3x1 na melhor de 5) 3, vitória no set decisivo (2x1 ou 3x2) 2, derrota no set decisivo 1, outras derrotas 0;
- cestas: vitória 2, derrota 1;
- **W.O.**: o moderador marca o jogo como W.O. e escolhe o time que não compareceu. O vencedor ganha os pontos de vitória e um placar padrão (gols 3x0, sets 2x0 ou 3x0, cestas 20x0, editável no regulamento). Quem deu W.O. ganha 0 ponto, mesmo onde a derrota normalmente vale 1.

**Critérios de desempate:** o moderador escolhe quais usar e **em que ordem** (setas para subir e descer). Catálogo:

| Critério | Gols | Sets | Cestas |
|---|---|---|---|
| Mais vitórias | ✔ | ✔ | ✔ |
| Melhor saldo (gols / sets / cestas) | ✔ | ✔ | ✔ |
| Mais pró (gols / sets / cestas feitos) | ✔ | ✔ | ✔ |
| Menos contra (sofridos) | ✔ | ✔ | ✔ |
| Confronto direto | ✔ | ✔ | ✔ |
| Melhor média de sets (sets pró ÷ sets contra) | | ✔ | |
| Melhor média de pontos nos sets | | ✔ (se os pontos dos sets forem lançados) | |
| Menos cartões vermelhos / amarelos (fair play) | ✔ a partir da entrega 2 | | |
| Sorteio | ✔ | ✔ | ✔ |

Padrão para gols: vitórias, saldo, gols pró, confronto direto, sorteio.

**Regras de cálculo** (para os testes):
- os pontos sempre vêm primeiro; os critérios só desempatam quem tem os mesmos pontos;
- **confronto direto entre 3 ou mais times**: monta uma mini-tabela só com os jogos entre os empatados, aplicando pontos e depois a mesma lista de critérios; se separar parte do grupo, os que continuam empatados recomeçam a lista desde o início, só entre eles;
- **sorteio** não é feito pelo site na hora de mostrar a página: o site mostra "empate — aguardando sorteio" e o moderador registra o resultado do sorteio (a ordem fica salva no campeonato, por fase/grupo);
- "melhores colocados extras" entre grupos de tamanhos diferentes: comparados pelo **aproveitamento** (pontos ÷ pontos possíveis) antes dos critérios.

**Também no regulamento:**
- texto livre "Regras adicionais" (ex.: inscrição, uniforme, horários de tolerância), mostrado no fim do regulamento;
- campos das entregas 2 e 3, já previstos com padrão para não precisar migrar depois: regras de suspensão (§6) e seções opcionais da página (artilharia, goleiro menos vazado, atletas destaques).

### 4.3 Criação automática dos jogos

- **Pontos corridos e grupos:** método do círculo (round-robin): cada par se enfrenta uma vez por turno; nenhum time joga duas vezes na mesma rodada; com número ímpar de times, um time **folga** por rodada; o mando alterna o mais possível.
- **Mata-mata:** os jogos são criados já na geração, com as **vagas** descritas ("1º do Grupo A", "Vencedor do Jogo 3", "Perdedor da Semi 1" para o 3º lugar). O time de cada vaga fica vazio até ser decidido.
- **Datas, horários e local:** os jogos nascem **"a definir"**. O moderador preenche depois, jogo a jogo ou rodada a rodada ("aplicar esta data à rodada inteira").
- **Avanço automático:** sempre que um resultado é salvo, alterado ou apagado, o site recalcula as vagas daquele campeonato:
  - vaga de grupo: só é preenchida quando **todos os jogos do grupo** estão finalizados (antes disso, a página mostra "provável: Time X");
  - vaga de mata-mata: preenchida quando o confronto (1 ou 2 jogos) está decidido, incluindo os pênaltis;
  - se um resultado for corrigido depois e mudar quem passou, a vaga é atualizada, **desde que o jogo seguinte ainda não tenha resultado**. Se já tiver, o site não muda e avisa o moderador ("este ajuste mudaria o classificado de um jogo já disputado").
- **Ajuste manual:** o moderador pode trocar o time de uma vaga (ex.: exclusão de um time). A troca manual fica marcada e o recálculo automático não a desfaz.
- **Mudar a forma de disputa depois de gerar** (*minha decisão*, com trava **por fase**):
  - sem nenhum resultado no campeonato: o moderador muda tudo. O site apaga os jogos gerados e cria de novo;
  - com resultados: a forma de disputa e as fases já começadas ficam travadas. As opções das **fases que ainda não começaram** continuam livres, por exemplo final em jogo único ou ida e volta, ou disputa de 3º lugar sim ou não. O site recria só os jogos dessas fases;
  - a coordenação pode destravar uma fase já começada. Os jogos com resultado nunca são apagados: o site recria apenas os jogos sem resultado daquela fase, e o moderador ajusta o resto à mão. O site **não** tenta encaixar jogos já disputados numa forma de disputa nova.
- **Times inscritos depois de gerar:** mesma regra (só com a fase ainda sem resultados).
- **Apagar campeonato:** só a coordenação.

### 4.4 Telas públicas

**Cabeçalho:** item **Campeonatos** no menu, logo depois de "Início" (posição de destaque). Se o menu não couber mais numa linha a partir de 1024 px de largura, perguntar ao dono qual item vai para o ☰ (como foi feito com a Galeria).

**`/campeonatos`** (lista):
```
CAMPEONATOS
[Em andamento] [Encerrados]        [Todas as modalidades ▾]

┌──────────┐ ┌──────────┐ ┌──────────┐
│  ESCUDO  │ │  ESCUDO  │ │  ESCUDO  │
│  grande  │ │          │ │          │
│ Copa X   │ │ Liga Y   │ │ Taça Z   │
│ Futsal · │ │ Vôlei ·  │ │ Fut 7 ·  │
│ 2026     │ │ 2026     │ │ 2026     │
│ Quartas  │ │ Rodada 4 │ │ Grupos   │
└──────────┘ └──────────┘ └──────────┘
```
- cartões com o escudo grande; sem escudo, um escudo padrão com as iniciais e as cores da ARENA VALE;
- só aparecem campeonatos **visíveis** (§4.6);
- no fim, a faixa "Seu campeonato com cara de liga profissional" (a mesma da home).

**`/campeonatos/[slug]`** (página do campeonato):
```
┌───────────────────────────────────────────┐
│ [ESCUDO]  COPA X 2026                      │
│  grande   Futsal · Grupos + mata-mata      │
│           Fase atual: Quartas de final     │
└───────────────────────────────────────────┘
[Classificação] [Chave] [Jogos] [Regulamento]
```
- **Classificação:** uma tabela por grupo (ou uma só nos pontos corridos), com as colunas do tipo de placar (P, J, V, E, D, pró, contra, saldo; sets: P, J, V, D, sets pró/contra, média), faixa colorida em quem está na zona de classificação, e a observação "empate — aguardando sorteio" quando for o caso;
- **Chave:** desenho do mata-mata (no celular, uma fase por vez com setas), com as vagas ainda abertas ("1º do Grupo A");
- **Jogos:** por rodada ou fase, com data/hora ou "a definir", placar e status; cada jogo leva à página do jogo (na entrega 2 ganha o botão "Súmula do jogo");
- **Regulamento:** o regulamento em texto;
- a aba "Classificação" some no mata-mata direto; a aba "Chave" some nos pontos corridos sem final;
- endereço: `slug` gerado do nome + ano (ex.: `copa-x-2026`), único, editável pela coordenação.

**Outras páginas:**
- `/modalidades/[slug]`: as tabelas embutidas dão lugar a cartões dos campeonatos daquela modalidade, que levam a `/campeonatos/[slug]`;
- home: a faixa "Seu campeonato" passa a ter o botão "Ver como fica" apontando para `/campeonatos`;
- agenda, Hoje na Arena e home: **ignoram jogos sem data ou sem os dois times** definidos.

### 4.5 Painéis

**Moderador (`/moderador`)** passa a ser "Meus campeonatos":
- lista dos campeonatos dele e o botão **Novo campeonato**. O campeonato nasce **escondido** e aparece com o selo "Aguardando liberação da ARENA VALE" até a coordenação liberar. Enquanto isso, o moderador monta tudo e gera os jogos normalmente, e pode ver a página como o público vai ver ("pré-visualizar");
- criação em passos: **1** nome, modalidade, ano, categoria e escudo do campeonato → **2** times (escolher existentes ou cadastrar: nome e sigla; o escudo do time é sempre do capitão, §4.6a) → **3** forma de disputa → **4** regulamento → **5** revisar e **gerar os jogos** (mostra a lista de jogos antes de confirmar);
- dentro de um campeonato: abas **Jogos** (datas, local, resultados, W.O., pênaltis, ajuste manual de vagas, registro de sorteio), **Times**, **Forma de disputa**, **Regulamento**, **Dados e escudo**;
- o lançamento de resultados que existe hoje (`ResultadosCampeonato`) é reaproveitado dentro da aba Jogos.

**Coordenação (painel, aba Campeonatos):**
- as mesmas telas do moderador, para **todos** os campeonatos;
- **corrigir a súmula depois que o jogo acabou** (decisão do dono, para erros do delegado): em jogo já finalizado, a coordenação abre "Corrigir súmula" e muda placar, pênaltis/set de ouro e W.O.; o jogo continua finalizado, o delegado não volta a ter acesso, o site registra quem corrigiu e quando, e o recálculo das vagas roda na hora (com o mesmo aviso se a correção mudar o classificado de um jogo já disputado). Na entrega 2, a mesma tela corrige também gols com autor, cartões e goleiros (§5);
- a mais: **visível no site** (liga/desliga), com uma lista "Aguardando liberação" no topo da aba, **ligar/desligar moderadores** ao campeonato, destravar a forma de disputa, editar o endereço (`slug`), escolher o **delegado** de cada jogo (continua só da coordenação).

**Delegado:** sem mudança nesta entrega. A Mesa do Jogo continua com +GOL/-GOL; nos campeonatos de sets, o resultado é lançado pelo moderador.

### 4.6 Dados e permissões

**Mudanças no banco** (migração `0023_campeonatos.sql`, idempotente, aplicada à mão no banco TESTES e no oficial):
- `campeonatos`: `slug` (único), `regulamento jsonb`, `visivel boolean default false` (campeonato novo nasce **escondido**, decisão do dono; a migração marca os que já existem como visíveis), `modalidade` já existe, `logo_url` já existe (passa a ser o escudo), `ordem_sorteio jsonb` (desempates por sorteio registrados), `fases_destravadas text[]` (fases já começadas que a coordenação destravou; a trava em si é calculada pelos resultados);
- `jogos`:
  - `time_casa_id` e `time_visitante_id` passam a aceitar vazio (vaga ainda não decidida) e `data` também (jogo "a definir"); a regra "casa diferente de visitante" continua valendo quando os dois existem;
  - novos: `grupo text`, `ordem int` (número do jogo na chave), `vaga_casa jsonb` e `vaga_visitante jsonb` (de onde vem o time: grupo/posição, vencedor ou perdedor de outro jogo, melhor colocado extra), `vaga_manual boolean`, `jogo_volta_de uuid` (liga ida e volta), `penaltis_casa int`, `penaltis_visitante int`, `wo text` (`casa` | `visitante` | vazio), `parciais jsonb` (pontos de cada set), `corrigido_por uuid` e `corrigido_em timestamptz` (preenchidos sozinhos quando o resultado de um jogo já finalizado é mudado);
- **elenco por campeonato** (decisão do dono): nova tabela `inscricao_atletas` (`inscricao_id`, `jogador_id`, número da camisa e posição naquele campeonato), ligando a pessoa (`jogadores`, CPF único) ao time **naquele campeonato**:
  - o mesmo atleta não pode estar em dois times do mesmo campeonato. O controle é **pelo CPF** (decisão do dono): como cada CPF é uma única pessoa em `jogadores`, a tabela guarda também o `campeonato_id` e tem uma regra única (`campeonato_id`, `jogador_id`) no banco, que vale mesmo se dois times salvarem ao mesmo tempo;
  - **vale quem inscreveu primeiro** (decisão do dono): se outro time tentar inscrever o mesmo CPF, o site recusa com o aviso "Este atleta já está inscrito neste campeonato pelo time X". Só o moderador do campeonato ou a coordenação pode tirar o atleta do primeiro time, e aí ele fica livre para o outro;
  - pode estar em times diferentes em campeonatos diferentes;
  - `jogadores.time_id` continua existindo como "time atual", mas súmula, artilharia e suspensões (entregas 2 e 3) usam só o elenco do campeonato;
  - quem monta o elenco: o capitão do time naquele campeonato (o vínculo `time_capitaes.campeonato_id` já existe), o moderador do campeonato e a coordenação. Há um botão "copiar elenco de outro campeonato do mesmo time";
  - inscrições que já existem: o elenco é preenchido com os jogadores atuais do time (`jogadores.time_id`). Se o mesmo CPF aparecer em dois times do mesmo campeonato, fica no time inscrito primeiro (`inscricoes.submitted_at`), e a migração lista os casos para a coordenação conferir;
  - a tela do capitão (`/capitao`, `MinhaEquipe`) passa a editar o elenco do campeonato ao qual ele está ligado;
- bucket `campeonatos` (leitura pública) para os escudos; escudo tratado no servidor com `sharp` (quadrado, 512 px, fundo transparente preservado), como a galeria já faz;
- campeonatos que já existem (*minha decisão*):
  - recebem `slug` e continuam visíveis;
  - quem estava em pontos corridos recebe o regulamento padrão de pontos corridos e ganha a página completa;
  - quem estava em mata-mata ou grupos + mata-mata recebe o regulamento marcado como "formato antigo". A página mostra só as abas **Jogos** (lista por data, com a `fase` em texto como está) e **Regulamento**, sem tabela e sem chave;
  - o moderador ou a coordenação pode reconfigurar esses campeonatos pelo painel, seguindo a regra de trava por fase acima.
- os times do campeonato são os das inscrições **aprovadas** (o moderador inscreve já aprovado);
- o recálculo das vagas também roda quando o delegado finaliza um jogo na Mesa do Jogo, não só quando o moderador lança um resultado.

**Permissões (RLS + funções `security definer`):**
- **moderador** pode **criar** campeonato; ao criar, fica ligado a ele automaticamente (`campeonato_moderadores`);
- moderador **edita** só os campeonatos ligados a ele: dados, escudo, regulamento, inscrições de times e a estrutura dos jogos (datas, local, times das vagas, fase, rodada, grupo). Continua **sem poder** mudar `delegado_id`, `visivel` e o destrave da forma de disputa;
- moderador pode **cadastrar times** e editar os times que ele cadastrou; times de outros só podem ser escolhidos, não editados;
- o gatilho `moderador_so_resultado` passa a permitir mudanças estruturais pelo moderador **do campeonato daquele jogo**, mantendo `delegado_id` exclusivo da coordenação;
- a geração e o recálculo das vagas rodam no servidor (rota ou ação do servidor que confere o cargo antes), nunca confiando no navegador;
- leitura pública: só campeonatos `visivel = true` (e os jogos deles) aparecem nas páginas públicas; a equipe vê todos.

**Testes de permissão** (`npm run test:db`): moderador A não lê o rascunho nem edita o campeonato de B; moderador não muda `delegado_id` nem `visivel`; público não vê campeonato escondido; o mesmo CPF não entra em dois times do mesmo campeonato (o segundo é recusado, o primeiro continua) e entra normalmente em outro campeonato.

### 4.6a Escudo do time

Cada time tem o seu escudo, mostrado na classificação, na chave, nos jogos, na agenda e na página do time. O site ajuda a fazer a imagem de dois jeitos (decisão do dono: os dois):

**1. Enviar o escudo que o time já tem**
- o capitão sobe a foto ou o arquivo (JPG, PNG ou WEBP);
- uma tela de enquadramento: recortar em quadrado, aproximar/afastar e arrastar para centralizar, com uma prévia ao vivo de como fica na tabela (pequeno) e no cartão (grande);
- o servidor padroniza com `sharp`: quadrado, 512 px, fundo transparente preservado, no bucket `campeonatos` (pasta dos times).

**2. Montar um escudo no site** (para quem não tem)
```
FORMATO   [🛡 clássico] [⬤ redondo] [◆ losango] [⬟ moderno]
CORES     principal [■]   secundária [■]
TEXTO     sigla (até 4 letras) ou iniciais
DETALHE   [nenhum] [faixa] [listras] [estrela]
          ┌────────┐
 prévia → │ ESCUDO │  [Usar este escudo]
          └────────┘
```
- desenhado no navegador como imagem (SVG convertido em PNG) e guardado igual ao enviado;
- a cor principal também passa a ser a `escudo_cor` do time, usada nas faixas da tabela.

**Regras**
- **só o capitão do time troca o escudo** (decisão do dono). Moderador e coordenação veem, mas não mudam. Qualquer capitão ligado àquele time (em qualquer campeonato) pode trocar, porque o escudo é do time, não do campeonato (*minha decisão*);
- time sem escudo (ex.: cadastrado pelo moderador e ainda sem capitão) aparece com um escudo padrão desenhado sozinho com a sigla e a `escudo_cor`, nunca com espaço vazio;
- a troca vale na hora em todos os campeonatos do time;
- no banco: o `times.escudo_url` já existe; uma função `security definer` `trocar_escudo_time(time, url)` confere que quem chama é capitão daquele time. O envio da imagem passa por uma rota no servidor que confere o mesmo antes de guardar. A política de `times` impede o moderador e a coordenação de mudar `escudo_url` diretamente;
- teste de permissão: capitão troca o escudo do próprio time; capitão de outro time, moderador e coordenação não conseguem.

### 4.7 Testes da lógica (funções puras)

- geração round-robin com 3 a 20 times, turno e returno: todo par uma vez por turno, ninguém duas vezes na rodada, folgas corretas;
- chave do mata-mata com 2 a 32 times, incluindo preliminar para números que não são potência de 2;
- cruzamento olímpico com 2, 4 e 8 grupos e com melhores colocados extras;
- classificação com cada critério do catálogo, confronto direto entre 2 e entre 3+ times, sorteio pendente e registrado;
- pontuação de sets e cestas, W.O.;
- resolução de vagas: grupo incompleto, ida e volta com gol fora, pênaltis, correção de resultado antes e depois do jogo seguinte, vaga manual preservada.

## 5. Entrega 2: Súmula do delegado (resumo)

- Na Mesa do Jogo, o delegado:
  - marca o **goleiro titular** de cada time, escolhendo no elenco (já vem marcado quem está cadastrado como goleiro);
  - lança **gol** com o autor (do elenco) e o minuto; opção **gol contra**, que conta para o outro time e não entra na artilharia;
  - lança **cartão amarelo** e **cartão vermelho** com o jogador e o minuto;
  - lança **troca de goleiro**: quem saiu, quem entrou, minuto;
  - confere e **finaliza**. Ao finalizar, o delegado perde o acesso, como hoje.
- **Correção pela coordenação depois do jogo** (decisão do dono): a coordenação corrige qualquer lançamento do delegado num jogo finalizado: incluir, apagar ou mudar gol (autor, minuto, gol contra), cartão, goleiro titular e troca de goleiro. Cada correção fica registrada (quem, quando, o que era e o que ficou). Na súmula pública aparece "Súmula corrigida pela ARENA VALE em dd/mm". Artilharia, goleiro menos vazado e suspensões (entrega 3) são recalculados a partir da súmula corrigida.
- **Gols sofridos por goleiro:** calculados pelo minuto de cada gol em relação às trocas.
- Público: ao clicar num jogo, botão **"Súmula do jogo"**, abrindo a súmula (a página `/sumula/[id]` já existe e ganha essas informações).
- Gols já lançados antes desta entrega, sem o autor, contam no placar mas não na artilharia.
- Libera o critério de desempate "fair play" (menos cartões).

## 6. Entrega 3: Estatísticas e suspensões (resumo)

- **Artilharia** e **goleiro menos vazado** automáticos, a partir das súmulas. O goleiro menos vazado usa a média de gols sofridos por jogo e exige ter jogado ao menos **50%** dos jogos do time (percentual editável no regulamento).
- **Suspensões** (padrões editáveis no regulamento):
  - 3 amarelos → suspenso no próximo jogo do time; depois de cumprir, a contagem zera;
  - 2 amarelos no mesmo jogo = vermelho;
  - vermelho → suspenso no próximo jogo; o moderador pode aumentar para N jogos naquele caso;
  - a suspensão é cumprida quando o time joga a partida seguinte (W.O. a favor conta como cumprida; jogo adiado não);
  - os amarelos **zeram ao começar o mata-mata** (editável); suspensões pendentes continuam;
  - o jogador suspenso aparece **bloqueado na súmula seguinte**, com o motivo, e o delegado não consegue lançá-lo;
  - coordenação e moderador do campeonato podem **liberar** um jogador (ex.: recurso aceito); fica registrado quem liberou e quando;
  - a página do campeonato mostra os **suspensos para a próxima rodada**.
- **Atletas destaques** como seção opcional do campeonato: o moderador liga ou desliga e cadastra os destaques (foto, nome, time, título). Os destaques passam a ter `campeonato_id`; aparecem na página do campeonato e na galeria geral `/atletasdestaques`, que ganha filtro por campeonato. Os destaques antigos (campeonato em texto) continuam como estão.
- Na página do campeonato, nova aba **Estatísticas** (artilharia, goleiro, suspensos, destaques), cada seção ligada ou desligada pelo moderador.

## 7. Fora deste projeto

- cobrança, pagamento e contrato com o moderador (a venda continua pelo WhatsApp);
- inscrição de times pelo próprio time (o fluxo `/inscricao` atual não muda);
- várias categorias dentro de um mesmo campeonato: cada categoria é um campeonato separado;
- estatísticas de vôlei e basquete por jogador (pontos, rebotes, aces);
- placar ao vivo novo: a Mesa do Jogo e o "AO VIVO" da home continuam como estão.

## 8. Restrições

- A marca é sempre **ARENA VALE**; nunca escrever "Sports"/"Sport" em nenhum texto.
- Código e textos em português, seguindo o vocabulário do projeto e o `DESIGN.md` (vermelho/branco/grafite).
- Next.js 16: ler o guia em `node_modules/next/dist/docs/` antes de código específico do Next.
- Migrações idempotentes, numeradas, aplicadas à mão pelo dono no banco oficial; o construtor aplica no TESTES e roda `npm run test:db`.
- PC com pouca memória: `npx vitest run --maxWorkers=2`; conferir o código de saída.
- Publicação: push na `main` vai ao ar; trabalhar numa branch e juntar no fim de cada entrega.

## 9. Deixado ao construtor

- nomes de arquivos, componentes e funções dentro de `lib/campeonatos/`, `components/campeonatos/` e `app/campeonatos/`;
- o formato exato do JSON do regulamento e das vagas (com campo de versão);
- se o recálculo das vagas roda numa ação do servidor ou numa rota de API;
- o desenho da chave no computador e no celular, dentro do `DESIGN.md`;
- o escudo padrão para campeonato sem foto;
- o desenho exato dos formatos e detalhes do montador de escudo, dentro do `DESIGN.md`.
