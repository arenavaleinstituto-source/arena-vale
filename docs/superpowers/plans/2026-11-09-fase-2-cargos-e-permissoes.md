# Fase 2 — Cargos e permissões — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer cada cargo (proprietário, coordenador, moderador, capitão) poder exatamente o que o spec define, garantido pelo banco (RLS), com painéis reais para cada um e o botão "Entrar" no cabeçalho.

**Architecture:**
- **Regras no banco.** Duas migrações novas: `0009` (cargos e funções) e `0010` (políticas). A `0010` **apaga todas as políticas existentes** das tabelas públicas e recria o conjunto completo, porque o banco de produção tem políticas e funções que não estão no repositório. O cargo é sempre lido no servidor (`profiles.role` + tabela `proprietario`).
- **Testes de banco.** Rodam num projeto Supabase separado ("TESTES"), que um script recria do zero a cada rodada.
- **Interface.** Fica fina sobre RPCs `security definer`.

**Tech Stack:** Next 16, React 19, Supabase (Postgres, RLS, Auth admin API), Vitest, `pg` (só nos scripts de teste).

**Spec:** `docs/superpowers/specs/2026-11-08-arena-vale-organizacao-noticias-permissoes-design.md`, seções 3.4 (atalho do dono logado), 5 e 6.

**Diferenças em relação ao spec, decididas aqui (o executor não deve reabri-las):**
- **Numeração das migrações:** a `0008` já foi usada (limite de 3 coordenadores). Cargos = `0009`, políticas = `0010`. A Fase 3 começa em `0011`.
- **Campos do Telegram** (`profiles.telegram_user_id`, `telegram_codigos_vinculo`): ficam para a Fase 3, junto com o bot.
- **Dono no banco:** hoje ele tem `role = 'proprietario'`. A `0009` o converte para `coordenador` + linha em `proprietario`. O valor `proprietario` continua no enum, sem uso, porque o Postgres não remove valores de enum.

## Global Constraints

- **O proprietário nunca aparece como "Proprietário"** em texto visível, `title` ou `aria-label`. Ele aparece como "Coordenador".
- **Limite de coordenadores:** padrão **3** (o dono + 2), em `proprietario.limite_coordenadores`. Só o dono altera, mínimo 1. Para baixar abaixo do número atual, é preciso escolher quem sai (transação única).
- **Ninguém muda o próprio `role`.** O cargo muda só por `definir_cargo()`. Coordenadores definem apenas `moderador`, `capitao` e `autenticado`, e nunca alteram um coordenador. Ninguém altera o dono.
- **`/proprietario`** responde **404** para quem não é o dono, logado ou não. Fica fora do sitemap, do `robots.txt` e dos menus.
- **Moderador:** lança placar, placar do 1º tempo, status, eventos e súmula **só** nos jogos dos campeonatos ligados a ele. Nunca muda data, local, times ou campeonato de um jogo.
- **Capitão:** cria e edita **a própria equipe** (uma por campeonato em que foi convidado) e a lista de jogadores dela. Nada mais.
- **A classificação é calculada** (`v_classificacao`) e nunca editada à mão.
- **Testes de banco só no projeto TESTES.** O script recusa rodar se a URL contiver `cpvmfpxxrdpvfbonwynr` (produção).
- **Nunca imprimir chaves nem senhas** em log. As chaves de teste vêm de `.env.test.local`.
- Textos em pt-BR, com títulos em caixa alta. Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Moderador muda o placar e, na mesma requisição, a data do jogo:** a requisição inteira deve falhar, sem gravar nem o placar. Teste na Task 3.
2. **Capitão tenta criar uma 2ª equipe no mesmo campeonato,** ou uma equipe num campeonato para o qual não foi convidado: deve ser recusado, com mensagem clara. Teste na Task 3.
3. **Coordenador remove o próprio cargo** ou tenta rebaixar o dono por `definir_cargo`: deve ser recusado. Teste na Task 2.
4. **Usuário logado sem cargo abre `/coordenador`:** vai para `/acesso-negado`, e não para uma tela quebrada. **Visitante abre `/proprietario`:** vê o 404 comum. Teste na Task 4.
5. **Convite para um e-mail que já tem conta:** só adiciona o cargo e o vínculo, sem erro e sem criar conta duplicada. Teste na Task 6.

---

### Task 1: Banco de testes reproduzível

**Files:**
- Create: `scripts/db/teste-env.ts`, `scripts/db/resetar-banco-teste.ts`
- Create: `vitest.db.config.ts`, `tests/db/global-setup.ts`, `tests/db/fixtures.ts`, `tests/db/sanidade.test.ts`
- Modify: `package.json` (scripts `db:teste:resetar` e `test:db`; devDependency `pg`, `@types/pg`), `vitest.config.ts` (excluir `tests/db/**`)

**Interfaces:**
- Produces:
  - `carregarEnvTeste(): { url: string; anonKey: string; serviceKey: string; databaseUrl: string }`. Lê o `.env.test.local`. Lança erro se faltar algum campo ou se alguma URL contiver `cpvmfpxxrdpvfbonwynr`.
  - `resetarBancoTeste(): Promise<void>`. Faz `drop schema public cascade; create schema public;` e restaura os grants padrão do Supabase (`usage` e `all on tables/sequences/functions` para `anon`, `authenticated`, `service_role`, mais os `default privileges`). Depois aplica `supabase/migrations/*.sql` em ordem, um arquivo por consulta.
  - `criarUsuario(cargo: 'autenticado'|'coordenador'|'moderador'|'capitao', opts?: { dono?: boolean }): Promise<{ id: string; email: string; senha: string }>`. Cria via `auth.admin.createUser` (`email_confirm: true`, e-mail `teste+<cargo>-<timestamp>-<n>@arenavale.test`). Grava o cargo com a service role. Com `dono: true`, insere a linha em `proprietario`.
  - `clienteComo(u): Promise<SupabaseClient>`. Cliente anon logado com `signInWithPassword`.
  - `admin(): SupabaseClient`. Cliente com a service role.
  - `apagarUsuariosDeTeste(): Promise<void>`. Remove os usuários `@arenavale.test`.
  - Comando `npm run test:db`: roda `vitest run -c vitest.db.config.ts` (`environment: 'node'`, `fileParallelism: false`, `globalSetup` reseta o banco uma vez).

- [ ] **Step 1 (dono): preencher o `.env.test.local`** (já criado e aberto no VS Code). O agente confere sem imprimir valores: `grep -c 'COLE_AQUI' .env.test.local` deve dar `0`.
- [ ] **Step 2: escrever `tests/db/sanidade.test.ts`, que deve falhar**
  - `recusa a URL de produção`: `carregarEnvTeste` com um env falso contendo `cpvmfpxxrdpvfbonwynr` lança erro.
  - `banco de teste tem as tabelas base`: `admin().from('campeonatos').select('id').limit(1)` sem erro.
  - `criarUsuario cria perfil com o cargo pedido`: `profiles.role === 'moderador'`.
- [ ] **Step 3: rodar `npm run test:db`.** Esperado: FAIL (módulos não existem).
- [ ] **Step 4: implementar os módulos e os scripts acima.** O reset roda as migrações 0001–0008.
  - Se uma migração falhar num banco novo (ex.: o bucket da 0005 já existe), corrigir a migração para ser idempotente, sem mudar o comportamento, e registrar Ruling.
- [ ] **Step 5: rodar `npm run test:db`.** Esperado: PASS (3). Rodar também `npm test`: os 26 testes continuam passando, e nenhum teste de banco entra nele.
- [ ] **Step 6: Commit** (`test(db): banco de testes reproduzível no projeto TESTES`).

---

### Task 2: Migração 0009 — cargos, dono escondido, limite e mudança de cargo

**Files:**
- Create: `supabase/migrations/0009_cargos_e_proprietario.sql`
- Test: `tests/db/cargos.test.ts`

**Interfaces:**
- Produces (SQL, `security definer`, `search_path = public`):
  - Tabela `proprietario(profile_id uuid primary key references profiles on delete restrict, limite_coordenadores int not null default 3 check (limite_coordenadores >= 1), modo_video text not null default 'guardar_arquivo', dias_validade_video int not null default 30)`, com no máximo 1 linha (índice único em `(true)`). RLS: `select` só com `profile_id = auth.uid()`. Sem políticas de escrita.
  - Conversão do dono: insere em `proprietario` o perfil com `role = 'proprietario'` (se houver um) e passa esse perfil para `coordenador`.
  - `is_proprietario() returns boolean`.
  - `is_staff() returns boolean`: `role = 'coordenador'`.
  - `is_coordenador() returns boolean`: mesmo corpo de `is_staff()`, por compatibilidade com o código atual.
  - `cargo_atual() returns user_role`.
  - `is_moderador_do_campeonato(c uuid) returns boolean`.
  - `is_capitao_do_time(t uuid) returns boolean`.
  - Trigger `guard_coordenadores` (substitui `guard_single_coordenador`, que é removida): recusa o insert/update que deixaria `count(coordenador) > coalesce((select limite_coordenadores from proprietario), 3)`. Mensagem: "Limite de N coordenadores atingido."
  - Trigger `proteger_cargo` (`before update of role on profiles`): recusa a mudança de cargo, exceto quando `current_setting('arena.permitir_cargo', true) = 'on'` ou `auth.role() = 'service_role'` ou `current_user = 'postgres'`. Mensagem: "O cargo só pode ser alterado pela coordenação."
  - `definir_cargo(perfil uuid, cargo user_role) returns void`: aplica as regras dos Global Constraints e faz `set_config('arena.permitir_cargo','on', true)` antes do update.
  - `definir_limite_coordenadores(n int, remover uuid[] default '{}') returns void`: só o dono. Numa transação, rebaixa os perfis de `remover` para `autenticado` e grava `n`. Recusa se `n < 1`, se `remover` contém o dono, ou se depois das remoções ainda houver mais coordenadores que `n`.

- [ ] **Step 1: testes que devem falhar** (`tests/db/cargos.test.ts`, usando as fixtures):
  - `usuário comum não muda o próprio role` (update em `profiles.role` dá erro e o cargo continua `autenticado`);
  - `coordenador não promove ninguém a coordenador`;
  - `coordenador define moderador e capitão`;
  - `coordenador não rebaixa outro coordenador nem o dono` (Review Focus 3);
  - `coordenador não remove o próprio cargo` (Review Focus 3);
  - `dono promove até o limite (3) e o 4º é recusado`;
  - `dono sobe o limite para 4 e o 4º é aceito`;
  - `coordenador comum não muda o limite`;
  - `baixar o limite sem escolher quem sai falha`;
  - `baixar de 3 para 2 removendo 1 funciona e a pessoa vira autenticado`;
  - `dono aparece com role coordenador para qualquer leitor`;
  - `coordenador comum lê a tabela proprietario vazia`;
  - `is_proprietario é true só para o dono`.
- [ ] **Step 2: `npm run test:db -- cargos`.** Esperado: FAIL.
- [ ] **Step 3: escrever a `0009`** (idempotente: `create or replace`, `if not exists`, `drop trigger if exists`).
- [ ] **Step 4: `npm run test:db`.** Esperado: PASS (todos).
- [ ] **Step 5: Commit.**

---

### Task 3: Migração 0010 — políticas de todas as tabelas, moderador por campeonato, equipe do capitão, classificação correta

**Files:**
- Create: `supabase/migrations/0010_politicas_por_cargo.sql`
- Test: `tests/db/politicas.test.ts`, `tests/db/classificacao.test.ts`

**Interfaces:**
- Produces:
  - **Bloco inicial:** um `DO` que apaga **todas** as políticas de todas as tabelas do schema `public` (`pg_policies`) e liga o RLS em todas elas.
  - **Tabela `campeonato_moderadores(profile_id, campeonato_id, primary key(profile_id, campeonato_id))`:** escrita só staff; leitura staff ou a própria linha.
  - **`time_capitaes`:**
    - ganha `campeonato_id uuid references campeonatos`, preenchido a partir de `inscricoes` para as linhas existentes;
    - `time_id` passa a aceitar nulo, porque o convite chega antes da equipe;
    - índice único `(profile_id, campeonato_id)`.
  - **`criar_minha_equipe(campeonato uuid, nome text, sigla text, escudo_url text default null) returns uuid`:** só quem tem convite em `time_capitaes` para esse campeonato e ainda está com `time_id` nulo. Cria o time e a `inscricao` (`status 'pendente'`) e preenche `time_capitaes.time_id`. Recusas, com as mensagens exatas:
    - "Você não foi convidado como capitão neste campeonato."
    - "Você já cadastrou sua equipe neste campeonato." (Review Focus 2)
  - **Trigger `moderador_so_resultado` em `jogos`** (`before update`): se quem chama não é staff, recusa qualquer mudança em `data`, `local`, `time_casa_id`, `time_visitante_id`, `campeonato_id`, `fase` ou `rodada`. Mensagem: "Moderador só lança resultados." (Review Focus 1)
  - **Políticas por tabela:**

    | Tabela | Leitura | Escrita |
    |---|---|---|
    | `profiles` | todos | update só do próprio `full_name`, `phone`, `avatar_url` (o cargo é protegido pela 0009); staff atualiza qualquer um |
    | `campeonatos`, `transmissoes`, `patrocinadores`, `site_config`, `noticias`, `atletas_destaque`, `coordenadores`, e `agenda_jogos` (só se a tabela existir) | todos (`noticias`/`atletas_destaque`: `ativo` ou staff) | staff |
    | `times` | todos | staff; o capitão atualiza o próprio time |
    | `inscricoes` | todos | staff; insert pelo formulário público continua permitido |
    | `jogadores` | todos | staff ou capitão do time |
    | `jogos` | todos | insert/delete: staff; update: staff ou moderador do campeonato (o trigger acima limita as colunas) |
    | `eventos_jogo` | todos | staff ou moderador do campeonato do jogo |
    | `sumulas` | validadas para todos; staff e moderador do campeonato veem todas | staff ou moderador do campeonato do jogo |
    | `financeiro_movimentacoes` | staff | staff |
    | `notificacoes` | só o destinatário | só o destinatário |
    | `solicitacoes_inscricao` | staff ou moderador | insert público com `autorizacao_responsavel = true`; update: staff ou moderador |
    | `time_capitaes` | staff ou a própria linha | staff |
    | `time_moderadores` (legado) | staff | staff |

  - **`v_classificacao` refeita** (`create or replace view`):
    - gols pró e gols contra conforme o lado (casa ou visitante);
    - pontos 3 / 1 / 0 por jogo `finalizado`;
    - colunas `campeonato_id, time_id, time_nome, time_sigla, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo, pontos`.
  - **Correções menores da 0007:** mover o comentário "Preenche a modalidade…" para cima do `UPDATE`; restringir o `update noticias set ordem = 1` às linhas com `created_at < '2026-11-01'`.

- [ ] **Step 1: testes que devem falhar.** Cada um cria um campeonato, 2 times e 1 jogo pela service role.
  - `moderador lança placar no jogo do seu campeonato`;
  - `moderador não lança placar em outro campeonato`;
  - `moderador muda placar + data na mesma requisição → nada é gravado` (Review Focus 1);
  - `moderador lança evento (gol) e cria súmula do seu campeonato`;
  - `capitão convidado cria a equipe e cadastra jogadores`;
  - `capitão não cria 2ª equipe no mesmo campeonato` (Review Focus 2);
  - `capitão sem convite não cria equipe` (Review Focus 2);
  - `capitão não edita jogador de outro time`;
  - `capitão não altera jogo nem evento`;
  - `visitante (anon) lê jogos e campeonatos mas não escreve`;
  - `usuário comum não lê financeiro`;
  - `política antiga apagada`: depois de criar uma política `teste_aberta` com `using (true)` em `financeiro_movimentacoes` e reaplicar a 0010, ela não existe mais.
  - Em `classificacao.test.ts`: `vitória 3-1 como visitante dá 3 pontos, gols pró 3, contra 1`; `empate dá 1 ponto para cada`; `jogo agendado não conta`.
- [ ] **Step 2: `npm run test:db`.** Esperado: FAIL nos testes novos.
- [ ] **Step 3: escrever a `0010`.**
- [ ] **Step 4: `npm run test:db`.** Esperado: PASS (todos, incluindo os da Task 2).
- [ ] **Step 5: Commit.**

---

### Task 4: Rotas protegidas por cargo

**Files:**
- Create: `lib/auth/cargo.ts`, `lib/auth/rotas.ts`, `app/acesso-negado/page.tsx`
- Modify: `proxy.ts`, `app/(coord)/proprietario/page.tsx` (início: checagem no servidor), `app/sitemap.ts`, `app/robots.ts`
- Test: `lib/auth/rotas.test.ts`

**Interfaces:**
- Produces:
  - `type Cargo = 'visitante' | 'autenticado' | 'coordenador' | 'moderador' | 'capitao'`.
  - `decidirRota(pathname: string, cargo: Cargo, ehDono: boolean): 'livre' | 'login' | 'negado' | 'nao-encontrado'`:

    | Rota | Quem passa |
    |---|---|
    | `/proprietario/**` | só o dono; qualquer outro → `nao-encontrado` |
    | `/coordenador/**`, `/painel/**` | coordenador |
    | `/moderador/**` | moderador ou coordenador |
    | `/capitao/**` | capitão ou coordenador |
    | qualquer outra | `livre` |

    Visitante numa rota protegida que não é `/proprietario` → `login`. Logado sem o cargo → `negado`.
  - `destinoPorCargo(cargo: Cargo, next?: string | null): string | null`:
    - coordenador → `/coordenador`; moderador → `/moderador`; capitão → `/capitao`; outros → `null`;
    - um `next` só é usado se `decidirRota(next, cargo, false) === 'livre'` ou se o cargo permitir a rota, e nunca para URLs externas (precisa começar com `/` e não com `//`).
  - `lerCargo(supabase): Promise<{ cargo: Cargo; ehDono: boolean }>`. Lê `profiles.role` e chama `rpc('is_proprietario')`.

- [ ] **Step 1: testes que devem falhar** (`rotas.test.ts`), uma linha por combinação da tabela acima, incluindo:
  - `visitante em /proprietario → nao-encontrado` (Review Focus 4);
  - `autenticado em /coordenador → negado` (Review Focus 4);
  - `next=//site.com é ignorado`;
  - `next=/moderador para capitão é ignorado`.
- [ ] **Step 2: `npx vitest run lib/auth`.** Esperado: FAIL.
- [ ] **Step 3: implementar.**
  - **`proxy.ts`:**
    - se faltar `NEXT_PUBLIC_SUPABASE_URL` ou a `ANON_KEY` (minor deferido da Fase 1), redireciona para `/login`;
    - `login` → redirect para `/login?next=`;
    - `negado` → redirect para `/acesso-negado`;
    - `nao-encontrado` → `NextResponse.rewrite(new URL('/_nao-existe', req.url))`, que cai no 404 comum;
    - o matcher inclui `/moderador/:path*` e `/capitao/:path*`.
  - **`app/(coord)/proprietario/page.tsx`:** chama `notFound()` se `!ehDono` (defesa em camadas).
  - **`/acesso-negado`:** título "ACESSO NEGADO" e o texto "Sua conta não tem acesso a esta área. Fale com a coordenação.", com link para o início.
- [ ] **Step 4: `npm test`.** Esperado: PASS. **`npm run build`.** Esperado: sem erros.
- [ ] **Step 5: Commit.**

---

### Task 5: Botão "Entrar", login por cargo, criar senha e atalho do dono

**Files:**
- Create: `components/auth/EntrarEquipe.tsx`, `app/criar-senha/page.tsx`
- Modify: `components/SiteHeader.tsx`, `app/(auth)/login/page.tsx`, `components/auth/LogoSecreto.tsx`, `components/auth/OwnerLoginModal.tsx`
- Test: `components/auth/EntrarEquipe.test.tsx`, `components/auth/LogoSecreto.test.tsx`, `components/auth/OwnerLoginModal.test.tsx`

**Interfaces:**
- Consumes:
  - `destinoPorCargo` e `lerCargo` (Task 4);
  - o `useRouter`.
- Produces:
  - `EntrarEquipe(): JSX.Element`, seguindo o spec 5.4:
    - **Botão:** pílula "Entrar" com ícone; no celular, só o ícone.
    - **Painel lateral:** abre pela direita, com `role="dialog"` e título "ÁREA DA EQUIPE". Contém:
      - e-mail e senha, com "Mostrar";
      - "Receber link de acesso por e-mail" (`signInWithOtp`, `emailRedirectTo: <origem>/login`);
      - "Esqueci minha senha" (`resetPasswordForEmail`, redirect `/criar-senha`);
      - WhatsApp de suporte.
    - **Já logado:** avatar com as iniciais + o cargo ("Coordenador", "Moderador" ou "Capitão"). O menu tem "Meu painel" e "Sair".
- **Mensagens exatas:**
  - "E-mail ou senha inválidos" quando `error.code === 'invalid_credentials'`;
  - "Confirme seu e-mail antes de entrar." quando `email_not_confirmed`;
  - conexão: "Não foi possível entrar. Verifique sua conexão e tente de novo.";
  - sem cargo: "Sua conta ainda não tem acesso à área da equipe. Fale com a coordenação." Nesse caso, também chama `signOut`;
  - link enviado: "Link enviado — confira seu e-mail".
- **`SiteHeader`:** o bloco "Painel ▼" (desktop) e o link "Painel" (celular) são substituídos por `<EntrarEquipe />`.
- **`/login`:** usa o mesmo formulário e, depois de entrar, `destinoPorCargo(cargo, searchParams.next)`.
- **`/criar-senha`:** formulário de nova senha (mínimo de 8 caracteres) com `updateUser({ password })`. Em seguida, `destinoPorCargo`.
- **`LogoSecreto`:** com 3 toques, se `lerCargo().ehDono`, faz `router.push('/proprietario')` sem abrir o modal.
- **`OwnerLoginModal`:** usa `error.code` como acima; limpa senha e erro ao fechar.

- [ ] **Step 1: testes que devem falhar**
  - `coordenador entra e vai para /coordenador`;
  - `moderador → /moderador`;
  - `capitão → /capitao`;
  - `sem cargo vê a mensagem e é deslogado`;
  - `email_not_confirmed mostra "Confirme seu e-mail antes de entrar."`;
  - `erro retornado com status 0 mostra a mensagem de conexão` (minor deferido da Fase 1);
  - `logado mostra "Coordenador" e nunca "Proprietário"` (com mock `ehDono: true`);
  - `LogoSecreto: dono logado + 3 toques → push('/proprietario') sem diálogo`;
  - `OwnerLoginModal: reabrir não mostra a senha antiga`.
- [ ] **Step 2: `npm test`.** Esperado: FAIL nos novos.
- [ ] **Step 3: implementar.**
- [ ] **Step 4: `npm test`.** Esperado: PASS. **`npm run build`.** Esperado: sem erros.
- [ ] **Step 5: Commit.**

---

### Task 6: Convites por e-mail

**Files:**
- Create: `app/api/convites/route.ts`, `lib/auth/convites.ts`
- Test: `lib/auth/convites.test.ts`

**Interfaces:**
- Produces:
  - **`convidar(entrada, deps): Promise<{ ok: true; jaTinhaConta: boolean } | { ok: false; status: 400 | 403; erro: string }>`:**
    - `entrada`: `{ email, cargo: 'coordenador'|'moderador'|'capitao', campeonatoId?: string }`;
    - `deps`: `{ quemChama: { cargo: Cargo; ehDono: boolean }; adminClient }`.
  - **Regras:**
    - só coordenador convida; `cargo = 'coordenador'` exige `ehDono`, senão `403` com "Só o proprietário convida coordenadores.";
    - moderador e capitão exigem `campeonatoId`, senão `400`;
    - se o e-mail já existe em `auth.users`, não chama `inviteUserByEmail` (Review Focus 5);
    - se não existe, chama `auth.admin.inviteUserByEmail(email, { redirectTo: <origem>/criar-senha })`;
    - depois define o cargo (service role) e cria o vínculo (`campeonato_moderadores`, ou `time_capitaes` com `time_id` nulo);
    - o limite de coordenadores vem da trigger da 0009, e o erro dela é devolvido como `400` com a mensagem da trigger.
  - **`POST /api/convites`:** lê a sessão, chama `lerCargo` e `convidar`, e responde com JSON.

- [ ] **Step 1: testes que devem falhar.** O admin client é um fake em memória.
  - `coordenador convida moderador com campeonato`;
  - `coordenador não convida coordenador (403)`;
  - `dono convida coordenador`;
  - `moderador sem campeonato → 400`;
  - `e-mail existente não chama inviteUserByEmail e retorna jaTinhaConta true` (Review Focus 5);
  - `moderador/capitão não convidam ninguém (403)`.
- [ ] **Step 2: `npx vitest run lib/auth/convites.test.ts`.** Esperado: FAIL.
- [ ] **Step 3: implementar.**
- [ ] **Step 4: o teste passa e `npm test` fica verde.**
- [ ] **Step 5: Commit.**

---

### Task 7: Área do proprietário de verdade

**Files:**
- Rewrite: `app/(coord)/proprietario/page.tsx` (Server Component que chama `notFound()` para quem não é o dono e renderiza o cliente abaixo)
- Create: `components/proprietario/GestaoCoordenadores.tsx`
- Test: `components/proprietario/GestaoCoordenadores.test.tsx`

**Interfaces:**
- Consumes:
  - `POST /api/convites` (Task 6);
  - `rpc('definir_cargo')` e `rpc('definir_limite_coordenadores')` (Task 2).
- Produces:
  - **`GestaoCoordenadores({ coordenadores, limite, donoId })`:**
    - lista os coordenadores (nome, e-mail), com o dono marcado como "Você";
    - "Convidar coordenador" (e-mail), desabilitado quando atingir o limite, com o aviso "Limite de N coordenadores atingido — aumente o limite para convidar mais.";
    - "Remover", que chama `definir_cargo(id, 'autenticado')`, com confirmação dentro da própria página;
    - campo "Limite de coordenadores" (número, mínimo 1). Ao salvar um valor menor que o atual, aparece a lista para marcar quem sai, e só então chama `definir_limite_coordenadores(n, remover)`.
  - **Removido:** o painel falso atual (listas fixas, login próprio, `useState` com e-mails inventados).

- [ ] **Step 1: testes que devem falhar**
  - `mostra o dono como "Você" e nunca "Proprietário"`;
  - `convidar desabilitado no limite`;
  - `baixar o limite pede para escolher quem sai e envia remover`;
  - `remover chama definir_cargo com autenticado`.
- [ ] **Step 2: rodar.** Esperado: FAIL.
- [ ] **Step 3: implementar.**
- [ ] **Step 4: rodar.** Esperado: PASS. `npm run build` OK.
- [ ] **Step 5: Commit.**

---

### Task 8: Painéis reais da coordenação, do moderador e do capitão

**Files:**
- Rewrite:
  - `app/(coord)/coordenador/page.tsx`: renderiza o `CoordShell` real e remove o painel falso;
  - `app/painel/page.tsx`: redireciona para `/coordenador`.
- Modify: `components/coord-shell.tsx`. Remove o e-mail fixo e as abas que não existem.
- Rewrite: `components/coord-moderadores.tsx` e `components/coord-capitaes.tsx`. Os dois deixam de criar usuário e senha próprios e passam a usar convites por campeonato.
- Rewrite: `app/(coord)/moderador/page.tsx` e create `components/moderador/ResultadosCampeonato.tsx`.
- Rewrite: `app/(coord)/capitao/page.tsx` e create `components/capitao/MinhaEquipe.tsx`. Reaproveita `capitao-elenco.tsx` para os jogadores.
- Test:
  - `components/moderador/ResultadosCampeonato.test.tsx`;
  - `components/capitao/MinhaEquipe.test.tsx`;
  - `components/coord-moderadores.test.tsx`.

**Interfaces:**
- Consumes:
  - `POST /api/convites` (Task 6);
  - `rpc('criar_minha_equipe')` (Task 3);
  - as tabelas com as políticas da Task 3.
- Produces:
  - **Aba "MODERADORES"** (coordenação):
    - escolher o campeonato, informar o e-mail e clicar em "Convidar moderador";
    - lista de `campeonato_moderadores` do campeonato, com "Remover vínculo".
  - **Aba "CAPITÃES"** (coordenação):
    - escolher o campeonato, informar o e-mail e clicar em "Convidar capitão";
    - lista de convites, com o status "Equipe cadastrada: <nome>" ou "Aguardando equipe".
  - **`/moderador`:**
    - lista os campeonatos ligados ao moderador;
    - para cada jogo: placar e placar do 1º tempo, status, eventos (gol ou cartão, com minuto, jogador e time) e o botão "Salvar resultado";
    - abaixo, a classificação (`v_classificacao`).
    - **Sem campeonato ligado:** "Nenhum campeonato liberado para você ainda. Fale com a coordenação."
  - **`/capitao`:**
    - para cada convite sem equipe, o formulário "CADASTRAR MINHA EQUIPE" (nome, sigla, escudo), que chama `criar_minha_equipe`;
    - com equipe, mostra o elenco (`capitao-elenco`), onde é possível adicionar e remover jogadores, além dos próximos jogos e da classificação, só para leitura.

- [ ] **Step 1: testes que devem falhar** (supabase mockado)
  - `moderador sem campeonato vê a mensagem`;
  - `moderador salva placar com update apenas de placar/status`: o payload não tem `data` nem `local`;
  - `capitão sem equipe vê o formulário e chama criar_minha_equipe`;
  - `capitão vê a mensagem do banco quando já tem equipe`;
  - `coordenação convida moderador chamando /api/convites com cargo moderador e campeonatoId`.
- [ ] **Step 2: rodar.** Esperado: FAIL.
- [ ] **Step 3: implementar.**
- [ ] **Step 4: rodar `npm test`.** Esperado: PASS. `npm run build` OK. **Smoke local** com o banco de TESTES (`.env.test.local` copiado como env do `next dev`): entrar como coordenador, convidar um moderador e um capitão, entrar como capitão, cadastrar a equipe, entrar como moderador e lançar um placar. A classificação deve mudar.
- [ ] **Step 5: Commit.**

---

### Task 9: Lint mais rígido para o código novo e entrega em produção

**Files:**
- Modify: `eslint.config.mjs`. Os rebaixamentos para `warn` passam a valer só para os arquivos legados, com `files: [...]` listando os que ainda geram aviso. Arquivos novos (`components/auth/**`, `components/proprietario/**`, `components/moderador/**`, `components/capitao/**`, `lib/**`) ficam com as regras em `error`.
- Create (fora do repo): `../supabase-FASE2-producao.sql`, a concatenação da `0009` + `0010`.

- [ ] **Step 1: rodar `npm run lint`.** Esperado: 0 errors.
- [ ] **Step 2: rodar `npm run typecheck && npm test && npm run test:db && npm run build`.** Esperado: tudo verde.
- [ ] **Step 3 (dono, com o agente guiando):**
  1. Antes de aplicar em produção, o dono faz um backup do banco. No Supabase: **Database → Backups**. Se o plano grátis não oferecer, o agente gera um backup só de leitura via `pg_dump`, com a URL de produção que o dono colocar no `.env.local` como `PROD_DATABASE_URL`.
  2. O dono cola o `supabase-FASE2-producao.sql` no SQL Editor e roda.
  3. O agente confere pela API:
     - o dono aparece com `role = coordenador`;
     - `proprietario` tem 1 linha;
     - um usuário comum não consegue mudar o cargo (teste com a conta `arenavale2026@gmail.com`).
- [ ] **Step 4: push da branch e smoke na prévia da Vercel.** Testar o botão "Entrar" com o dono, com um coordenador, com o toque triplo e com `/proprietario` aberto sem login (deve dar 404).
- [ ] **Step 5: Commit e relatório ao dono.**
